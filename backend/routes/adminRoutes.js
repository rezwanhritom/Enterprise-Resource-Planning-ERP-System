import { Router } from 'express';
import { createUser, getAllUsers } from '../controllers/adminController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.use(protect, authorizeRoles(ROLES.ADMIN));

router.post('/create-user', createUser);
router.get('/all-users', getAllUsers);

export default router;
