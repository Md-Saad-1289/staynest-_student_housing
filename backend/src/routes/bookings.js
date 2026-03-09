import express from 'express';
import {
  createBooking,
  getOwnerBookings,
  updateBookingStatus,
  getStudentBookings,
  getListingBookings,
} from '../controllers/bookingController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (more specific)
router.post('/', auth, authorize('student'), createBooking);
router.get('/owner', auth, authorize('owner'), getOwnerBookings);
router.get('/student', auth, authorize('student'), getStudentBookings);
router.put('/:id/status', auth, authorize('owner'), updateBookingStatus);

// Protected route - get bookings for a specific listing
router.get('/', auth, getListingBookings);

export default router;
