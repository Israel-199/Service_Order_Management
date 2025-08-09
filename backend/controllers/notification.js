// controllers/notificationController.js
const notificationService = require("../services/notificationService");

class NotificationController {
  async getNotifications(req, res) {
    try {
      const notifications = await notificationService.getUnreadNotifications();
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      const result = await notificationService.markAllAsRead();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new NotificationController();
