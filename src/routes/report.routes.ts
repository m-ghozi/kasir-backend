import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Proteksi rute laporan dengan token JWT
router.use(verifyToken);

router.get('/', reportController.getReport);

export default router;