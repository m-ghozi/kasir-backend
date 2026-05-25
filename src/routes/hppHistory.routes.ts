import { Router } from 'express';
import { hppHistoryController } from '../controllers/hppHistory.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', hppHistoryController.getAll);
router.get('/product/:productId', hppHistoryController.getByProduct);
router.post('/manual', hppHistoryController.updateManual);

export default router;