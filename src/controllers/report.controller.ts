import { Request, Response } from 'express';
import { reportService } from '../services/report.service';

export const reportController = {
  getReport: async (req: Request, res: Response): Promise<void> => {
    try {
      // Ambil query parameter period, default ke 7 hari jika tidak diisi
      const period = req.query.period ? parseInt(req.query.period as string) : 7;

      if (isNaN(period) || (period !== 7 && period !== 30)) {
        res.status(400).json({ success: false, message: 'Periode laporan harus 7 atau 30 hari' });
        return;
      }

      const reportData = await reportService.getReportData(period);
      res.json({ success: true, data: reportData });
    } catch (error: any) {
      console.error("Report Error:", error);
      res.status(500).json({ success: false, message: 'Gagal memproses data laporan' });
    }
  }
};