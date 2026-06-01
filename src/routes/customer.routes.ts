import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);
router.get('/:id/transactions', customerController.getTransactions);
router.post('/', customerController.create);
router.put('/:id', customerController.update);
router.delete('/:id', customerController.delete);

export default router;