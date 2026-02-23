import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Auth middleware: JWT verify করে user attach করে request-এ
 */
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id || decoded._id;
    let role = decoded.role || decoded.userRole || null;

    // If token payload didn't include role (older tokens), fetch it from DB.
    if (!role && userId) {
      try {
        const user = await User.findById(userId).select('role');
        role = user?.role || null;
      } catch (e) {
        // noop - leave role null and let authorize handle permission denial
      }
    }

    req.user = { userId, role };

    if (!req.user.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    next();
  } catch (error) {
    if (error.message === 'JWT_SECRET is not configured in environment variables') {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Role-based access control
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export { auth, authorize };
