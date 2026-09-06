import { Router } from 'express';
import {
  getCurrentUser,
  listFeatureCatalog,
  listPublicCompanies,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerCompany,
  registerJoinCompany,
  registerUser,
} from '../controllers/authController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logoutUser);
router.post('/register-company', registerCompany);
router.post('/register-join', registerJoinCompany);
router.get('/companies', listPublicCompanies);
router.get('/features', listFeatureCatalog);
router.post('/register', protect, authorizeRoles(ROLES.ADMIN), registerUser);
router.get('/me', protect, getCurrentUser);

export default router;
