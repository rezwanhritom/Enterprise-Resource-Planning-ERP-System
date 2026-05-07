import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { authorizeRoles, protect } from '../middleware/authMiddleware.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.get('/', protect, authorizeRoles(ROLES.ADMIN), getAuditLogs);

export default router;
