import { Router } from 'express';

const router = Router();

// Import route modules here as you add features
// import userRoutes from './userRoutes.js';
// router.use('/users', userRoutes);

router.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'ERP API root endpoint',
    data: {
      info: 'Use /api/health for health check',
    },
  });
});

export default router;
