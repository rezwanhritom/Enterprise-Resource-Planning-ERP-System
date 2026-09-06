import mongoose from 'mongoose';

const peerReviewSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Subject employee is required'],
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer is required'],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      trim: true,
      default: '',
    },
    categories: {
      teamwork: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      reliability: { type: Number, min: 1, max: 5 },
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

peerReviewSchema.index({ company: 1, subjectId: 1, createdAt: -1 });
peerReviewSchema.index(
  { company: 1, subjectId: 1, reviewerId: 1 },
  { unique: true }
);

const PeerReview = mongoose.model('PeerReview', peerReviewSchema);

export default PeerReview;
