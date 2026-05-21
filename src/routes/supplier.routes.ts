import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Proteksi rute agar hanya bisa diakses setelah login
router.use(verifyToken);

router.get('/', supplierController.getAll);             // Ambil semua
router.get('/:id', supplierController.getById);         // Ambil detail 1
router.post('/', supplierController.create);            // Tambah baru
router.put('/:id', supplierController.update);          // Edit
router.delete('/:id', supplierController.delete);       // Hapus (Soft delete)

export default router;