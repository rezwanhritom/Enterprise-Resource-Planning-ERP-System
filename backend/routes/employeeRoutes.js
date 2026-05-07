import { Router } from 'express';
import {
  getAllEmployees,
  getProfile,
  updateProfile,
} from '../controllers/employeeController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/all', protect, authorizeRoles(ROLES.ADMIN), getAllEmployees);

export default router;
