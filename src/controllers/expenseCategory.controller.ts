import { Request, Response } from 'express';
import { expenseCategoryService } from '../services/expenseCategory.service';

export const expenseCategoryController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await expenseCategoryService.getAll();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = await expenseCategoryService.getById(id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
        return;
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, color, icon } = req.body;
      if (!name || !color || !icon) {
        res.status(400).json({ success: false, message: 'Nama, warna, dan icon wajib diisi' });
        return;
      }
      const data = await expenseCategoryService.create({ name, color, icon });
      res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { name, color, icon } = req.body;
      const data = await expenseCategoryService.update(id, { name, color, icon });
      res.json({ success: true, message: 'Kategori berhasil diubah', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await expenseCategoryService.delete(id);
      res.json({ success: true, message: 'Kategori berhasil dihapus' });
    } catch (error: any) {
      // Pesan error dari service (misal ada expense aktif) dikirim ke client
      const status = error.message.includes('tidak bisa dihapus') ? 409 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },
};
