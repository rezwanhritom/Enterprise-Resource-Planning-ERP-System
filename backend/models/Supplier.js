import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      unique: true,
    },
    contact: {
      type: String,
      required: [true, 'Supplier contact is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
