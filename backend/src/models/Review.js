import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratings: {
      food: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      safety: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      owner: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      facilities: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      study: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
    },
    textReview: {
      type: String,
      required: true,
    },
    photos: [
      {
        type: String,
        default: null,
      },
    ],
    ownerReply: {
      type: String,
      default: null,
    },
    repliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
