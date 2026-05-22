import { Router } from 'express';
import { unitController } from '../controllers/unit.controller';

const router = Router();

router.get('/', unitController.getAll);
router.get('/:id', unitController.getById);
router.post('/', unitController.create);
router.put('/:id', unitController.update);
router.delete('/:id', unitController.delete);

export default router;