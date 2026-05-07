import mongoose from 'mongoose';
import Attendance, { ATTENDANCE_STATUS } from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const parseMoney = (value, fieldName, { required = false } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new ApiError(400, `${fieldName} is required`);
    }
    return 0;
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    throw new ApiError(400, `${fieldName} must be a valid number`);
  }
  if (numberValue < 0) {
    throw new ApiError(400, `${fieldName} cannot be negative`);
  }
  return numberValue;
};

const validateMonth = (month) => {
  if (typeof month !== 'string' || !MONTH_REGEX.test(month.trim())) {
    throw new ApiError(400, 'Month must be in YYYY-MM format');
  }
  return month.trim();
};

const getMonthRange = (month) => {
  const [yearText, monthText] = month.split('-');
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const start = new Date(year, monthIndex, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 1);
  end.setHours(0, 0, 0, 0);
  return { start, end };
};

export const calculateSalary = ({ baseSalary, bonus = 0, deductions = 0 }) => {
  const finalSalary = baseSalary + bonus - deductions;
  return finalSalary < 0 ? 0 : finalSalary;
};

export const generatePayroll = asyncHandler(async (req, res) => {
  const { userId, month } = req.body || {};

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'A valid employee userId is required');
  }

  const normalizedMonth = validateMonth(month);
  const baseSalary = parseMoney(req.body?.baseSalary, 'Base salary', {
    required: true,
  });
  const deductions = parseMoney(req.body?.deductions, 'Deductions');
  const bonus = parseMoney(req.body?.bonus, 'Bonus');

  const [employee, existingPayroll] = await Promise.all([
    User.findById(userId).select('_id name email isActive'),
    Payroll.findOne({ userId, month: normalizedMonth }).select('_id'),
  ]);

  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  if (!employee.isActive) {
    throw new ApiError(400, 'Cannot generate payroll for an inactive employee');
  }

  if (existingPayroll) {
    throw new ApiError(409, 'Payroll for this employee and month already exists');
  }

  const { start, end } = getMonthRange(normalizedMonth);
  const attendanceDays = await Attendance.countDocuments({
    userId,
    status: ATTENDANCE_STATUS.PRESENT,
    date: { $gte: start, $lt: end },
  });

  const finalSalary = calculateSalary({ baseSalary, bonus, deductions });

  let payroll;
  try {
    payroll = await Payroll.create({
      userId,
      baseSalary,
      attendanceDays,
      deductions,
      bonus,
      finalSalary,
      month: normalizedMonth,
      generatedBy: req.user?._id,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'Payroll for this employee and month already exists');
    }
    throw error;
  }

  const populatedPayroll = await Payroll.findById(payroll._id)
    .populate('userId', 'name email')
    .populate('generatedBy', 'name email');

  return res.status(201).json({
    success: true,
    message: 'Payroll generated successfully',
    data: populatedPayroll,
  });
});

export const getPayrollByUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized user');
  }

  const query = { userId: req.user._id };
  if (req.query?.month !== undefined) {
    query.month = validateMonth(req.query.month);
  }

  const payrolls = await Payroll.find(query)
    .sort({ month: -1, createdAt: -1 })
    .populate('generatedBy', 'name email');

  return res.status(200).json({
    success: true,
    data: payrolls,
  });
});

export const getAllPayrolls = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query?.month !== undefined) {
    query.month = validateMonth(req.query.month);
  }

  const payrolls = await Payroll.find(query)
    .populate('userId', 'name email')
    .populate('generatedBy', 'name email')
    .sort({ month: -1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    data: payrolls,
  });
});
