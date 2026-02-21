import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'owner', 'admin'],
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    nidImage: {
      type: String,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    university: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    linkedin: {
      type: String,
      default: null,
    },
    twitter: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    // Student/Profile Details
    dateOfBirth: {
      type: Date,
      default: null,
    },
    studentId: {
      type: String,
      default: null,
    },
    major: {
      type: String,
      default: null,
    },
    academicYear: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters', 'PhD', null],
      default: null,
    },
    // Address Details
    addressStreet: {
      type: String,
      default: null,
    },
    addressCity: {
      type: String,
      default: null,
    },
    addressZipCode: {
      type: String,
      default: null,
    },
    addressCountry: {
      type: String,
      default: null,
    },
    // Contact Preferences
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    // User Preferences
    budgetMin: {
      type: Number,
      default: null,
    },
    budgetMax: {
      type: Number,
      default: null,
    },
    roommatePreferences: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', null],
      default: null,
    },
    emergencyContactName: {
      type: String,
      default: null,
    },
    emergencyContactPhone: {
      type: String,
      default: null,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
    viewHistory: [
      {
        listingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Listing',
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
