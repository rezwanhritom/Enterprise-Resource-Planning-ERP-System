import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './routes/index.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import procurementRoutes from './routes/procurementRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import performanceRoutes from './routes/performanceRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import peerReviewRoutes from './routes/peerReviewRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import globalErrorHandler from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../frontend/dist');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API health check successful',
    data: {
      status: 'ok',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/peer-reviews', peerReviewRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api', routes);

// Production: serve Vite build from the same Render web service.
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  return res.sendFile(path.join(frontendDist, 'index.html'), (error) => {
    if (error) {
      return res.status(404).json({
        success: false,
        message: 'Frontend build not found. Run npm run build first.',
      });
    }
    return undefined;
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(globalErrorHandler);

export default app;
