import { Router } from 'express';
import { addNote, getEmployeeNotes } from '../controllers/performanceController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.post(
  '/',
  protect,
  authorizeRoles(
    ROLES.ADMIN,
    ROLES.HR_MANAGER,
    ROLES.SUPERVISOR,
    ROLES.PROCUREMENT_MANAGER,
    ROLES.FINANCE_MANAGER,
    ROLES.INVENTORY_MANAGER
  ),
  addNote
);

router.get('/', protect, getEmployeeNotes);

export default router;
