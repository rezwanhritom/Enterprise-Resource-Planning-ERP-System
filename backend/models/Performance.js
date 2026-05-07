import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Manager is required'],
    },
    note: {
      type: String,
      required: [true, 'Performance note is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating cannot be less than 1'],
      max: [5, 'Rating cannot be greater than 5'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    goals: {
      type: String,
      trim: true,
      default: '',
    },
    improvementAreas: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Performance = mongoose.model('Performance', performanceSchema);

export default Performance;
