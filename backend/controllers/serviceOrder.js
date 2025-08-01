const serviceOrderService = require('../services/serviceOrderService');


class ServiceOrderController {
  async getAllServiceOrders(req, res, next) {
    try {
      const result = await serviceOrderService.getAllServiceOrders(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
    async createServiceOrder(req, res, next) {
        try {
            const data = req.body;
            const order = await serviceOrderService.createServiceOrder(data);
            res.status(201).json({ message: 'Service order created', order });
        } catch (error) {
            next(error); // will be handled by errorHandler middleware
        }
    }

    async updateServiceOrder(req, res, next) {
        try {
            const id = req.params.order_id;
            const data = req.body;
            const updatedOrder = await serviceOrderService.updateServiceOrder(id, data);
            res.status(200).json({ message: 'Service order updated successfully', service_order: updatedOrder });
        } catch (err) {
            next(err);
        }
    }

    async getServiceOrderById(req, res, next) {
        try {
            const id = req.params.order_id;
            const serviceOrder = await serviceOrderService.getServiceOrderById(id);
            if (!serviceOrder) {
                return res.status(404).json({ error: 'Not Found', message: 'Service order not found' });
            }
            res.status(200).json({ message: 'Service order details retrieved', service_order: serviceOrder });
        } catch (err) {
            next(err);
        }
    }

    async deleteServiceOrder(req, res, next) {
        try {
            const id = req.params.order_id;
            await serviceOrderService.deleteServiceOrder(id);
            res.status(200).json({ message: 'Service order deleted successfully' });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new ServiceOrderController();
