import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const JWT_ISSUER = process.env.JWT_ISSUER || 'erp-suite';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'your_jwt_secret') {
    throw new Error('JWT_SECRET is missing or invalid in environment variables');
  }
  return secret;
};

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || `${getJwtSecret()}_refresh`;

export const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

export const signAccessToken = ({ userId, roles, companyId }) => {
  return jwt.sign(
    {
      userId: String(userId),
      roles: Array.isArray(roles) ? roles : [],
      companyId: companyId ? String(companyId) : null,
      type: 'access',
    },
    getJwtSecret(),
    {
      expiresIn: ACCESS_EXPIRES_IN,
      issuer: JWT_ISSUER,
      subject: String(userId),
    }
  );
};

export const signRefreshToken = ({ userId }) => {
  return jwt.sign(
    {
      userId: String(userId),
      type: 'refresh',
    },
    getRefreshSecret(),
    {
      expiresIn: REFRESH_EXPIRES_IN,
      issuer: JWT_ISSUER,
      subject: String(userId),
    }
  );
};

export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, getJwtSecret(), { issuer: JWT_ISSUER });
  if (decoded.type && decoded.type !== 'access') {
    throw new Error('Invalid access token type');
  }
  return decoded;
};

export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, getRefreshSecret(), { issuer: JWT_ISSUER });
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid refresh token type');
  }
  return decoded;
};

/** @deprecated Prefer signAccessToken + signRefreshToken */
const generateToken = ({ userId, roles, companyId }) =>
  signAccessToken({ userId, roles, companyId });

export const issueAuthTokens = async (userDoc) => {
  const userId = userDoc._id;
  const roles = userDoc.roles;
  const companyId = userDoc.company?._id || userDoc.company;

  const accessToken = signAccessToken({ userId, roles, companyId });
  const refreshToken = signRefreshToken({ userId });

  userDoc.refreshTokenHash = hashToken(refreshToken);
  await userDoc.save({ validateBeforeSave: false });

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    expiresIn: ACCESS_EXPIRES_IN,
  };
};

export default generateToken;
