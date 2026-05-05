const SavedListing = require('../models/SavedListing');
const PGListing = require('../models/PGListing');
const AppError = require('../utils/AppError');

/**
 * Toggle save/unsave a PG listing
 * Returns { saved: true } if newly saved, { saved: false } if removed
 */
exports.toggleSave = async (studentId, pgId) => {
  const pg = await PGListing.findById(pgId);
  if (!pg) throw new AppError('PG listing not found.', 404);

  const existing = await SavedListing.findOne({ student: studentId, pg: pgId });

  if (existing) {
    await existing.deleteOne();
    await PGListing.findByIdAndUpdate(pgId, { $inc: { 'analytics.saves': -1 } });
    return { saved: false };
  }

  await SavedListing.create({ student: studentId, pg: pgId });
  await PGListing.findByIdAndUpdate(pgId, { $inc: { 'analytics.saves': 1 } });
  return { saved: true };
};

/**
 * Get all saved PG listings for a student
 */
exports.getSavedListings = async (studentId) => {
  return SavedListing.find({ student: studentId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'pg',
      populate: { path: 'owner', select: 'name email' },
    })
    .lean();
};

/**
 * Check if a list of PG IDs are saved by a student
 */
exports.checkSavedStatus = async (studentId, pgIds) => {
  const saved = await SavedListing.find({
    student: studentId,
    pg: { $in: pgIds },
  }).lean();
  return saved.map((s) => s.pg.toString());
};
