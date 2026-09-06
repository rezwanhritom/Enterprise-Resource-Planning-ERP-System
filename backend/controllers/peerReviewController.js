import PeerReview from '../models/PeerReview.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { getCompanyId, companyFilter, assertSameCompany } from '../utils/companyScope.js';
import createAuditLog from '../utils/createAuditLog.js';

const sanitizeForSubject = (doc) => {
  const row = doc.toObject ? doc.toObject() : { ...doc };
  if (row.isAnonymous !== false) {
    delete row.reviewerId;
  }
  return row;
};

export const submitPeerReview = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  if (!companyId) throw new ApiError(400, 'User is not linked to a company');

  const { subjectId, rating, feedback, categories, isAnonymous } = req.body || {};
  if (!subjectId || !rating) {
    throw new ApiError(400, 'Subject and rating are required');
  }

  if (String(subjectId) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot review yourself');
  }

  const subject = await User.findById(subjectId);
  if (!subject || !assertSameCompany(req.user, subject)) {
    throw new ApiError(404, 'Employee not found in your company');
  }

  const numericRating = Number(rating);
  if (numericRating < 1 || numericRating > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5');
  }

  const payload = {
    company: companyId,
    subjectId,
    reviewerId: req.user._id,
    rating: numericRating,
    feedback: typeof feedback === 'string' ? feedback.trim() : '',
    isAnonymous: isAnonymous !== false,
    categories: {
      teamwork: categories?.teamwork ? Number(categories.teamwork) : undefined,
      communication: categories?.communication
        ? Number(categories.communication)
        : undefined,
      reliability: categories?.reliability ? Number(categories.reliability) : undefined,
    },
  };

  const saved = await PeerReview.findOneAndUpdate(
    { company: companyId, subjectId, reviewerId: req.user._id },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  await createAuditLog({
    userId: req.user._id,
    company: companyId,
    module: 'PeerReview',
    action: 'Peer review submitted',
  });

  return res.status(201).json({
    success: true,
    message: 'Peer review saved',
    data: saved,
  });
});

export const getMyPeerReviews = asyncHandler(async (req, res) => {
  const rows = await PeerReview.find({
    ...companyFilter(req.user),
    subjectId: req.user._id,
  })
    .populate('reviewerId', 'name email')
    .sort({ createdAt: -1 });

  const anonymousSafe = rows.map(sanitizeForSubject);
  const average =
    rows.length === 0
      ? 0
      : Number(
          (rows.reduce((sum, row) => sum + row.rating, 0) / rows.length).toFixed(2)
        );

  return res.status(200).json({
    success: true,
    message: 'Peer reviews fetched',
    data: {
      average,
      count: rows.length,
      reviews: anonymousSafe,
    },
  });
});

export const getPeerReviewTargets = asyncHandler(async (req, res) => {
  const companyId = getCompanyId(req.user);
  const employees = await User.find({
    company: companyId,
    isActive: true,
    accountStatus: 'active',
    _id: { $ne: req.user._id },
  })
    .select('_id name email designation roles')
    .sort({ name: 1 });

  return res.status(200).json({
    success: true,
    message: 'Review targets fetched',
    data: employees,
  });
});
