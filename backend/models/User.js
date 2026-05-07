import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ALLOWED_ROLES, ROLES } from '../utils/roles.js';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/;
const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
      validate: {
        validator: (value) => PASSWORD_REGEX.test(value),
        message:
          'Password must be at least 10 characters and include uppercase, lowercase, number, and special character.',
      },
    },
    roles: {
      type: [String],
      enum: {
        values: ALLOWED_ROLES,
        message: '{VALUE} is not an allowed role',
      },
      default: [ROLES.EMPLOYEE],
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    designation: {
      type: String,
      trim: true,
      default: '',
    },
    joiningDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const hashed = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hashed;
    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
