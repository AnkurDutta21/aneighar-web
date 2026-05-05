const mongoose = require('mongoose');

const amenityEnum = [
  'wifi', 'ac', 'parking', 'laundry', 'meals', 'gym',
  'cctv', 'housekeeping', 'water_purifier', 'power_backup',
];

const pgListingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    location: {
      address: { type: String, required: [true, 'Address is required'] },
      city: { type: String, required: [true, 'City is required'], lowercase: true, trim: true },
      state: { type: String, required: [true, 'State is required'] },
      pincode: { type: String, required: [true, 'Pincode is required'] },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    rent: {
      type: Number,
      required: [true, 'Rent is required'],
      min: [0, 'Rent cannot be negative'],
    },
    deposit: {
      type: Number,
      default: 0,
      min: [0, 'Deposit cannot be negative'],
    },
    genderPreference: {
      type: String,
      enum: ['male', 'female', 'any'],
      required: [true, 'Gender preference is required'],
    },
    roomType: {
      type: String,
      enum: ['single', 'double', 'triple', 'dormitory'],
      required: [true, 'Room type is required'],
    },
    amenities: [
      {
        type: String,
        enum: amenityEnum,
      },
    ],
    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },
    availableRooms: {
      type: Number,
      required: true,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rules: [{ type: String, trim: true }],
    // Analytics
    analytics: {
      views: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      inquiries: { type: Number, default: 0 },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient filtering
pgListingSchema.index({ 'location.city': 1 });
pgListingSchema.index({ rent: 1 });
pgListingSchema.index({ genderPreference: 1 });
pgListingSchema.index({ isAvailable: 1 });
pgListingSchema.index({ owner: 1 });
pgListingSchema.index({ 'location.city': 1, rent: 1, genderPreference: 1 });

// Soft delete filter
pgListingSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('PGListing', pgListingSchema);
