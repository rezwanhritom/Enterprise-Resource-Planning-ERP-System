import { Router } from 'express';
import {
  addExpense,
  addRevenue,
  getReports,
  getTransactions,
} from '../controllers/financeController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(
  protect,
  authorizeRoles(ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.FINANCE_MANAGER)
);

router.post('/expense', addExpense);
router.post('/revenue', addRevenue);
router.get('/reports', getReports);
router.get('/transactions', getTransactions);

export default router;
