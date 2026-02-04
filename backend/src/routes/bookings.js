import express from 'express';
import {
  createBooking,
  getOwnerBookings,
  updateBookingStatus,
  getStudentBookings,
} from '../controllers/bookingController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, authorize('student'), createBooking);
router.get('/owner', auth, authorize('owner'), getOwnerBookings);
router.get('/student', auth, authorize('student'), getStudentBookings);
router.put('/:id/status', auth, authorize('owner'), updateBookingStatus);

export default router;
