import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Wajib Login untuk melihat Dashboard
router.use(verifyToken);

// Cukup 1 endpoint GET ke '/'
router.get('/', dashboardController.getDashboardData);

export default router;