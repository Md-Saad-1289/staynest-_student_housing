import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.put('/:notificationId/read', auth, markAsRead);
router.put('/read-all', auth, markAllAsRead);
router.delete('/:notificationId', auth, deleteNotification);

export default router;
