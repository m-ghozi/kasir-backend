import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { validateProduct } from '../middlewares/validate.middleware';
const router = Router();

router.use(verifyToken);

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', validateProduct, productController.create);
router.put('/:id', validateProduct, productController.update);
router.delete('/:id', productController.delete);

export default router;