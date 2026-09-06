import mongoose from 'mongoose';
import {
  ALLOWED_FEATURES,
  FEATURE_KEYS,
  normalizeEnabledFeatures,
} from '../utils/features.js';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    enabledFeatures: {
      type: [String],
      enum: {
        values: ALLOWED_FEATURES,
        message: '{VALUE} is not an allowed feature',
      },
      default: () => [FEATURE_KEYS.DASHBOARD],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

companySchema.pre('validate', function ensureFeatures(next) {
  this.enabledFeatures = normalizeEnabledFeatures(this.enabledFeatures);
  return next();
});

const Company = mongoose.model('Company', companySchema);

export default Company;
