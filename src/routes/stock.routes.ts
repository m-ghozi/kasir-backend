import { Router } from 'express';
import { stockController } from '../controllers/stock.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

// === Stock In ===
router.get('/in', stockController.getStockIn);
router.post('/in', stockController.createStockIn);

// === Stock Out ===
router.get('/out', stockController.getStockOut);
router.post('/out', stockController.createStockOut);

// === Report ===
// GET /stocks/report?period=7   → laporan 7 hari terakhir
// GET /stocks/report?period=30  → laporan 30 hari terakhir
router.get('/report', stockController.getReport);

export default router;