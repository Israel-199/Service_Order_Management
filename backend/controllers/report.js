const ReportService = require('../services/report');

async function getServiceOrderReport(req, res, next) {
  try {
    const reportData = await ReportService.getServiceOrderReport(req.query);
    res.json(reportData);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getServiceOrderReport,
};
