import mongoose from 'mongoose';

export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LEAVE: 'leave',
});

const attendanceSchema = new mongoose.Schema(
  {
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

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
