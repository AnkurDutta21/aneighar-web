const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    pg: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PGListing',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    phone: {
      type: String,
      match: [/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number'],
    },
    status: {
      type: String,
      enum: ['pending', 'viewed', 'responded', 'closed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

inquirySchema.index({ owner: 1, status: 1 });
inquirySchema.index({ student: 1 });
inquirySchema.index({ pg: 1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
