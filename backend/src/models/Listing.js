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
      default: 'Dhaka',
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
      default: 'hostel',
    },
    rent: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    furnished: {
      type: String,
      default: 'semi',
    },
    utilities: {
      type: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
        },
      ],
      default: [],
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
    amenities: {
      type: Map,
      of: Boolean,
      default: {},
    },
    photos: {
      type: [String],
      default: [],
    },
    // new room/bed structure for detailed property management
    rooms: {
      type: [
        {
          name: { type: String, required: true },
          type: { type: String, enum: ['Single','Shared','AC','Non-AC'], default: 'Shared' },
          description: { type: String, default: '' },
          images: { type: [String], default: [] },
          beds: [
            {
              bedNumber: Number,
              rent: { type: Number, required: true },
              status: { type: String, enum: ['Available','Booked','Vacant'], default: 'Available' },
              vacantDate: { type: Date, default: null },
              studentName: { type: String, default: '' },
              contact: { type: String, default: '' },
              advancePaid: { type: Boolean, default: false },
            },
          ],
        },
      ],
      default: [],
    },
    rules: {
      type: String,
      default: '',
    },
    contact: {
      type: String,
      default: ''
    },
    landmarks: {
      type: String,
      default: ''
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
