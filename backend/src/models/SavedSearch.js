import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    filters: {
      city: String,
      minRent: Number,
      maxRent: Number,
      genderAllowed: String,
      type: String,
      verified: Boolean,
      sort: {
        type: String,
        default: 'newest',
      },
    },
    alertsEnabled: {
      type: Boolean,
      default: false,
    },
    lastAlertSent: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const SavedSearch = mongoose.model('SavedSearch', savedSearchSchema);
export default SavedSearch;
