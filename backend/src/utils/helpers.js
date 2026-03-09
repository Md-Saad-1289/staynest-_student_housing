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
  if (!mobile) return true; // Optional field
  // Accept various phone formats: 10+ digits or with common formatting
  const cleanPhone = mobile.replace(/[\s\-\+\(\)]/g, '');
  return /^\d{10,}$/.test(cleanPhone);
};

export { generateToken, validateEmail, validateMobile };
