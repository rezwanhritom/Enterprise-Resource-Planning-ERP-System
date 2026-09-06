import Announcement from '../models/Announcement.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getCompanyId, companyFilter } from '../utils/companyScope.js';
import { ROLES } from '../utils/roles.js';
import createAuditLog from '../utils/createAuditLog.js';

const canManageAnnouncements = (user) =>
  user?.roles?.includes(ROLES.ADMIN) || user?.roles?.includes(ROLES.HR_MANAGER);

export const createAnnouncement = asyncHandler(async (req, res) => {
  if (!canManageAnnouncements(req.user)) {
    throw new ApiError(403, 'Only Admin or HR Manager can post announcements');
  }

  const companyId = getCompanyId(req.user);
  if (!companyId) throw new ApiError(400, 'User is not linked to a company');

  const { title, body, pinned, audience } = req.body || {};
  if (!title?.trim() || !body?.trim()) {
    throw new ApiError(400, 'Title and body are required');
  }

  const created = await Announcement.create({
    company: companyId,
    title: title.trim(),
    body: body.trim(),
    createdBy: req.user._id,
    pinned: Boolean(pinned),
    audience: audience || 'all',
  });

  await createAuditLog({
    userId: req.user._id,
    company: companyId,
    module: 'Announcement',
    action: 'Announcement created',
  });

  return res.status(201).json({
    success: true,
    message: 'Announcement created',
    data: created,
  });
});

export const listAnnouncements = asyncHandler(async (req, res) => {
  const rows = await Announcement.find(companyFilter(req.user))
    .populate('createdBy', 'name email')
    .sort({ pinned: -1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Announcements fetched',
    data: rows,
  });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  if (!canManageAnnouncements(req.user)) {
    throw new ApiError(403, 'Only Admin or HR Manager can delete announcements');
  }

  const companyId = getCompanyId(req.user);
  const deleted = await Announcement.findOneAndDelete({
    _id: req.params.id,
    company: companyId,
  });

  if (!deleted) throw new ApiError(404, 'Announcement not found');

  return res.status(200).json({
    success: true,
    message: 'Announcement deleted',
    data: deleted,
  });
});
