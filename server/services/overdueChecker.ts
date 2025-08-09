import cron from "node-cron";
import { Op } from "sequelize";
import { ServiceOrder } from "../models/serviceOrder";
import { ServiceOrderAssignment } from "../models/serviceOrderAssignment";
import notificationService from "./notificationService";

cron.schedule("0 0 * * *", async () => {
  try {
    const overdueOrders = await ServiceOrder.findAll({
      where: {
        due_date: { [Op.lt]: new Date() },
        status: { [Op.ne]: "completed" },
      },
    });

    for (const order of overdueOrders) {
      const assignments = await ServiceOrderAssignment.findAll({
        where: { order_id: order.order_id },
      });

      for (const assignment of assignments) {
        await notificationService.createNotification(
          order.order_id,
          "overdue",
          `Service order ${order.order_id} is overdue`
        );
      }
    }
  } catch (error) {
    console.error("Error running overdue orders cron job:", error);
  }
});
