import { Router } from 'express';
import { paymentMethodController } from '../controllers/paymentMethod.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', paymentMethodController.getAll);
router.get('/:id', paymentMethodController.getById);
router.post('/', paymentMethodController.create);
router.put('/:id', paymentMethodController.update);
router.delete('/:id', paymentMethodController.delete);
router.patch('/:id/deactivate', paymentMethodController.deactivate);
router.patch('/:id/set-default', paymentMethodController.setDefault);

export default router;