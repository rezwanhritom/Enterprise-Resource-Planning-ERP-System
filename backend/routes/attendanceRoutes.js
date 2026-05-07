import { Router } from 'express';
import {
  getAllAttendance,
  getAttendanceByUser,
  markAttendance,
} from '../controllers/attendanceController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.post('/mark', protect, markAttendance);
router.get('/me', protect, getAttendanceByUser);
router.get(
  '/all',
  protect,
  authorizeRoles(ROLES.ADMIN, ROLES.HR_MANAGER),
  getAllAttendance
);

export default router;
