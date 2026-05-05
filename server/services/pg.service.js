const PGListing = require('../models/PGListing');
const AppError = require('../utils/AppError');

/**
 * Build a MongoDB filter object from query params
 */
const buildFilter = (query) => {
  const filter = {};

  if (query.city) filter['location.city'] = { $regex: query.city, $options: 'i' };
  if (query.gender) filter.genderPreference = query.gender;
  if (query.roomType) filter.roomType = query.roomType;
  if (query.isAvailable !== undefined) filter.isAvailable = query.isAvailable === 'true';

  if (query.minPrice || query.maxPrice) {
    filter.rent = {};
    if (query.minPrice) filter.rent.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.rent.$lte = Number(query.maxPrice);
  }

  if (query.amenities) {
    const amenitiesArr = Array.isArray(query.amenities)
      ? query.amenities
      : query.amenities.split(',');
    filter.amenities = { $all: amenitiesArr };
  }

  return filter;
};

/**
 * Get all PG listings with filtering, sorting, and pagination
 */
exports.getAllPGs = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, parseInt(query.limit) || 12);
  const skip = (page - 1) * limit;

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { rent: 1 },
    price_desc: { rent: -1 },
    popular: { 'analytics.views': -1 },
  };
  const sort = sortOptions[query.sort] || { createdAt: -1 };

  const filter = buildFilter(query);

  const [listings, total] = await Promise.all([
    PGListing.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name email phone avatar')
      .lean(),
    PGListing.countDocuments(filter),
  ]);

  return {
    listings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Get a single PG by ID and increment view count
 */
exports.getPGById = async (id) => {
  const pg = await PGListing.findByIdAndUpdate(
    id,
    { $inc: { 'analytics.views': 1 } },
    { new: true }
  ).populate('owner', 'name email phone avatar');

  if (!pg) throw new AppError('PG listing not found.', 404);
  return pg;
};

/**
 * Create a new PG listing
 */
exports.createPG = async (ownerId, data) => {
  const pg = await PGListing.create({ ...data, owner: ownerId });
  return pg;
};

/**
 * Update a PG listing (owner only)
 */
exports.updatePG = async (id, ownerId, data) => {
  const pg = await PGListing.findOne({ _id: id, owner: ownerId });
  if (!pg) throw new AppError('PG not found or you are not authorized to update it.', 404);

  Object.assign(pg, data);
  await pg.save();
  return pg;
};

/**
 * Soft delete a PG listing (owner only)
 */
exports.deletePG = async (id, ownerId) => {
  const pg = await PGListing.findOneAndUpdate(
    { _id: id, owner: ownerId },
    { isDeleted: true },
    { new: true }
  );
  if (!pg) throw new AppError('PG not found or you are not authorized to delete it.', 404);
  return pg;
};

/**
 * Add images to a PG listing
 */
exports.addImages = async (id, ownerId, files) => {
  const pg = await PGListing.findOne({ _id: id, owner: ownerId });
  if (!pg) throw new AppError('PG not found or not authorized.', 404);

  const newImages = files.map((f) => ({ url: f.path, publicId: f.filename }));
  pg.images.push(...newImages);
  await pg.save();
  return pg;
};

/**
 * Remove an image from a PG listing
 */
exports.removeImage = async (id, ownerId, publicId, cloudinary) => {
  const pg = await PGListing.findOne({ _id: id, owner: ownerId });
  if (!pg) throw new AppError('PG not found or not authorized.', 404);

  await cloudinary.uploader.destroy(publicId);
  pg.images = pg.images.filter((img) => img.publicId !== publicId);
  await pg.save();
  return pg;
};

/**
 * Get all PG listings by the logged-in owner
 */
exports.getOwnerPGs = async (ownerId) => {
  return PGListing.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
};
