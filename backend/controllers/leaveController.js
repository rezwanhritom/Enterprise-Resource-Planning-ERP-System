import LeaveRequest, {
  LEAVE_STATUS,
  LEAVE_TYPES,
} from '../models/LeaveRequest.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getCompanyId, companyFilter, assertSameCompany } from '../utils/companyScope.js';
import { ROLES } from '../utils/roles.js';
import createAuditLog from '../utils/createAuditLog.js';

const canManageLeave = (user) =>
  user?.roles?.includes(ROLES.ADMIN) || user?.roles?.includes(ROLES.HR_MANAGER);

export const createLeaveRequest = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  if (!companyId) throw new ApiError(400, 'User is not linked to a company');

  const { startDate, endDate, reason, leaveType } = req.body || {};
  if (!startDate || !endDate) {
    throw new ApiError(400, 'Start date and end date are required');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    throw new ApiError(400, 'Invalid leave date range');
  }

  const type = leaveType && Object.values(LEAVE_TYPES).includes(leaveType)
    ? leaveType
    : LEAVE_TYPES.ANNUAL;

  const created = await LeaveRequest.create({
    company: companyId,
    userId: req.user._id,
    leaveType: type,
    startDate: start,
    endDate: end,
    reason: typeof reason === 'string' ? reason.trim() : '',
    status: LEAVE_STATUS.PENDING,
  });

  await createAuditLog({
    userId: req.user._id,
    company: companyId,
    module: 'Leave',
    action: 'Leave request created',
  });

  return res.status(201).json({
    success: true,
    message: 'Leave request submitted',
    data: created,
  });
});

export const getMyLeaveRequests = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  const rows = await LeaveRequest.find({
    ...companyFilter(req.user),
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Leave requests fetched',
    data: rows,
  });
});

export const getCompanyLeaveRequests = asyncHandler(async (req, res) => {
  if (!canManageLeave(req.user)) {
    throw new ApiError(403, 'Only Admin or HR Manager can review leave requests');
  }

  const status = req.query?.status;
  const query = { ...companyFilter(req.user) };
  if (status && Object.values(LEAVE_STATUS).includes(status)) {
    query.status = status;
  }

  const rows = await LeaveRequest.find(query)
    .populate('userId', 'name email designation')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Company leave requests fetched',
    data: rows,
  });
});

export const reviewLeaveRequest = asyncHandler(async (req, res) => {
  if (!canManageLeave(req.user)) {
    throw new ApiError(403, 'Only Admin or HR Manager can review leave requests');
  }

  const companyId = getCompanyId(req.user);
  const { id } = req.params;
  const { status, reviewNote } = req.body || {};

  if (![LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED].includes(status)) {
    throw new ApiError(400, 'Status must be approved or rejected');
  }

  const leave = await LeaveRequest.findOne({ _id: id, company: companyId });
  if (!leave) throw new ApiError(404, 'Leave request not found');
  if (leave.status !== LEAVE_STATUS.PENDING) {
    throw new ApiError(400, 'Only pending leave requests can be reviewed');
  }

  leave.status = status;
  leave.reviewedBy = req.user._id;
  leave.reviewNote = typeof reviewNote === 'string' ? reviewNote.trim() : '';
  await leave.save();

  await createAuditLog({
    userId: req.user._id,
    company: companyId,
    module: 'Leave',
    action: `Leave request ${status}`,
  });

  const populated = await LeaveRequest.findById(leave._id)
    .populate('userId', 'name email designation')
    .populate('reviewedBy', 'name email');

  return res.status(200).json({
    success: true,
    message: `Leave request ${status}`,
    data: populated,
  });
});
