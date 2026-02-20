import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';

// Create booking request
const createBooking = async (req, res) => {
  try {
    const { listingId, moveInDate, notes } = req.body;

    if (!listingId || !moveInDate) {
      return res.status(400).json({ error: 'Listing ID and move-in date required' });
    }

    // Validate ObjectId to avoid CastError when consumers send mock or invalid ids
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ error: 'Invalid listingId format' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const booking = new Booking({
      listingId,
      studentId: req.user.userId,
      moveInDate: new Date(moveInDate),
      notes,
      status: 'pending',
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking request submitted',
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get booking requests for owner
const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    // validate ownerId
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ error: 'Invalid owner id' });
    }
    // Use aggregation to efficiently filter bookings for owner's listings
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: 'listings',
          localField: 'listingId',
          foreignField: '_id',
          as: 'listing',
        },
      },
      {
        $unwind: '$listing',
      },
      {
        $match: {
          'listing.ownerId': new mongoose.Types.ObjectId(ownerId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student',
        },
      },
      {
        $unwind: '$student',
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update booking status (owner only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // validate booking id
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid booking id' });
    }

    const booking = await Booking.findById(req.params.id).populate('listingId');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.listingId.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: 'Booking status updated',
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get student's bookings
const getStudentBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.userId })
      .populate('listingId')
      .populate('studentId', 'name email');

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bookings for a listing (public - for displaying approved bookings)
const getListingBookings = async (req, res) => {
  try {
    const { listingId, status } = req.query;

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID required' });
    }

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ error: 'Invalid listing ID format' });
    }

    const query = { listingId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createBooking,
  getOwnerBookings,
  updateBookingStatus,
  getStudentBookings,
  getListingBookings,
};
