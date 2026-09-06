import mongoose from 'mongoose';

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LEAVE: 'leave',
});

const attendanceSchema = new mongoose.Schema(
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
      required: [true, 'User is required'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(ATTENDANCE_STATUS),
        message: 'Invalid attendance status',
      },
      required: true,
      default: ATTENDANCE_STATUS.PRESENT,
    },
    checkInAt: {
      type: Date,
    },
    checkOutAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

attendanceSchema.pre('validate', function normalizeDate(next) {
  if (this.date) {
    const normalizedDate = new Date(this.date);
    normalizedDate.setHours(0, 0, 0, 0);
    this.date = normalizedDate;
  }
  next();
});

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ company: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
