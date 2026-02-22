import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      enum: ['Dhaka', 'Chittagong', 'Sylhet', 'Khulna', 'Rajshahi', 'Barisal'],
      required: true,
    },
    location: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
    type: {
      type: String,
      enum: ['mess', 'hostel'],
      required: true,
    },
    rent: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    genderAllowed: {
      type: String,
      enum: ['male', 'female', 'both'],
      required: true,
    },
    meals: {
      available: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'all', 'none'],
        default: 'none',
      },
    },
    facilities: {
      type: Map,
      of: Boolean,
      default: {},
    },
    photos: {
      type: [String],
      default: [],
    },
    rules: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    badges: {
      type: [String],
      enum: ['verified', 'topRated', 'femaleFriendly'],
      default: [],
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
