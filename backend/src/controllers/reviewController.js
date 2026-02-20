import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';

// Create review (student only, after completed booking)
const createReview = async (req, res) => {
  try {
    const { bookingId, ratings, textReview } = req.body;

    if (!bookingId || !ratings || !textReview) {
      return res.status(400).json({ error: 'Booking ID, ratings, and review text required' });
    }

    // Validate ratings
    const { food, cleanliness, safety, owner, facilities, study } = ratings;
    if (![food, cleanliness, safety, owner, facilities, study].every((r) => r >= 1 && r <= 5)) {
      return res.status(400).json({ error: 'All ratings must be between 1 and 5' });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) return res.status(400).json({ error: 'Invalid booking id' });
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.studentId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed bookings' });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ error: 'Review already exists for this booking' });
    }

    const listing = await Listing.findById(booking.listingId);

    const review = new Review({
      bookingId,
      listingId: booking.listingId,
      studentId: req.user.userId,
      ownerId: listing.ownerId,
      ratings,
      textReview,
    });

    await review.save();

    // Update listing average rating and total ratings
    const allReviews = await Review.find({ listingId: booking.listingId });
    
    if (allReviews.length > 0) {
      // Calculate average for each category
      const categories = ['food', 'cleanliness', 'safety', 'owner', 'facilities', 'study'];
      const categoryAverages = {};
      
      categories.forEach(category => {
        const sum = allReviews.reduce((total, r) => total + (r.ratings?.[category] || 0), 0);
        categoryAverages[category] = parseFloat((sum / allReviews.length).toFixed(1));
      });
      
      const overallAverage = Object.values(categoryAverages).reduce((a, b) => a + b, 0) / categories.length;

      listing.totalRatings = allReviews.length;
      listing.averageRating = parseFloat(overallAverage.toFixed(1));
    } else {
      listing.totalRatings = 0;
      listing.averageRating = 0;
    }
    
    await listing.save();

    res.status(201).json({
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reviews for listing
const getListingReviews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.listingId)) return res.status(400).json({ error: 'Invalid listing id' });
    const reviews = await Review.find({ listingId: req.params.listingId })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Owner reply to review
const replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ error: 'Reply text required' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid review id' });
    const review = await Review.findById(req.params.id).populate('listingId');
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (review.ownerReply) {
      return res.status(400).json({ error: 'Already replied to this review' });
    }

    review.ownerReply = reply;
    review.repliedAt = new Date();
    await review.save();

    res.json({
      message: 'Reply added successfully',
      review,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createReview,
  getListingReviews,
  replyToReview,
};
