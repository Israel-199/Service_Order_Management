// controllers/analyticsController.ts
import { Request, Response, NextFunction } from "express";
import dashboardService from "../services/dashboardService";

class AnalyticsController {
  // GET /api/dashboard
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getAnalyticData();
      res.status(200).json({ success: true, data });
    } catch (err) {
      console.error("Dashboard error:", err);
      next(err);
    }
  }
}

export default new AnalyticsController();
