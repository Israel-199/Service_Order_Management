const cron = require('node-cron');
const { ServiceOrder, ServiceOrderAssignment, Op } = require('../models');
const notificationService = require('./notificationService');

cron.schedule('0 0 * * *', async () => { // Run daily at midnight
  const overdueOrders = await ServiceOrder.findAll({
    where: {
      due_date: { [Op.lt]: new Date() },
      status: { [Op.ne]: 'completed' },
    },
  });
  for (const order of overdueOrders) {
    const assignments = await ServiceOrderAssignment.findAll({
      where: { order_id: order.order_id },
    });
    for (const assignment of assignments) {
      await notificationService.createNotification(
        assignment.employees_id,
        order.order_id,
        'overdue',
        `Service order ${order.order_id} is overdue`
      );
    }
  }
});