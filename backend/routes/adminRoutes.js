import { Router } from 'express';
import {
  approveJoinRequest,
  createUser,
  getAllUsers,
  getCompanySettings,
  getJoinRequests,
  rejectJoinRequest,
  updateCompanySettings,
  updateCompanyUser,
} from '../controllers/adminController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(protect, authorizeRoles(ROLES.ADMIN));

router.post('/create-user', createUser);
router.get('/all-users', getAllUsers);
router.patch('/users/:userId', updateCompanyUser);
router.get('/join-requests', getJoinRequests);
router.post('/join-requests/:userId/approve', approveJoinRequest);
router.post('/join-requests/:userId/reject', rejectJoinRequest);
router.get('/company', getCompanySettings);
router.patch('/company', updateCompanySettings);

export default router;
