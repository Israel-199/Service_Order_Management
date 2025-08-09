'use strict';

const { Notification } = require('../models');

class NotificationService {
  async getUnreadNotifications() {
    return await Notification.findAll({
      where: { read: false },
      order: [['created_at', 'DESC']],
      limit: 10
    });
  }

  async createNotification(serviceOrderId, type, message) {
    try {
      return await Notification.create({
        service_order_id: serviceOrderId,
        type,
        message,
        created_at: new Date()
      });
    } catch (err) {
      console.error('Notification creation failed:', err.message);
      return null;
    }
  }

  async markAllAsRead() {
    await Notification.update(
      { read: true },
      { where: { read: false } }
    );
    return { message: 'All notifications marked as read' };
  }
}

module.exports = new NotificationService();

  // async getUnreadNotifications(employeeId) {
  //   try {
  //     const notifications = await Notification.findAll({
  //       where: {
  //         employee_id: employeeId,
  //         read: false,
  //       },
  //       include: [
  //         { model: ServiceOrder, attributes: ['order_id', 'status', 'due_date'] },
  //       ],
  //       order: [['created_at', 'DESC']],
  //     });
  //     return notifications;
  //   } catch (error) {
  //     if (error.name === 'SequelizeDatabaseError' && error.parent && error.parent.code === 'ER_LOCK_WAIT_TIMEOUT') {
  //       throw new Error('Database lock timeout during notification retrieval. Please try again.');
  //     }
  //     throw error;
  //   }
  // }