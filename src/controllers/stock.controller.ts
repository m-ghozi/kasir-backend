import { Request, Response } from 'express';
import { stockService } from '../services/stock.service';

export const stockController = {
  // === STOCK IN ===
  getStockIn: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await stockService.getAllStockIn();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createStockIn: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { productId, quantity, buyPrice } = req.body;

      if (!productId || !quantity || !buyPrice) {
        res.status(400).json({ success: false, message: 'Produk, Jumlah, dan Harga Beli wajib diisi!' });
        return;
      }

      const newStockIn = await stockService.createStockIn(req.body, userId);
      res.status(201).json({ success: true, message: 'Stok masuk berhasil dicatat', data: newStockIn });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // === STOCK OUT ===
  getStockOut: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await stockService.getAllStockOut();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createStockOut: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { productId, quantity, reason } = req.body;

      if (!productId || !quantity || !reason) {
        res.status(400).json({ success: false, message: 'Produk, Jumlah, dan Alasan wajib diisi!' });
        return;
      }

      const newStockOut = await stockService.createStockOut(req.body, userId);
      res.status(201).json({ success: true, message: 'Stok keluar berhasil dicatat', data: newStockOut });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};