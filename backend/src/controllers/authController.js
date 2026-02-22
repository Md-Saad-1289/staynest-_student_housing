import User from '../models/User.js';
import { generateToken, validateEmail, validateMobile } from '../utils/helpers.js';
import validator from 'validator';

// Register (minimal)
const register = async (req, res) => {
  try {
    const { name, email, mobile, phoneNo, password, role, nidNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' });

    const userRole = role || 'student';
    if (!['student', 'owner'].includes(userRole)) return res.status(400).json({ error: 'Invalid role' });

    // Accept either `phoneNo` or legacy `mobile`
    const finalPhone = (phoneNo || mobile || '').trim();
    if (finalPhone && !validateMobile(finalPhone)) return res.status(400).json({ error: 'Invalid phone number' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNo: finalPhone,
      mobile: finalPhone,
      passwordHash: password,
      role: userRole,
      isVerified: userRole !== 'owner',
      nidNumber: ''
    });

    await user.save();
    const token = generateToken(user._id, user.role);

    return res.status(201).json({ token, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile || user.phoneNo,
      role: user.role,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      nidNumber: user.nidNumber,
      createdAt: user.createdAt
    }});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user._id, user.role);
    return res.json({ token, user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile || user.phoneNo,
      role: user.role,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      nidNumber: user.nidNumber,
      createdAt: user.createdAt
    }});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get current user (minimal)
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile || user.phoneNo,
      fullAddress: user.fullAddress,
      dob: user.dob,
      gender: user.gender,
      emergencyContact: user.emergencyContact,
      profileImage: user.profileImage,
      role: user.role,
      isVerified: user.isVerified,
      nidNumber: user.role === 'owner' ? user.nidNumber : undefined,
      createdAt: user.createdAt
    }});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Update profile (secure, whitelist-based)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Allowed fields
    const allowedCommon = ['name', 'phoneNo', 'mobile', 'fullAddress', 'dob', 'gender', 'emergencyContact', 'profileImage'];
    const allowedOwner = [...allowedCommon, 'nidNumber'];
    const allowed = user.role === 'owner' ? allowedOwner : allowedCommon;

    // Reject attempts to change protected fields
    const forbidden = ['email', 'role', 'isVerified', 'password', 'passwordHash', 'createdAt'];
    for (const f of forbidden) {
      if (Object.prototype.hasOwnProperty.call(req.body, f)) {
        return res.status(400).json({ error: `Cannot update field: ${f}` });
      }
    }

    // Students cannot send nidNumber
    if (user.role === 'student' && Object.prototype.hasOwnProperty.call(req.body, 'nidNumber')) {
      return res.status(400).json({ error: 'Students cannot provide nidNumber' });
    }

    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        let val = req.body[key];

        if (key === 'profileImage') {
          if (typeof val === 'string' && validator.isURL(val, { protocols: ['http', 'https'], require_protocol: true })) {
            updates.profileImage = val.trim();
          }
          continue;
        }

        if (key === 'dob') {
          const d = new Date(val);
          if (isNaN(d.getTime())) return res.status(400).json({ error: 'Invalid dob' });
          updates.dob = d;
          continue;
        }

        // normalize mobile/phoneNo: set both fields when provided
        if (key === 'phoneNo' || key === 'mobile') {
          const s = typeof val === 'string' ? validator.escape(val.trim()) : val;
          updates.phoneNo = s;
          updates.mobile = s;
          continue;
        }

        if (typeof val === 'string') updates[key] = validator.escape(val.trim());
        else updates[key] = val;
      }
    }

    // Owner must have nidNumber saved or provided
    if (user.role === 'owner') {
      const finalNid = updates.nidNumber || user.nidNumber || '';
      if (!finalNid) return res.status(400).json({ error: 'nidNumber is required for owner' });
      updates.nidNumber = String(finalNid).trim();
    }

    // Apply updates explicitly
    Object.keys(updates).forEach(k => { user[k] = updates[k]; });
    await user.save();

    return res.json({ user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.phoneNo,
      fullAddress: user.fullAddress,
      dob: user.dob,
      gender: user.gender,
      emergencyContact: user.emergencyContact,
      profileImage: user.profileImage,
      role: user.role,
      isVerified: user.isVerified,
      nidNumber: user.role === 'owner' ? user.nidNumber : undefined,
      createdAt: user.createdAt
    }});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 chars' });

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ error: 'Current password incorrect' });

    user.passwordHash = newPassword;
    await user.save();
    return res.json({ message: 'Password changed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export { register, login, getCurrentUser, updateProfile, changePassword };
