import { Router } from 'express';
import {
  getAllEmployees,
  getProfile,
  updateProfile,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get(
  '/all',
  protect,
  getAllEmployees
);

export default router;
