const Review = require('../models/Review');
const PGListing = require('../models/PGListing');

exports.addOrUpdateReview = async (pgId, userId, { rating, comment }) => {
  const pg = await PGListing.findById(pgId);
  if (!pg) {
    const err = new Error('PG listing not found');
    err.statusCode = 404;
    throw err;
  }

  // Upsert review
  const review = await Review.findOneAndUpdate(
    { pg: pgId, user: userId },
    { rating, comment },
    { new: true, upsert: true, runValidators: true }
  ).populate('user', 'name avatar');

  // Trigger recalculation on model
  await Review.calcAverageRatings(pg._id);

  return review;
};

exports.getPGReviews = async (pgId, query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ pg: pgId })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  const total = await Review.countDocuments({ pg: pgId });

  // Calculate rating counts per star rating (1..5)
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const allPgReviews = await Review.find({ pg: pgId }).select('rating');
  allPgReviews.forEach((r) => {
    if (ratingDistribution[r.rating] !== undefined) {
      ratingDistribution[r.rating] += 1;
    }
  });

  return {
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    ratingDistribution,
  };
};

exports.deleteReview = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    throw err;
  }

  // Check ownership
  if (review.user.toString() !== userId.toString()) {
    const err = new Error('Not authorized to delete this review');
    err.statusCode = 403;
    throw err;
  }

  const pgId = review.pg;
  await review.deleteOne();
  await Review.calcAverageRatings(pgId);

  return true;
};
