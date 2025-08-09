import { Notification } from "../models/notification";
//import { db } from "../models/index";
//import type { Transaction } from "sequelize";
import type { NotificationAttributes, NotificationCreationAttributes } from "../models/notification";

class NotificationService {
  async getUnreadNotifications(): Promise<Notification[]> {
    return await Notification.findAll({
      where: { read: false },
      order: [["created_at", "DESC"]],
      limit: 10,
    });
  }

  async createNotification(
    serviceOrderId: number,
    type: string,
    message: string
  ): Promise<Notification | null> {
    try {
      return await Notification.create({
        service_order_id: serviceOrderId,
        type,
        message,
        created_at: new Date(),
      } as NotificationCreationAttributes);
    } catch (err: any) {
      console.error("Notification creation failed:", err.message);
      return null;
    }
  }

  async markAllAsRead(): Promise<{ message: string }> {
    await Notification.update(
      { read: true },
      { where: { read: false } }
    );
    return { message: "All notifications marked as read" };
  }
}

export default new NotificationService();
