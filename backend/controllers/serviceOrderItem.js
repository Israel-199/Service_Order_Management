const serviceOrderItemService = require('../services/serviceOrderItemService');

class ServiceOrderItemController {
  async getItemsByServiceOrderId(req, res) {
    try {
      const { order_id } = req.params;
      const items = await serviceOrderItemService.getServiceOrderItemsByServiceOrderId(order_id);
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Error fetching items by service order ID:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  async getItemsByServiceTypeId(req, res) {
    try {
      const { service_type_id } = req.params;
      const items = await serviceOrderItemService.getServiceOrderItemsByServiceTypeId(service_type_id);
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Error fetching items by service type ID:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new ServiceOrderItemController();