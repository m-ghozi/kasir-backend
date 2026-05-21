import { Router } from 'express';
import { stockController } from '../controllers/stock.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Wajib Login
router.use(verifyToken);

// === Routes Stock In ===
router.get('/in', stockController.getStockIn);
router.post('/in', stockController.createStockIn);

// === Routes Stock Out ===
router.get('/out', stockController.getStockOut);
router.post('/out', stockController.createStockOut);

export default router;