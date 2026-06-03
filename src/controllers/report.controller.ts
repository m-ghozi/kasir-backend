import { Request, Response } from 'express';
import { reportService } from '../services/report.service';

export const reportController = {
  getReport: async (req: Request, res: Response): Promise<void> => {
    try {
      const { period, date } = req.query;

      // Mode harian: ?date=2026-05-30
      if (date) {
        const dateStr = date as string;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          res.status(400).json({ success: false, message: 'Format tanggal harus YYYY-MM-DD' });
          return;
        }
        const reportData = await reportService.getDailyReport(dateStr);
        res.json({ success: true, data: reportData });
        return;
      }

      // Mode periode: ?period=7 atau ?period=30
      const days = period ? parseInt(period as string) : 7;
      if (isNaN(days) || (days !== 7 && days !== 30)) {
        res.status(400).json({ success: false, message: 'Periode laporan harus 7 atau 30 hari' });
        return;
      }

      const reportData = await reportService.getReportData(days);
      res.json({ success: true, data: reportData });
    } catch (error: any) {
      console.error('Report Error:', error);
      res.status(500).json({ success: false, message: 'Gagal memproses data laporan' });
    }
  },
};