import { Request, Response } from 'express';
import { storeSettingService } from '../services/storeSetting.service';

export const storeSettingController = {
  get: async (req: Request, res: Response): Promise<void> => {
    try {
      const settings = await storeSettingService.getSettings();
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      // Catatan opsional: Anda bisa memvalidasi role di sini jika diperlukan (ex: req.user.role === 'owner')
      const updated = await storeSettingService.updateSettings(req.body);
      res.json({
        success: true,
        message: 'Pengaturan toko berhasil diperbarui',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};