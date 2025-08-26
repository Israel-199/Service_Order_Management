// scripts/overdueChecker.ts  (or wherever you keep the cron job)
import cron from "node-cron";
import { Op } from "sequelize";
import { db } from "../models/index";
import notificationService from "../services/notificationService";

cron.schedule("0 0 * * *", async () => {
  try {
    const overdueOrders = await db.ServiceOrder.findAll({
      where: {
        due_date: { [Op.lt]: new Date() },
        status: { [Op.ne]: "completed" },
      },
    });

    for (const order of overdueOrders) {
      // fetch assignments in a single query per order (fast)
      const assignments = await db.ServiceOrderAssignment.findAll({
        where: { order_id: order.order_id },
      });

      for (const assignment of assignments) {
        try {
          await notificationService.createNotification(
            order.order_id,
            "overdue",
            `Service order ${order.order_id} is overdue`
          );
        } catch (err) {
          console.error(
            `Failed to create overdue notification for order ${order.order_id} assignment ${assignment.assignment_id}:`,
            err
          );
        }
      }
    }
  } catch (error) {
    console.error("Error running overdue orders cron job:", error);
  }
});
