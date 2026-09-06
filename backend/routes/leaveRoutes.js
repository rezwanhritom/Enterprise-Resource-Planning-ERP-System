import { Router } from 'express';
import {
  createLeaveRequest,
  getCompanyLeaveRequests,
  getMyLeaveRequests,
  reviewLeaveRequest,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.post('/', createLeaveRequest);
router.get('/me', getMyLeaveRequests);
router.get('/company', getCompanyLeaveRequests);
router.patch('/:id/review', reviewLeaveRequest);

export default router;
