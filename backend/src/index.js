import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB } from './utils/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import flagRoutes from './routes/flags.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import savedSearchRoutes from './routes/savedSearches.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://nestrostay.onrender.com",  // frontend URL
  ],
  credentials: true,
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/flags', flagRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/saved-searches', savedSearchRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
