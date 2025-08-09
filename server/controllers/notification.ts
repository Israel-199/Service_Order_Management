import { Request, Response } from "express";
import notificationService from "../services/notificationService";

class NotificationController {
  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const notifications = await notificationService.getUnreadNotifications();
      res.status(200).json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const result = await notificationService.markAllAsRead();
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new NotificationController();