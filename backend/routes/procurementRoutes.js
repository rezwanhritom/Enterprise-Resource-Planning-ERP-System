import { Router } from 'express';
import {
  approveRequest,
  createRequest,
  getRequests,
  rejectRequest,
} from '../controllers/procurementController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.put(
  '/:id/approve',
  protect,
  authorizeRoles(ROLES.ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.SUPERVISOR),
  approveRequest
);
router.put(
  '/:id/reject',
  protect,
  authorizeRoles(ROLES.ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.SUPERVISOR),
  rejectRequest
);

export default router;
