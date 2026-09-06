import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
      index: true,
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    threshold: {
      type: Number,
      required: [true, 'Threshold is required'],
      min: [0, 'Threshold cannot be negative'],
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    isLowStock: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    unitPrice: {
      type: Number,
      min: [0, 'Unit price cannot be negative'],
      default: 0,
    },
  },
  { timestamps: true }
);

inventorySchema.pre('validate', function syncLowStock(next) {
  const quantity = Number(this.quantity ?? 0);
  const threshold = Number(this.threshold ?? 0);
  this.isLowStock = quantity < threshold;
  next();
});

inventorySchema.index({ company: 1, itemName: 1 }, { unique: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
