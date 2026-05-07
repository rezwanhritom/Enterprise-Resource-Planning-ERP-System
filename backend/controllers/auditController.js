import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAuditLogs = asyncHandler(async (req, res) => {
  const query = {};

  if (typeof req.query?.action === 'string' && req.query.action.trim()) {
    query.action = { $regex: req.query.action.trim(), $options: 'i' };
  }

  if (typeof req.query?.module === 'string' && req.query.module.trim()) {
    query.module = { $regex: req.query.module.trim(), $options: 'i' };
  }

  if (req.query?.userId !== undefined) {
    const userId = String(req.query.userId).trim();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'User filter must be a valid user ID');
    }
    query.userId = userId;
  }

  const logs = await AuditLog.find(query)
    .populate('userId', 'name email')
    .sort({ timestamp: -1, createdAt: -1 })
    .limit(500);

  return res.status(200).json({
    success: true,
    message: 'Audit logs fetched successfully',
    data: logs,
  });
});
