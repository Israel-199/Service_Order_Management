const serviceOrderService = require('../services/serviceOrderService');

class ServiceOrderController {
  // GET /service-orders
  async getAllServiceOrders(req, res, next) {
    try {
      const result = await serviceOrderService.getAllServiceOrders(req.query);
      res.status(200).json({ message: 'Service orders fetched successfully', ...result });
    } catch (err) {
      next(err);
    }
  }

  // POST /service-orders
  async createServiceOrder(req, res, next) {
    try {
      const data = req.body;
      const order = await serviceOrderService.createServiceOrder(data);
      res.status(201).json({ message: 'Service order created', order });
    } catch (error) {
      next(error);
    }
  }

  // PUT /service-orders/:order_id
  async updateServiceOrder(req, res, next) {
    try {
      const { order_id } = req.params;
      const data = req.body;
      const updatedOrder = await serviceOrderService.updateServiceOrder(order_id, data);
      res.status(200).json({ message: 'Service order updated successfully', service_order: updatedOrder });
    } catch (err) {
      next(err);
    }
  }

  // GET /service-orders/:order_id
  async getServiceOrderById(req, res, next) {
    try {
      const { order_id } = req.params;
      const serviceOrder = await serviceOrderService.getServiceOrderById(order_id);
      if (!serviceOrder) {
        return res.status(404).json({ error: 'Not Found', message: 'Service order not found' });
      }
      res.status(200).json({ message: 'Service order details retrieved', service_order: serviceOrder });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /service-orders/:order_id
  async deleteServiceOrder(req, res, next) {
    try {
      const { order_id } = req.params;
      await serviceOrderService.deleteServiceOrder(order_id);
      res.status(200).json({ message: 'Service order deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ServiceOrderController();
