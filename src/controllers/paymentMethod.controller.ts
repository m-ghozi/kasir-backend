import { Request, Response } from 'express';
import { paymentMethodService } from '../services/paymentMethod.service';

export const paymentMethodController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const data = await paymentMethodService.getAll(includeInactive);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = await paymentMethodService.getById(id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Payment method tidak ditemukan' });
        return;
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, category, isDefault } = req.body;
      if (!name || !category) {
        res.status(400).json({ success: false, message: 'Field name dan category wajib diisi' });
        return;
      }
      const validCategories = ['tunai', 'transfer', 'qris', 'e-wallet'];
      if (!validCategories.includes(category)) {
        res.status(400).json({
          success: false,
          message: `Category tidak valid. Pilihan: ${validCategories.join(', ')}`,
        });
        return;
      }
      const data = await paymentMethodService.create({ name, category, isDefault });
      res.status(201).json({ success: true, message: 'Metode pembayaran berhasil ditambahkan', data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ success: false, message: 'Nama metode pembayaran sudah digunakan' });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { name, category, isDefault, isActive } = req.body;
      if (category) {
        const validCategories = ['tunai', 'transfer', 'qris', 'e-wallet'];
        if (!validCategories.includes(category)) {
          res.status(400).json({
            success: false,
            message: `Category tidak valid. Pilihan: ${validCategories.join(', ')}`,
          });
          return;
        }
      }
      const data = await paymentMethodService.update(id, { name, category, isDefault, isActive });
      res.json({ success: true, message: 'Metode pembayaran berhasil diubah', data });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, message: 'Payment method tidak ditemukan' });
        return;
      }
      if (error.code === 'P2002') {
        res.status(409).json({ success: false, message: 'Nama metode pembayaran sudah digunakan' });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await paymentMethodService.delete(id);
      res.json({ success: true, message: 'Metode pembayaran berhasil dihapus' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, message: 'Payment method tidak ditemukan' });
        return;
      }
      res.status(400).json({ success: false, message: error.message });
    }
  },

  deactivate: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = await paymentMethodService.deactivate(id);
      res.json({ success: true, message: 'Metode pembayaran berhasil dinonaktifkan', data });
    } catch (error: any) {
      const status = error.message.includes('tidak ditemukan') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  setDefault: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = await paymentMethodService.setDefault(id);
      res.json({ success: true, message: 'Default metode pembayaran berhasil diubah', data });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ success: false, message: 'Payment method tidak ditemukan' });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  },
};