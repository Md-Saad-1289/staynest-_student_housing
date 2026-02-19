import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB, disconnectDB } from './utils/db.js';

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

// Simple rate limiting middleware
const createRateLimiter = (maxRequests = 5, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const userRequests = requests.get(ip).filter(time => now - time < windowMs);
    userRequests.push(now);
    requests.set(ip, userRequests);
    
    if (userRequests.length > maxRequests) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }
    
    next();
  };
};

const authLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// Middleware
// Configure CORS using environment variables so deployed frontend origins are respected
const FRONTEND_ORIGINS = [];
if (process.env.FRONTEND_URL_PROD) FRONTEND_ORIGINS.push(process.env.FRONTEND_URL_PROD);
if (process.env.FRONTEND_URL_DEV) FRONTEND_ORIGINS.push(process.env.FRONTEND_URL_DEV);
if (process.env.FRONTEND_URL_EXTRA) FRONTEND_ORIGINS.push(process.env.FRONTEND_URL_EXTRA);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);
    if (FRONTEND_ORIGINS.length === 0) return callback(null, true);
    if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'), false);
  },
  credentials: true,
  optionsSuccessStatus: 204,
}));

app.use(express.json());

// Start server after DB connection for safer startup
let server;
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Routes with rate limiting on auth endpoints
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/flags', flagRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/saved-searches', savedSearchRoutes);
// Also mount routes without the /api/v1 prefix to support frontends
// that use a BASE URL without the versioned path (common in env configs)
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
app.use('/auth', authRoutes);
app.use('/listings', listingRoutes);
app.use('/bookings', bookingRoutes);
app.use('/reviews', reviewRoutes);
app.use('/flags', flagRoutes);
app.use('/admin', adminRoutes);
app.use('/notifications', notificationRoutes);
app.use('/saved-searches', savedSearchRoutes);

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

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  try {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    if (server && server.close) {
      server.close(() => console.log('HTTP server closed'));
    }
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

export default app;
