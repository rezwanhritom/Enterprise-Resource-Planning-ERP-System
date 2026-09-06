import User, { ACCOUNT_STATUS } from '../models/User.js';
import Company from '../models/Company.js';
import Department from '../models/Department.js';
import {
  hashToken,
  issueAuthTokens,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { ALLOWED_ROLES, ROLES } from '../utils/roles.js';
import {
  FEATURE_CATALOG,
  normalizeEnabledFeatures,
} from '../utils/features.js';
import {
  ensureUniqueCompanySlug,
  slugifyCompanyName,
} from '../utils/companyHelpers.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { isValidEmail } from '../utils/validators.js';

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { password, refreshTokenHash, ...safeUser } = user;
  return safeUser;
};

const populateUserCompany = async (userId) => {
  return User.findById(userId)
    .select('-password -refreshTokenHash')
    .populate('company', 'name slug industry description website enabledFeatures isActive')
    .populate('departments', 'name description');
};

const buildAuthResponse = async (userDoc) => {
  const tokens = await issueAuthTokens(userDoc);
  const hydratedUser = await populateUserCompany(userDoc._id);
  return {
    ...tokens,
    user: sanitizeUser(hydratedUser),
  };
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

  if (user.accountStatus === ACCOUNT_STATUS.PENDING) {
    throw new ApiError(
      403,
      'Your account is pending approval from the company admin.'
    );
  }

  if (user.accountStatus === ACCOUNT_STATUS.REJECTED) {
    throw new ApiError(
      403,
      'Your join request was rejected. Contact your company admin.'
    );
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is inactive');
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const authData = await buildAuthResponse(user);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: authData,
  });
});

export const registerCompany = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    companyName,
    industry,
    description,
    website,
    enabledFeatures,
  } = req.body;

  if (!name || !email || !password || !companyName) {
    throw new ApiError(
      400,
      'Name, email, password, and company name are required'
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!isValidEmail(normalizedEmail)) {
    throw new ApiError(400, 'Invalid email format');
  }

  const trimmedCompanyName = String(companyName).trim();
  if (!trimmedCompanyName) {
    throw new ApiError(400, 'Company name is required');
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const existingCompany = await Company.findOne({
    name: new RegExp(`^${trimmedCompanyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  });
  if (existingCompany) {
    throw new ApiError(409, 'A company with this name already exists');
  }

  const featureList = normalizeEnabledFeatures(enabledFeatures);
  const baseSlug = slugifyCompanyName(trimmedCompanyName);
  const slug = await ensureUniqueCompanySlug(Company, baseSlug);

  const company = await Company.create({
    name: trimmedCompanyName,
    slug,
    industry: industry?.trim() || '',
    description: description?.trim() || '',
    website: website?.trim() || '',
    enabledFeatures: featureList,
  });

  let createdUser;
  try {
    createdUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      company: company._id,
      roles: [ROLES.ADMIN],
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      isActive: true,
      joiningDate: new Date(),
    });
  } catch (error) {
    await Company.findByIdAndDelete(company._id);
    throw error;
  }

  company.createdBy = createdUser._id;
  await company.save();

  const authData = await buildAuthResponse(createdUser);

  return res.status(201).json({
    success: true,
    message: 'Company registered successfully. You are the admin.',
    data: {
      ...authData,
      company,
    },
  });
});

export const registerJoinCompany = asyncHandler(async (req, res) => {
  const { name, email, password, companyId } = req.body;

  if (!name || !email || !password || !companyId) {
    throw new ApiError(
      400,
      'Name, email, password, and company are required'
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!isValidEmail(normalizedEmail)) {
    throw new ApiError(400, 'Invalid email format');
  }

  const company = await Company.findById(companyId);
  if (!company || !company.isActive) {
    throw new ApiError(404, 'Company not found');
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const createdUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    company: company._id,
    roles: [ROLES.EMPLOYEE],
    accountStatus: ACCOUNT_STATUS.PENDING,
    isActive: false,
  });

  return res.status(201).json({
    success: true,
    message:
      'Registration submitted. A company admin must approve your account before you can sign in.',
    data: {
      user: sanitizeUser(createdUser),
      company: {
        _id: company._id,
        name: company.name,
      },
    },
  });
});

export const listPublicCompanies = asyncHandler(async (_req, res) => {
  const companies = await Company.find({ isActive: true })
    .select('name industry slug')
    .sort({ name: 1 });

  return res.status(200).json({
    success: true,
    message: 'Companies fetched successfully',
    data: companies,
  });
});

export const listFeatureCatalog = asyncHandler(async (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Feature catalog fetched successfully',
    data: FEATURE_CATALOG,
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
    company: req.user?.company?._id || req.user?.company || undefined,
    accountStatus: ACCOUNT_STATUS.ACTIVE,
    isActive: true,
  });

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: sanitizeUser(createdUser),
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const hydratedUser = await populateUserCompany(req.user._id);

  return res.status(200).json({
    success: true,
    message: 'Current user fetched successfully',
    data: sanitizeUser(hydratedUser),
  });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body?.refreshToken;
  if (!refreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.userId).select(
    '+refreshTokenHash +password'
  );

  if (!user || !user.isActive || user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
    throw new ApiError(401, 'Invalid refresh token user');
  }

  if (!user.refreshTokenHash || user.refreshTokenHash !== hashToken(refreshToken)) {
    throw new ApiError(401, 'Refresh token has been revoked');
  }

  const authData = await buildAuthResponse(user);

  return res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: authData,
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { refreshTokenHash: null },
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});
