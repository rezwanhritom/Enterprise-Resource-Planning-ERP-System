import User from '../models/User.js';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ALLOWED_ROLES } from '../utils/roles.js';

const FORBIDDEN_PROFILE_FIELDS = [
  'roles',
  'departments',
  'isActive',
  'password',
  'email',
];

const sanitizePhone = (value) => (typeof value === 'string' ? value.trim() : value);

const sanitizeText = (value) => (typeof value === 'string' ? value.trim() : value);

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await User.findById(req.user?._id)
    .select('-password')
    .populate('departments', 'name description');

  if (!profile) {
    throw new ApiError(404, 'User profile not found');
  }

  return res.status(200).json({
    success: true,
    message: 'Profile fetched successfully',
    data: profile,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const hasForbiddenFields = FORBIDDEN_PROFILE_FIELDS.some((field) =>
    Object.prototype.hasOwnProperty.call(req.body || {}, field)
  );

  if (hasForbiddenFields) {
    throw new ApiError(
      403,
      'Updating email, roles, departments, active status, or password is not allowed'
    );
  }

  const updates = {};

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'name')) {
    const name = sanitizeText(req.body.name);
    if (!name) {
      throw new ApiError(400, 'Name is required');
    }
    updates.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'phone')) {
    const phone = sanitizePhone(req.body.phone);
    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      throw new ApiError(400, 'Phone must be a valid string');
    }
    updates.phone = phone ?? '';
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'address')) {
    const address = sanitizeText(req.body.address);
    updates.address = address ?? '';
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'designation')) {
    const designation = sanitizeText(req.body.designation);
    updates.designation = designation ?? '';
  }

  const updatedProfile = await User.findByIdAndUpdate(req.user?._id, updates, {
    new: true,
    runValidators: true,
  })
    .select('-password')
    .populate('departments', 'name description');

  if (!updatedProfile) {
    throw new ApiError(404, 'User profile not found');
  }

  return res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedProfile,
  });
});

export const getAllEmployees = asyncHandler(async (req, res) => {
  const { search, department, role } = req.query || {};
  const query = {};

  if (typeof search === 'string' && search.trim()) {
    query.name = { $regex: search.trim(), $options: 'i' };
  }

  if (
    typeof department === 'string' &&
    department.trim() &&
    mongoose.Types.ObjectId.isValid(department.trim())
  ) {
    query.departments = department.trim();
  }

  if (
    typeof role === 'string' &&
    role.trim() &&
    ALLOWED_ROLES.includes(role.trim())
  ) {
    query.roles = role.trim();
  }

  const employees = await User.find(query)
    .select('-password')
    .populate('departments', 'name description')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Employees fetched successfully',
    data: employees,
  });
});

export const getEmployeeDirectory = asyncHandler(async (req, res) => {
  const employees = await User.find({ isActive: true })
    .select('_id name email')
    .sort({ name: 1 });

  return res.status(200).json({
    success: true,
    message: 'Employee directory fetched successfully',
    data: employees,
  });
});
