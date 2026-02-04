import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Normalize token payload for robustness across token shapes
    req.user = {
      userId: decoded.userId || decoded.id || decoded._id,
      role: decoded.role || decoded.userRole || null,
    };

    if (!req.user.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export { auth, authorize };
