import User from '../models/User.js';
import Department from '../models/Department.js';
import generateToken from '../utils/generateToken.js';
import { ALLOWED_ROLES, ROLES } from '../utils/roles.js';

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while logging in',
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, roles, departments } = req.body;

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

    let departmentIds = [];
    if (departments !== undefined) {
      if (!Array.isArray(departments)) {
        return res.status(400).json({
          success: false,
          message: 'Departments must be an array of department IDs',
        });
      }

      departmentIds = [...new Set(departments.map(String))];
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
      message: 'Server error while registering user',
    });
  }
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Current user fetched successfully',
    data: req.user,
  });
};
