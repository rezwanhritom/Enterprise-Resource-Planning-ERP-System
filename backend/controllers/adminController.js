import User from '../models/User.js';
import Department from '../models/Department.js';
import { ALLOWED_ROLES, ROLES } from '../utils/roles.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { isValidEmail } from '../utils/validators.js';
import createAuditLog from '../utils/createAuditLog.js';

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, roles, departments, isActive } = req.body;

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

  if (departments !== undefined && !Array.isArray(departments)) {
    throw new ApiError(400, 'Departments must be an array of department IDs');
  }

  const departmentIds = Array.isArray(departments)
    ? [...new Set(departments.map(String))]
    : [];

  if (departmentIds.length > 0) {
    const foundDepartments = await Department.find({
      _id: { $in: departmentIds },
    }).select('_id');

    if (foundDepartments.length !== departmentIds.length) {
      throw new ApiError(400, 'One or more departments are invalid');
    }
  }

  const createdUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    roles: roleList,
    departments: departmentIds,
    isActive: typeof isActive === 'boolean' ? isActive : true,
  });

  await createAuditLog({
    userId: req.user?._id,
    module: 'User',
    action: 'User created',
  });

  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: sanitizeUser(createdUser),
  });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('-password')
    .populate('departments', 'name description')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    data: users,
  });
});
