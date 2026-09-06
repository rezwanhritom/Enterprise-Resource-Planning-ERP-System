import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },
    message: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    read: {
      type: Boolean,
      default: false,
    },
    attachments: {
      type: [String],
      default: [],
    },
    threadId: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

messageSchema.index({ company: 1, senderId: 1, receiverId: 1, timestamp: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
