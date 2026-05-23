import { Router } from 'express';
import { paymentMethodController } from '../controllers/paymentMethod.controller';

const router = Router();

// Listing & detail
router.get('/', paymentMethodController.getAll);          // ?includeInactive=true untuk semua
router.get('/:id', paymentMethodController.getById);

// CRUD
router.post('/', paymentMethodController.create);
router.put('/:id', paymentMethodController.update);
router.delete('/:id', paymentMethodController.hardDelete); // hapus permanen jika belum dipakai

// Aksi khusus
router.patch('/:id/deactivate', paymentMethodController.deactivate);
router.patch('/:id/set-default', paymentMethodController.setDefault);

export default router;