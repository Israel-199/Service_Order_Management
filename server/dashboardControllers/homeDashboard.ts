import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboardService';

class DashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string, 10) || 7;
      const data = await dashboardService.getDashboardData(days);
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
      next(err);
    }
  }
}

export default new DashboardController();
