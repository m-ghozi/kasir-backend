import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
  getDashboardData: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await dashboardService.getSummary();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Dashboard Error:", error);
      res.status(500).json({ success: false, message: 'Gagal memuat data dashboard' });
    }
  }
};