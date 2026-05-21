import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Proteksi rute dengan middleware JWT
router.use(verifyToken);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.delete); // Menonaktifkan akun (Soft Delete)

export default router;