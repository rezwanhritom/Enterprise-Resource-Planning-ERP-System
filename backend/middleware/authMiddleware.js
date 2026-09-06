import jwt from 'jsonwebtoken';
import User, { ACCOUNT_STATUS } from '../models/User.js';
import { ROLES } from '../utils/roles.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch (verifyError) {
      // Support older tokens signed before access/refresh split.
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        });
      }

      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (legacyError) {
        if (legacyError.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token has expired',
            code: 'TOKEN_EXPIRED',
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          code: 'TOKEN_INVALID',
        });
      }
    }

    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate(
        'company',
        'name slug industry description website enabledFeatures isActive'
      );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token user',
        code: 'TOKEN_INVALID',
      });
    }

    if (user.accountStatus === ACCOUNT_STATUS.PENDING) {
      return res.status(403).json({
        success: false,
        message: 'Account is pending admin approval',
      });
    }

    if (user.accountStatus === ACCOUNT_STATUS.REJECTED || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    req.user = user.toObject();
    req.tokenPayload = decoded;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'TOKEN_INVALID',
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (req.user.roles?.includes(ROLES.ADMIN)) {
      return next();
    }

    const hasAllowedRole = req.user.roles?.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasAllowedRole) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    return next();
  };
};
