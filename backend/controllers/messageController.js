import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  getCompanyId,
  companyFilter,
  assertSameCompany,
} from '../utils/companyScope.js';

const parseUserId = (value, label = 'User') => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `${label} ID must be a valid user ID`);
  }
  return value;
};

export const sendMessage = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized user');
  }

  const companyId = getCompanyId(req.user);
  if (!companyId) {
    throw new ApiError(400, 'User is not linked to a company');
  }

  const receiverId = parseUserId(req.body?.receiverId, 'Receiver');
  const senderId = String(req.user._id);

  if (String(receiverId) === senderId) {
    throw new ApiError(400, 'You cannot send a message to yourself');
  }

  const messageText =
    typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!messageText) {
    throw new ApiError(400, 'Message text is required');
  }

  const receiver = await User.findById(receiverId).select('_id isActive company');
  if (!receiver) {
    throw new ApiError(404, 'Receiver not found');
  }
  if (!assertSameCompany(req.user, receiver)) {
    throw new ApiError(403, 'You can only message users in your company');
  }
  if (!receiver.isActive) {
    throw new ApiError(400, 'Cannot send a message to an inactive user');
  }

  const created = await Message.create({
    senderId: req.user._id,
    receiverId,
    message: messageText,
    company: companyId,
  });

  const populated = await Message.findById(created._id)
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email');

  return res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: populated,
  });
});

export const getMessages = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized user');
  }

  const userId = parseUserId(req.query?.userId, 'Conversation user');
  const me = req.user._id;

  const otherUser = await User.findById(userId).select('_id company');
  if (!otherUser) {
    throw new ApiError(404, 'Conversation user not found');
  }
  if (!assertSameCompany(req.user, otherUser)) {
    throw new ApiError(403, 'You can only view conversations with users in your company');
  }

  const messages = await Message.find({
    ...companyFilter(req.user),
    $or: [
      { senderId: me, receiverId: userId },
      { senderId: userId, receiverId: me },
    ],
  })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .sort({ timestamp: 1, createdAt: 1 });

  return res.status(200).json({
    success: true,
    message: 'Conversation fetched successfully',
    data: messages,
  });
});

export const getInbox = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized user');
  }

  const meId = req.user._id;
  const scope = companyFilter(req.user);

  const latestRows = await Message.aggregate([
    {
      $match: {
        ...scope,
        $or: [{ senderId: meId }, { receiverId: meId }],
      },
    },
    {
      $addFields: {
        otherUserId: {
          $cond: [{ $eq: ['$senderId', meId] }, '$receiverId', '$senderId'],
        },
      },
    },
    { $sort: { timestamp: -1, createdAt: -1 } },
    {
      $group: {
        _id: '$otherUserId',
        latestMessageId: { $first: '$_id' },
        latestMessage: { $first: '$message' },
        latestTimestamp: { $first: '$timestamp' },
        latestCreatedAt: { $first: '$createdAt' },
        senderId: { $first: '$senderId' },
      },
    },
    { $sort: { latestTimestamp: -1, latestCreatedAt: -1 } },
  ]);

  const userIds = latestRows.map((row) => row._id);
  const users = await User.find({
    _id: { $in: userIds },
    ...scope,
  }).select('name email');
  const userMap = new Map(users.map((user) => [String(user._id), user]));

  const conversations = latestRows
    .map((row) => {
      const otherUser = userMap.get(String(row._id));
      if (!otherUser) return null;
      return {
        user: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
        },
        latestMessage: row.latestMessage,
        latestTimestamp: row.latestTimestamp,
        isSentByMe: String(row.senderId) === String(meId),
      };
    })
    .filter(Boolean);

  return res.status(200).json({
    success: true,
    message: 'Inbox fetched successfully',
    data: conversations,
  });
});
