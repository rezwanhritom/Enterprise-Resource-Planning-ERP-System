import { Router } from 'express';
import {
  exportFinanceCsv,
  exportInventoryCsv,
  exportPayrollCsv,
} from '../controllers/exportController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.get(
  '/payroll',
  protect,
  authorizeRoles(ROLES.ADMIN, ROLES.HR_MANAGER),
  exportPayrollCsv
);
router.get(
  '/inventory',
  protect,
  authorizeRoles(ROLES.ADMIN, ROLES.INVENTORY_MANAGER),
  exportInventoryCsv
);
router.get(
  '/finance',
  protect,
  authorizeRoles(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.FINANCE_MANAGER),
  exportFinanceCsv
);

export default router;
