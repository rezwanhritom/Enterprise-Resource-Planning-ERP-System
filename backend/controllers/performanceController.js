import mongoose from 'mongoose';
import Performance from '../models/Performance.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ROLES } from '../utils/roles.js';
import {
  getCompanyId,
  companyFilter,
  assertSameCompany,
} from '../utils/companyScope.js';

const PERFORMANCE_MANAGER_ROLES = [
  ROLES.ADMIN,
  ROLES.HR_MANAGER,
  ROLES.SUPERVISOR,
  ROLES.PROCUREMENT_MANAGER,
  ROLES.FINANCE_MANAGER,
  ROLES.INVENTORY_MANAGER,
];

const isPerformanceManager = (user) =>
  Boolean(user?.roles?.some((role) => PERFORMANCE_MANAGER_ROLES.includes(role)));

const parseRating = (value) => {
  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be an integer between 1 and 5');
  }
  return rating;
};

const parseEmployeeId = (value, fieldName = 'Employee ID') => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `${fieldName} must be a valid user ID`);
  }
  return value;
};

export const addNote = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized user');
  }

  const companyId = getCompanyId(req.user);
  if (!companyId) {
    throw new ApiError(400, 'User is not linked to a company');
  }

  const employeeId = parseEmployeeId(req.body?.employeeId);
  const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';
  const rating = parseRating(req.body?.rating);

  if (!note) {
    throw new ApiError(400, 'Performance note is required');
  }

  const employee = await User.findById(employeeId).select(
    '_id name email isActive company'
  );
  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  if (!assertSameCompany(req.user, employee)) {
    throw new ApiError(403, 'Cannot add a note for a user outside your company');
  }

  if (!employee.isActive) {
    throw new ApiError(400, 'Cannot add note for an inactive employee');
  }

  const created = await Performance.create({
    employeeId,
    managerId: req.user._id,
    note,
    rating,
    company: companyId,
  });

  const populated = await Performance.findById(created._id)
    .populate('employeeId', 'name email')
    .populate('managerId', 'name email');

  return res.status(201).json({
    success: true,
    message: 'Performance note added successfully',
    data: populated,
  });
});

export const getEmployeeNotes = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized user');
  }

  const managerView = isPerformanceManager(req.user);
  const query = { ...companyFilter(req.user) };

  if (managerView && req.query?.employeeId) {
    const employeeId = parseEmployeeId(req.query.employeeId, 'Employee filter');
    const employee = await User.findById(employeeId).select('_id company');
    if (!employee) {
      throw new ApiError(404, 'Employee not found');
    }
    if (!assertSameCompany(req.user, employee)) {
      throw new ApiError(403, 'Cannot view notes for a user outside your company');
    }
    query.employeeId = employeeId;
  } else if (!managerView) {
    query.employeeId = req.user._id;
  }

  if (req.query?.rating !== undefined) {
    query.rating = parseRating(req.query.rating);
  }

  const notes = await Performance.find(query)
    .populate('employeeId', 'name email')
    .populate('managerId', 'name email')
    .sort({ date: -1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Performance notes fetched successfully',
    data: notes,
  });
});
