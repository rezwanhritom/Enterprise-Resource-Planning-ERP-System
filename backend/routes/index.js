import { Router } from 'express';

const router = Router();

// Import route modules here as you add features
// import userRoutes from './userRoutes.js';
// router.use('/users', userRoutes);

router.get('/', (req, res) => {
  res.json({ message: 'ERP API - use /api/health for health check' });
});

export default router;
