import jwt from 'jsonwebtoken';

/**
 * Backward-compatible wrapper.
 * Prefer importing from ./jwt.js for access/refresh helpers.
 */
export {
  default,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  issueAuthTokens,
  hashToken,
} from './jwt.js';
