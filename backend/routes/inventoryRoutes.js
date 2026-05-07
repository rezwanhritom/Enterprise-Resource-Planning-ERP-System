import { Router } from 'express';
import {
  addItem,
  getInventorySummary,
  getItems,
  updateStock,
} from '../controllers/inventoryController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.post('/', protect, authorizeRoles(ROLES.ADMIN, ROLES.INVENTORY_MANAGER), addItem);
router.put('/:id', protect, authorizeRoles(ROLES.ADMIN, ROLES.INVENTORY_MANAGER), updateStock);
router.get('/', protect, getItems);
router.get('/summary', protect, getInventorySummary);

export default router;
