import { Request, Response } from 'express';
import { transactionService } from '../services/transaction.service';

export const transactionController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const transactions = await transactionService.getAllTransactions();
      res.json({ success: true, data: transactions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string);
      const transaction = await transactionService.getTransactionById(id);

      if (!transaction) {
        res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
        return;
      }

      res.json({ success: true, data: transaction });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      // req.user didapatkan dari middleware auth
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Sesi tidak valid' });
        return;
      }

      // Pastikan ada item yang dikirim
      if (!req.body.items || req.body.items.length === 0) {
        res.status(400).json({ success: false, message: 'Keranjang belanja kosong!' });
        return;
      }

      const newTransaction = await transactionService.createTransaction(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Transaksi berhasil disimpan',
        data: newTransaction
      });
    } catch (error: any) {
      // Error handling jika stok tiba-tiba kurang atau ID produk salah
      console.error("Transaction Error:", error);
      res.status(500).json({ success: false, message: 'Gagal memproses transaksi: ' + error.message });
    }
  }
};