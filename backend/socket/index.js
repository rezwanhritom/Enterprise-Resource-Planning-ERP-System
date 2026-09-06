import { Server } from 'socket.io';
import Message from '../models/Message.js';
import User, { ACCOUNT_STATUS } from '../models/User.js';
import { getCompanyId, assertSameCompany } from '../utils/companyScope.js';
import { verifyAccessToken } from '../utils/jwt.js';
import jwt from 'jsonwebtoken';

const onlineUsers = new Map();

const decodeSocketToken = (token) => {
  try {
    return verifyAccessToken(token);
  } catch {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
};

export const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = decodeSocketToken(token);
      const user = await User.findById(decoded.userId)
        .select('-password -refreshTokenHash')
        .populate('company', 'name enabledFeatures isActive');

      if (!user || !user.isActive || user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
        return next(new Error('Unauthorized'));
      }

      socket.user = user.toObject();
      return next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user._id);
    const companyId = getCompanyId(socket.user);

    onlineUsers.set(userId, socket.id);
    if (companyId) {
      socket.join(`company:${companyId}`);
    }
    socket.join(`user:${userId}`);

    socket.emit('connected', { userId, companyId });

    socket.on('message:send', async (payload, ack) => {
      try {
        const receiverId = payload?.receiverId;
        const text = typeof payload?.message === 'string' ? payload.message.trim() : '';

        if (!receiverId || !text) {
          throw new Error('Receiver and message are required');
        }

        const receiver = await User.findById(receiverId);
        if (!receiver || !assertSameCompany(socket.user, receiver)) {
          throw new Error('Receiver not found in your company');
        }

        const created = await Message.create({
          company: companyId,
          senderId: socket.user._id,
          receiverId,
          message: text,
          timestamp: new Date(),
        });

        const populated = await Message.findById(created._id)
          .populate('senderId', 'name email')
          .populate('receiverId', 'name email');

        const messagePayload = populated.toObject();
        io.to(`user:${receiverId}`).emit('message:new', messagePayload);
        socket.emit('message:new', messagePayload);

        if (typeof ack === 'function') {
          ack({ success: true, data: messagePayload });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ success: false, message: error.message });
        }
      }
    });

    socket.on('message:read', async ({ messageIds } = {}) => {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          receiverId: socket.user._id,
          company: companyId,
        },
        { $set: { read: true } }
      );
    });

    socket.on('disconnect', () => {
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);
      }
    });
  });

  return io;
};

export default initSocketServer;
