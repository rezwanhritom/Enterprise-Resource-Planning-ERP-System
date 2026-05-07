import { Router } from 'express';
import { getInbox, getMessages, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.post('/', sendMessage);
router.get('/', getMessages);
router.get('/inbox', getInbox);

export default router;
