const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PGListing',
      required: [true, 'Review must belong to a PG listing'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [5, 'Comment must be at least 5 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
);

// Enforce 1 review per student per PG listing
reviewSchema.index({ pg: 1, user: 1 }, { unique: true });

// Calculate average ratings for a PG
reviewSchema.statics.calcAverageRatings = async function (pgId) {
  const stats = await this.aggregate([
    { $match: { pg: pgId } },
    {
      $group: {
        _id: '$pg',
        numReviews: { $sum: 1 },
        ratingAverage: { $avg: '$rating' },
      },
    },
  ]);

  const PGListing = mongoose.model('PGListing');
  if (stats.length > 0) {
    await PGListing.findByIdAndUpdate(pgId, {
      ratingAverage: Math.round(stats[0].ratingAverage * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await PGListing.findByIdAndUpdate(pgId, {
      ratingAverage: 0,
      numReviews: 0,
    });
  }
};

// Recalculate average on post-save and post-remove
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.pg);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.pg);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
