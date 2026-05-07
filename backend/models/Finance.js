import mongoose from 'mongoose';

export const FINANCE_TYPE = Object.freeze({
  EXPENSE: 'expense',
  REVENUE: 'revenue',
});

const financeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: Object.values(FINANCE_TYPE),
        message: 'Invalid finance type',
      },
      required: [true, 'Type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
  },
  { timestamps: true }
);

const Finance = mongoose.model('Finance', financeSchema);

export default Finance;
