const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      // you can override recentDays via ?days=3
      const days = parseInt(req.query.days, 10) || 7;
      const data = await dashboardService.getDashboardData(days);
      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
      next(err);
    }
  }
}

module.exports = new DashboardController();