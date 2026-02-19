import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Specific route MUST come before :notificationId route
router.put('/read-all', auth, markAllAsRead);

// General routes
router.get('/', auth, getNotifications);
router.put('/:notificationId/read', auth, markAsRead);
router.delete('/:notificationId', auth, deleteNotification);

export default router;
