import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', transactionController.getAll);
router.get('/:id', transactionController.getById);
router.post('/', transactionController.create);

router.put('/:id/pay', transactionController.payHold);

export default router;