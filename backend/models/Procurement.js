import mongoose from 'mongoose';

export const PROCUREMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const procurementItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Item quantity must be at least 1'],
    },
  },
  { _id: false }
);

const procurementSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requesting user is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    items: {
      type: [procurementItemSchema],
      required: [true, 'Request items are required'],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'At least one procurement item is required',
      },
    },
    status: {
      type: String,
      enum: {
        values: Object.values(PROCUREMENT_STATUS),
        message: 'Invalid procurement status',
      },
      default: PROCUREMENT_STATUS.PENDING,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

const Procurement = mongoose.model('Procurement', procurementSchema);

export default Procurement;
