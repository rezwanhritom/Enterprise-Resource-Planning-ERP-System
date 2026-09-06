import Attendance, { ATTENDANCE_STATUS } from '../models/Attendance.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getCompanyId, companyFilter } from '../utils/companyScope.js';

const allowedStatus = Object.values(ATTENDANCE_STATUS);

const getNormalizedToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const parseNumericQuery = (value, label) => {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new ApiError(400, `${label} query must be a valid number`);
  }
  return parsed;
};

export const markAttendance = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized user');
  }

  const companyId = getCompanyId(req.user);
  if (!companyId) {
    throw new ApiError(400, 'User is not linked to a company');
  }

  const status =
    typeof req.body?.status === 'string'
      ? req.body.status.trim().toLowerCase()
      : ATTENDANCE_STATUS.PRESENT;

  if (!allowedStatus.includes(status)) {
    throw new ApiError(400, 'Invalid attendance status');
  }

  const attendanceDate = getNormalizedToday();

  const existing = await Attendance.findOne({
    userId: req.user._id,
    date: attendanceDate,
    ...companyFilter(req.user),
  });

  if (existing) {
    throw new ApiError(409, 'Attendance already marked for today');
  }

  const attendance = await Attendance.create({
    userId: req.user._id,
    date: attendanceDate,
    status,
    company: companyId,
  });

  return res.status(201).json({
    success: true,
    message: 'Attendance marked successfully',
    data: attendance,
  });
});

export const getAttendanceByUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized user');
  }

  const year = parseNumericQuery(req.query?.year, 'Year');
  const month = parseNumericQuery(req.query?.month, 'Month');

  if (month !== undefined && (month < 1 || month > 12)) {
    throw new ApiError(400, 'Month must be between 1 and 12');
  }

  if (year !== undefined && (year < 1970 || year > 3000)) {
    throw new ApiError(400, 'Year must be between 1970 and 3000');
  }

  const filter = { userId: req.user._id, ...companyFilter(req.user) };

  if (year !== undefined || month !== undefined) {
    const targetYear = year ?? new Date().getFullYear();
    const targetMonthIndex = month !== undefined ? month - 1 : 0;
    const startDate = new Date(targetYear, targetMonthIndex, 1);
    const endDate =
      month !== undefined
        ? new Date(targetYear, targetMonthIndex + 1, 1)
        : new Date(targetYear + 1, 0, 1);
    filter.date = { $gte: startDate, $lt: endDate };
  }

  const attendance = await Attendance.find(filter).sort({ date: -1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Attendance records fetched successfully',
    data: attendance,
  });
});

export const getAllAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({ ...companyFilter(req.user) })
    .populate('userId', 'name email')
    .sort({ date: -1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Attendance records fetched successfully',
    data: records,
  });
});
