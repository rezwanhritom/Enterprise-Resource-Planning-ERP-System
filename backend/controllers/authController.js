import User from '../models/User.js';
import Department from '../models/Department.js';
import generateToken from '../utils/generateToken.js';
import { ALLOWED_ROLES, ROLES } from '../utils/roles.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { isValidEmail } from '../utils/validators.js';

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!isValidEmail(normalizedEmail)) {
    throw new ApiError(400, 'Invalid email format');
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is inactive');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const token = generateToken({ userId: user._id, roles: user.roles });

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: sanitizeUser(user),
    },
  });
});

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, roles, departments } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!isValidEmail(normalizedEmail)) {
    throw new ApiError(400, 'Invalid email format');
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const roleList =
    Array.isArray(roles) && roles.length > 0 ? roles : [ROLES.EMPLOYEE];
  const invalidRoles = roleList.filter((role) => !ALLOWED_ROLES.includes(role));

  if (invalidRoles.length > 0) {
    throw new ApiError(400, `Invalid roles: ${invalidRoles.join(', ')}`);
  }

  let departmentIds = [];
  if (departments !== undefined) {
    if (!Array.isArray(departments)) {
      throw new ApiError(400, 'Departments must be an array of department IDs');
    }

    departmentIds = [...new Set(departments.map(String))];
    if (departmentIds.length > 0) {
      const foundDepartments = await Department.find({
        _id: { $in: departmentIds },
      }).select('_id');

      if (foundDepartments.length !== departmentIds.length) {
        throw new ApiError(400, 'One or more departments are invalid');
      }
    }
  }

  const createdUser = await User.create({
    name,
    email: normalizedEmail,
    password,
    roles: roleList,
    departments: departmentIds,
    isActive: true,
  });

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: sanitizeUser(createdUser),
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Current user fetched successfully',
    data: req.user,
  });
});
