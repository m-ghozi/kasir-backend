import { Request, Response } from 'express';
import { expenseService } from '../services/expense.service';

export const expenseController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const range = (req.query.range as string) || 'all';
      const categoryId = req.query.categoryId ? Number(req.query.categoryId as string) : undefined;
      const paymentMethodId = req.query.paymentMethodId ? Number(req.query.paymentMethodId as string) : undefined;
      const date = req.query.date as string | undefined; // ← tambah ini

      const data = await expenseService.getAll({ range: range as any, categoryId, paymentMethodId, date });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSummary: async (req: Request, res: Response): Promise<void> => {
    try {
      const range = (req.query.range as string) || 'all';
      const categoryId = req.query.categoryId ? Number(req.query.categoryId as string) : undefined;
      const date = req.query.date as string | undefined; // ← tambah ini

      const data = await expenseService.getSummary({ range: range as any, categoryId, date });
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = await expenseService.getById(id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Pengeluaran tidak ditemukan' });
        return;
      }
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, categoryId, amount, paymentMethodId, date, notes } = req.body;

      // Validasi wajib
      if (!title?.trim()) {
        res.status(400).json({ success: false, message: 'Judul pengeluaran wajib diisi' });
        return;
      }
      if (!categoryId) {
        res.status(400).json({ success: false, message: 'Kategori wajib dipilih' });
        return;
      }
      if (!amount || Number(amount) <= 0) {
        res.status(400).json({ success: false, message: 'Nominal harus lebih dari 0' });
        return;
      }
      if (!date) {
        res.status(400).json({ success: false, message: 'Tanggal wajib diisi' });
        return;
      }

      // createdById diambil dari token (di-inject oleh middleware verifyToken)
      const createdById = req.user?.userId;
      if (!createdById) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const data = await expenseService.create(
        {
          title,
          categoryId: Number(categoryId),
          amount: Number(amount),
          paymentMethodId: paymentMethodId ? Number(paymentMethodId) : undefined,
          date,
          notes,
        },
        createdById,
      );

      res.status(201).json({ success: true, message: 'Pengeluaran berhasil dicatat', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { title, categoryId, amount, paymentMethodId, date, notes } = req.body;

      // Pastikan expense ada
      const existing = await expenseService.getById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Pengeluaran tidak ditemukan' });
        return;
      }

      const data = await expenseService.update(id, {
        title,
        categoryId: categoryId ? Number(categoryId) : undefined,
        amount: amount !== undefined ? Number(amount) : undefined,
        paymentMethodId: paymentMethodId !== undefined ? Number(paymentMethodId) : undefined,
        date,
        notes,
      });

      res.json({ success: true, message: 'Pengeluaran berhasil diperbarui', data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const existing = await expenseService.getById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Pengeluaran tidak ditemukan' });
        return;
      }

      await expenseService.delete(id);
      res.json({ success: true, message: 'Pengeluaran berhasil dihapus' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
