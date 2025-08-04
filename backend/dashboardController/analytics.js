const { ServiceOrder, ServiceType, Customer, Employee, ServiceOrderAssignment, Attachment } = require('../models');
const dashboardService = require("../services/dashboardService")

class analyticsController {
  // GET /api/dashboard
  async getDashboard(req, res, next) {
    try {
      const days = parseInt(req.query.days,10) || 7;
      const data = await dashboardService.getAnalyticData({ recentDays: days });
      res.status(200).json({ success: true, data });
    } catch (err) {
      console.error('Dashboard error:', err);
      next(err);
    }
  }
}

module.exports = new analyticsController();