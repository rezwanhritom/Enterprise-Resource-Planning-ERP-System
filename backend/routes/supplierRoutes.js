import { Router } from 'express';
import { createSupplier, getSuppliers } from '../controllers/supplierController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.post(
  '/',
  protect,
  authorizeRoles(ROLES.ADMIN, ROLES.PROCUREMENT_MANAGER),
  createSupplier
);
router.get('/', protect, getSuppliers);

export default router;
