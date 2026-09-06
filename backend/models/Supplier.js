import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
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
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

supplierSchema.index({ company: 1, name: 1 }, { unique: true });

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
