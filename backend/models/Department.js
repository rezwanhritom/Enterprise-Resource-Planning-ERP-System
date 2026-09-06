import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

departmentSchema.index({ company: 1, name: 1 }, { unique: true });

const Department = mongoose.model('Department', departmentSchema);

export default Department;
