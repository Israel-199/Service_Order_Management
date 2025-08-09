'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Attachment
    await queryInterface.addIndex('attachments', ['order_id'], {
      name: 'idx_attachments_order_id',
    });

    // RecurringOrder
    await queryInterface.addIndex('recurring_orders', ['order_id'], {
      name: 'idx_recurring_orders_order_id',
    });

    // ServiceOrderItem
    await queryInterface.addIndex('service_order_items', ['order_id'], {
      name: 'idx_service_order_items_order_id',
    });
    await queryInterface.addIndex('service_order_items', ['service_type_id'], {
      name: 'idx_service_order_items_service_type_id',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('attachments', 'idx_attachments_order_id');
    await queryInterface.removeIndex('recurring_orders', 'idx_recurring_orders_order_id');
    await queryInterface.removeIndex('service_order_items', 'idx_service_order_items_order_id');
    await queryInterface.removeIndex('service_order_items', 'idx_service_order_items_service_type_id');
  },
};