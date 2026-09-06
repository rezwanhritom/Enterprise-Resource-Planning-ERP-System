import User, { ACCOUNT_STATUS } from '../models/User.js';
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

const getCompanyId = (user) => {
  if (!user?.company) return null;
  return user.company._id ? String(user.company._id) : String(user.company);
};

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, roles, departments, isActive } = req.body;
  const companyId = getCompanyId(req.user);

  if (!companyId) {
    throw new ApiError(400, 'Admin account is not linked to a company');
  }

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
    company: companyId,
    accountStatus: ACCOUNT_STATUS.ACTIVE,
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
  const companyId = getCompanyId(req.user);
  const filter = companyId ? { company: companyId } : {};

  const users = await User.find(filter)
    .select('-password')
    .populate('departments', 'name description')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    data: users,
  });
});

export const getJoinRequests = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  if (!companyId) {
    throw new ApiError(400, 'Admin account is not linked to a company');
  }

  const requests = await User.find({
    company: companyId,
    accountStatus: ACCOUNT_STATUS.PENDING,
  })
    .select('-password')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Join requests fetched successfully',
    data: requests,
  });
});

export const approveJoinRequest = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  if (!companyId) {
    throw new ApiError(400, 'Admin account is not linked to a company');
  }

  const { userId } = req.params;
  const { roles } = req.body;

  const pendingUser = await User.findOne({
    _id: userId,
    company: companyId,
    accountStatus: ACCOUNT_STATUS.PENDING,
  });

  if (!pendingUser) {
    throw new ApiError(404, 'Join request not found');
  }

  const roleList =
    Array.isArray(roles) && roles.length > 0 ? roles : [ROLES.EMPLOYEE];
  const invalidRoles = roleList.filter((role) => !ALLOWED_ROLES.includes(role));
  if (invalidRoles.length > 0) {
    throw new ApiError(400, `Invalid roles: ${invalidRoles.join(', ')}`);
  }

  pendingUser.roles = roleList;
  pendingUser.accountStatus = ACCOUNT_STATUS.ACTIVE;
  pendingUser.isActive = true;
  pendingUser.joiningDate = pendingUser.joiningDate || new Date();
  await pendingUser.save();

  await createAuditLog({
    userId: req.user?._id,
    module: 'User',
    action: `Approved join request for ${pendingUser.email}`,
  });

  return res.status(200).json({
    success: true,
    message: 'Join request approved',
    data: sanitizeUser(pendingUser),
  });
});

export const rejectJoinRequest = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  if (!companyId) {
    throw new ApiError(400, 'Admin account is not linked to a company');
  }

  const { userId } = req.params;

  const pendingUser = await User.findOne({
    _id: userId,
    company: companyId,
    accountStatus: ACCOUNT_STATUS.PENDING,
  });

  if (!pendingUser) {
    throw new ApiError(404, 'Join request not found');
  }

  pendingUser.accountStatus = ACCOUNT_STATUS.REJECTED;
  pendingUser.isActive = false;
  pendingUser.roles = [ROLES.EMPLOYEE];
  await pendingUser.save();

  await createAuditLog({
    userId: req.user?._id,
    module: 'User',
    action: `Rejected join request for ${pendingUser.email}`,
  });

  return res.status(200).json({
    success: true,
    message: 'Join request rejected',
    data: sanitizeUser(pendingUser),
  });
});

export const updateCompanyUser = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  if (!companyId) {
    throw new ApiError(400, 'Admin account is not linked to a company');
  }

  const { userId } = req.params;
  const target = await User.findOne({ _id: userId, company: companyId });
  if (!target) throw new ApiError(404, 'User not found in your company');

  const { roles, departments, isActive, designation, baseSalary, accountStatus } =
    req.body || {};

  if (roles !== undefined) {
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new ApiError(400, 'Roles must be a non-empty array');
    }
    const invalidRoles = roles.filter((role) => !ALLOWED_ROLES.includes(role));
    if (invalidRoles.length > 0) {
      throw new ApiError(400, `Invalid roles: ${invalidRoles.join(', ')}`);
    }
    target.roles = roles;
  }

  if (departments !== undefined) {
    if (!Array.isArray(departments)) {
      throw new ApiError(400, 'Departments must be an array');
    }
    const departmentIds = [...new Set(departments.map(String))];
    if (departmentIds.length > 0) {
      const found = await Department.find({
        _id: { $in: departmentIds },
        company: companyId,
      }).select('_id');
      if (found.length !== departmentIds.length) {
        throw new ApiError(400, 'One or more departments are invalid');
      }
    }
    target.departments = departmentIds;
  }

  if (typeof isActive === 'boolean') {
    target.isActive = isActive;
  }

  if (typeof designation === 'string') {
    target.designation = designation.trim();
  }

  if (baseSalary !== undefined) {
    const salary = Number(baseSalary);
    if (Number.isNaN(salary) || salary < 0) {
      throw new ApiError(400, 'Invalid base salary');
    }
    target.baseSalary = salary;
  }

  if (
    accountStatus &&
    Object.values(ACCOUNT_STATUS).includes(accountStatus)
  ) {
    target.accountStatus = accountStatus;
    if (accountStatus === ACCOUNT_STATUS.ACTIVE) target.isActive = true;
    if (accountStatus === ACCOUNT_STATUS.REJECTED) target.isActive = false;
  }

  await target.save();

  await createAuditLog({
    userId: req.user?._id,
    company: companyId,
    module: 'User',
    action: `Updated user ${target.email}`,
  });

  const hydrated = await User.findById(target._id)
    .select('-password')
    .populate('departments', 'name description');

  return res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: sanitizeUser(hydrated),
  });
});

export const getCompanySettings = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  if (!companyId) throw new ApiError(400, 'Admin account is not linked to a company');

  const Company = (await import('../models/Company.js')).default;
  const company = await Company.findById(companyId);
  if (!company) throw new ApiError(404, 'Company not found');

  return res.status(200).json({
    success: true,
    message: 'Company settings fetched',
    data: company,
  });
});

export const updateCompanySettings = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  if (!companyId) throw new ApiError(400, 'Admin account is not linked to a company');

  const Company = (await import('../models/Company.js')).default;
  const { normalizeEnabledFeatures } = await import('../utils/features.js');
  const company = await Company.findById(companyId);
  if (!company) throw new ApiError(404, 'Company not found');

  const { name, industry, description, website, enabledFeatures, isActive } =
    req.body || {};

  if (typeof name === 'string' && name.trim()) company.name = name.trim();
  if (typeof industry === 'string') company.industry = industry.trim();
  if (typeof description === 'string') company.description = description.trim();
  if (typeof website === 'string') company.website = website.trim();
  if (enabledFeatures !== undefined) {
    company.enabledFeatures = normalizeEnabledFeatures(enabledFeatures);
  }
  if (typeof isActive === 'boolean') company.isActive = isActive;

  await company.save();

  await createAuditLog({
    userId: req.user?._id,
    company: companyId,
    module: 'Company',
    action: 'Company settings updated',
  });

  return res.status(200).json({
    success: true,
    message: 'Company settings updated',
    data: company,
  });
});
