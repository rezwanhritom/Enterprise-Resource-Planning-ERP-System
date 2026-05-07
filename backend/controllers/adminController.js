import User from '../models/User.js';
import Department from '../models/Department.js';
import { ALLOWED_ROLES, ROLES } from '../utils/roles.js';

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, roles, departments, isActive } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const roleList =
      Array.isArray(roles) && roles.length > 0 ? roles : [ROLES.EMPLOYEE];
    const invalidRoles = roleList.filter((role) => !ALLOWED_ROLES.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid roles: ${invalidRoles.join(', ')}`,
      });
    }

    if (departments !== undefined && !Array.isArray(departments)) {
      return res.status(400).json({
        success: false,
        message: 'Departments must be an array of department IDs',
      });
    }

    const departmentIds = Array.isArray(departments)
      ? [...new Set(departments.map(String))]
      : [];

    if (departmentIds.length > 0) {
      const foundDepartments = await Department.find({
        _id: { $in: departmentIds },
      }).select('_id');

      if (foundDepartments.length !== departmentIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more departments are invalid',
        });
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

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: sanitizeUser(createdUser),
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((err) => err.message)
          .join('; '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating user',
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('departments', 'name description')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
    });
  }
};
