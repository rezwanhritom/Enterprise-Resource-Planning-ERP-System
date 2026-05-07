import { Router } from 'express';
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from '../controllers/departmentController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(protect, authorizeRoles(ROLES.ADMIN));

router.route('/').post(createDepartment).get(getDepartments);
router.route('/:id').put(updateDepartment).delete(deleteDepartment);

export default router;
