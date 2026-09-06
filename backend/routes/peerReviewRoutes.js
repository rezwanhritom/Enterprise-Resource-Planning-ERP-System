import { Router } from 'express';
import {
  getMyPeerReviews,
  getPeerReviewTargets,
  submitPeerReview,
} from '../controllers/peerReviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.post('/', submitPeerReview);
router.get('/me', getMyPeerReviews);
router.get('/targets', getPeerReviewTargets);

export default router;
