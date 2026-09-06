import mongoose from 'mongoose';
import Department from '../models/Department.js';
import Procurement, { PROCUREMENT_STATUS } from '../models/Procurement.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ROLES } from '../utils/roles.js';
import createAuditLog from '../utils/createAuditLog.js';
import { getCompanyId, companyFilter } from '../utils/companyScope.js';

const REVIEWER_ROLES = [
  ROLES.ADMIN,
  ROLES.PROCUREMENT_MANAGER,
  ROLES.SUPERVISOR,
  ROLES.HR_MANAGER,
  ROLES.FINANCE_MANAGER,
];

const canReviewRequest = (user) =>
  Boolean(user?.roles?.some((role) => REVIEWER_ROLES.includes(role)));

const parseItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'At least one procurement item is required');
  }

  return items.map((item, index) => {
    const itemName = typeof item?.itemName === 'string' ? item.itemName.trim() : '';
    const quantity = Number(item?.quantity);

    if (!itemName) {
      throw new ApiError(400, `Item name is required at row ${index + 1}`);
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new ApiError(400, `Item quantity must be greater than 0 at row ${index + 1}`);
    }

    return {
      itemName,
      quantity,
    };
  });
};

const ensurePendingRequest = (request) => {
  if (!request) {
    throw new ApiError(404, 'Procurement request not found');
  }
  if (request.status !== PROCUREMENT_STATUS.PENDING) {
    throw new ApiError(409, 'Only pending requests can be updated');
  }
};

export const createRequest = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized user');
  }

  const companyId = getCompanyId(req.user);
  if (!companyId) {
    throw new ApiError(400, 'User is not linked to a company');
  }

  const { department } = req.body || {};
  if (!department || !mongoose.Types.ObjectId.isValid(department)) {
    throw new ApiError(400, 'A valid department is required');
  }

  const departmentExists = await Department.findOne({
    _id: department,
    ...companyFilter(req.user),
  }).select('_id');
  if (!departmentExists) {
    throw new ApiError(404, 'Department not found');
  }

  const parsedItems = parseItems(req.body?.items);

  const request = await Procurement.create({
    requestedBy: req.user._id,
    department,
    items: parsedItems,
    status: PROCUREMENT_STATUS.PENDING,
    company: companyId,
  });

  const populated = await Procurement.findById(request._id)
    .populate('requestedBy', 'name email')
    .populate('department', 'name')
    .populate('approvedBy', 'name email');

  await createAuditLog({
    userId: req.user?._id,
    module: 'Procurement',
    action: 'Procurement approved',
    company: companyId,
  });

  return res.status(201).json({
    success: true,
    message: 'Procurement request created successfully',
    data: populated,
  });
});

export const approveRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid procurement request id');
  }

  const request = await Procurement.findOne({
    _id: id,
    ...companyFilter(req.user),
  });
  ensurePendingRequest(request);

  request.status = PROCUREMENT_STATUS.APPROVED;
  request.approvedBy = req.user?._id;
  request.approvedAt = new Date();
  request.rejectionReason = '';
  await request.save();

  const populated = await Procurement.findById(request._id)
    .populate('requestedBy', 'name email')
    .populate('department', 'name')
    .populate('approvedBy', 'name email');

  await createAuditLog({
    userId: req.user?._id,
    module: 'Procurement',
    action: 'Procurement rejected',
    company: getCompanyId(req.user) || undefined,
  });

  return res.status(200).json({
    success: true,
    message: 'Procurement request approved',
    data: populated,
  });
});

export const rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid procurement request id');
  }

  const request = await Procurement.findOne({
    _id: id,
    ...companyFilter(req.user),
  });
  ensurePendingRequest(request);

  const rejectionReason =
    typeof req.body?.rejectionReason === 'string' ? req.body.rejectionReason.trim() : '';

  request.status = PROCUREMENT_STATUS.REJECTED;
  request.approvedBy = req.user?._id;
  request.approvedAt = new Date();
  request.rejectionReason = rejectionReason;
  await request.save();

  const populated = await Procurement.findById(request._id)
    .populate('requestedBy', 'name email')
    .populate('department', 'name')
    .populate('approvedBy', 'name email');

  return res.status(200).json({
    success: true,
    message: 'Procurement request rejected',
    data: populated,
  });
});

export const getRequests = asyncHandler(async (req, res) => {
  const query = { ...companyFilter(req.user) };

  if (req.query?.status) {
    const status = String(req.query.status).toLowerCase().trim();
    if (!Object.values(PROCUREMENT_STATUS).includes(status)) {
      throw new ApiError(400, 'Invalid status filter');
    }
    query.status = status;
  }

  if (!canReviewRequest(req.user)) {
    query.requestedBy = req.user?._id;
  }

  const requests = await Procurement.find(query)
    .populate('requestedBy', 'name email')
    .populate('department', 'name')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Procurement requests fetched successfully',
    data: requests,
  });
});
