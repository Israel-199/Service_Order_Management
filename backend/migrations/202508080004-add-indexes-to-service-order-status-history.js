'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('service_order_status_history', ['order_id'], {
      name: 'idx_service_order_status_history_order_id',
    });
    await queryInterface.addIndex('service_order_status_history', ['changed_by'], {
      name: 'idx_service_order_status_history_changed_by',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('service_order_status_history', 'idx_service_order_status_history_order_id');
    await queryInterface.removeIndex('service_order_status_history', 'idx_service_order_status_history_changed_by');
  },
};