import jwt from 'jsonwebtoken';

/**
 * Auth middleware: JWT verify করে user attach করে request-এ
 */
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId || decoded.id || decoded._id,
      role: decoded.role || decoded.userRole || null,
    };

    if (!req.user.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    next();
  } catch (error) {
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
