import { Router } from 'express';
import { expenseCategoryController } from '../controllers/expenseCategory.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', expenseCategoryController.getAll);
router.get('/:id', expenseCategoryController.getById);
router.post('/', expenseCategoryController.create);
router.put('/:id', expenseCategoryController.update);
router.delete('/:id', expenseCategoryController.delete);

export default router;
