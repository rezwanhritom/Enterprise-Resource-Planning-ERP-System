import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    baseSalary: {
      type: Number,
      required: [true, 'Base salary is required'],
      min: [0, 'Base salary cannot be negative'],
    },
    attendanceDays: {
      type: Number,
      default: 0,
      min: [0, 'Attendance days cannot be negative'],
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, 'Deductions cannot be negative'],
    },
    bonus: {
      type: Number,
      default: 0,
      min: [0, 'Bonus cannot be negative'],
    },
    finalSalary: {
      type: Number,
      required: [true, 'Final salary is required'],
      min: [0, 'Final salary cannot be negative'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      trim: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

payrollSchema.index({ userId: 1, month: 1 }, { unique: true });
payrollSchema.index({ company: 1, month: 1 });

const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll;
