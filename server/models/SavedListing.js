const mongoose = require('mongoose');

const savedListingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PGListing',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate saves
savedListingSchema.index({ student: 1, pg: 1 }, { unique: true });
savedListingSchema.index({ student: 1 });

module.exports = mongoose.model('SavedListing', savedListingSchema);
