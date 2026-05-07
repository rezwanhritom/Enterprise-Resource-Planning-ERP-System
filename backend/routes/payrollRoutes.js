import { Router } from 'express';
import {
  generatePayroll,
  getAllPayrolls,
  getPayrollByUser,
} from '../controllers/payrollController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.post('/generate', protect, authorizeRoles(ROLES.ADMIN, ROLES.HR_MANAGER), generatePayroll);
router.get('/me', protect, getPayrollByUser);
router.get('/all', protect, authorizeRoles(ROLES.ADMIN, ROLES.HR_MANAGER), getAllPayrolls);

export default router;
