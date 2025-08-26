// services/notificationService.ts
import { db } from "../models/index";

type NotificationType = "completed" | "assigned" | "overdue" | "new_order";

class NotificationService {
  /**
   * Create a notification. Retries a few times on transient failures (locks).
   * NOTE: call this AFTER committing any transaction that created the referenced service_order row.
   */
  async createNotification(
    serviceOrderId: number,
    type: NotificationType,
    message: string,
    retries = 3,
    delayMs = 200
  ) {
    let attempts = 0;
    while (attempts < retries) {
      try {
        const notification = await db.Notification.create({
          service_order_id: serviceOrderId,
          type,
          message,
          read: false,
          created_at: new Date(),
        });
        return notification;
      } catch (err: any) {
        attempts++;
        // Log each failure so we don't stay silent
        console.error(
          `Notification creation attempt ${attempts} failed:`,
          err.message ?? err
        );

        // If it's a lock wait timeout, retry after a short delay
        if (
          err &&
          err.parent &&
          (err.parent.code === "ER_LOCK_WAIT_TIMEOUT" ||
            err.parent.errno === 1205)
        ) {
          if (attempts < retries) {
            await new Promise((res) => setTimeout(res, delayMs * attempts));
            continue;
          }
        }

        // For other errors or after retries exhausted, throw
        throw err;
      }
    }
  }
  async getUnreadNotifications() {
    return await db.Notification.findAll({
      where: { read: false },
      order: [["created_at", "DESC"]],
    });
  }

  // Mark all notifications as read
  async markAllAsRead() {
    const [updatedCount] = await db.Notification.update(
      { read: true },
      { where: { read: false } }
    );

    return { updatedCount };
  }
}

export default new NotificationService();
