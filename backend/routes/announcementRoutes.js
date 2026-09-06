import { Router } from 'express';
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/', listAnnouncements);
router.post('/', createAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;
