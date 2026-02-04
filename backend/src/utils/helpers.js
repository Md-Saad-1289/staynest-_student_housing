import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateMobile = (mobile) => {
  const re = /^(\+880|0)?1[3-9]\d{8}$/;
  return re.test(mobile);
};

export { generateToken, validateEmail, validateMobile };
