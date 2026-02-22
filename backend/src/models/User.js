import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    // core identifier — immutable
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, immutable: true },

    // phone number (preferred name)
    phoneNo: { type: String, trim: true, default: '' },

    // single address string
    fullAddress: { type: String, trim: true, default: '' },

    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    emergencyContact: { type: String, trim: true, default: '' },

    // Profile image: URL only
    profileImage: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          return v === '' || validator.isURL(v, { protocols: ['http', 'https'], require_protocol: true });
        },
        message: 'profileImage must be a valid http(s) URL'
      }
    },

    role: { type: String, enum: ['student', 'owner'], required: true, immutable: true },
    isVerified: { type: Boolean, default: false },

    // Owner-only required field
    nidNumber: { type: String, trim: true, default: '', required: function () { return this.role === 'owner'; } },

    // password hash storage
    passwordHash: { type: String, required: true, select: false }
  },
  { timestamps: true }
);

// Compatibility virtuals for existing code that uses `mobile` and emergencyContactName/Phone
userSchema.virtual('mobile')
  .get(function () { return this.phoneNo; })
  .set(function (v) { this.phoneNo = v; });

userSchema.virtual('emergencyContactName')
  .get(function () {
    if (!this.emergencyContact) return '';
    const parts = this.emergencyContact.split('|');
    return parts[0] || '';
  });

userSchema.virtual('emergencyContactPhone')
  .get(function () {
    if (!this.emergencyContact) return '';
    const parts = this.emergencyContact.split('|');
    return parts[1] || '';
  });

// Hash password before saving (on create or change)
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
