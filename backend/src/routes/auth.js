import express from 'express';
import { register, login, getCurrentUser, updateProfile, changePassword } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getCurrentUser);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);

export default router;
