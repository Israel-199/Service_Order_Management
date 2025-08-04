// controllers/serviceOrder.js
const { ServiceOrder,
  ServiceOrderAssignment,
  Employee,
  sequelize,         // ← your connected instance
  Sequelize } = require('../models');

const dashboardService = require('../services/dashboardService');
const serviceOrderService = require('../services/serviceOrderService');

/** 
//ServiceOrderController class to handle service order operations
// This controller will handle all the service order related requests
// and interact with the serviceOrderService for business logic.
// It will also handle validation and error responses.
// Each method corresponds to a specific route and performs the necessary operations.
// The methods will return JSON responses with appropriate status codes.
// The controller will be used in the serviceOrderRoutes file to define the routes.
*/

class ServiceOrderController {

  async getAllServiceOrders(req, res, next) {
    try {
      // Extract query parameters with defaults
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const sortBy = req.query.sortBy || 'order_id';
      const order = req.query.order && req.query.order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

      // Validate query parameters
      const validSortFields = ['order_id', 'status', 'priority', 'created_at'];
      if (!validSortFields.includes(sortBy)) {
        return res.status(400).json({ error: 'Invalid sortBy field', validFields: validSortFields });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Fetch service orders with pagination and sorting
      const { count, rows: serviceOrders } = await ServiceOrder.findAndCountAll({
        include: [
          {
            model: ServiceType,
            attributes: ['name'], // For ServiceTypeName
          },
          {
            model: Customer,
            attributes: ['name', 'email'], // For customerName, customerEmail
          },
          {
            model: ServiceOrderAssignment,
            include: [
              {
                model: Employee,
                attributes: ['name', 'email'], // For assignedEmployees
              },
            ],
          },
          {
            model: Attachment,
            attributes: ['file_path', 'file_type'], // For serviceOrderOrderAttachments
          },
        ],
        attributes: ['order_id', 'status', 'priority', 'created_at'], // Include created_at for sorting
        limit,
        offset,
        order: [[sortBy, order]],
      });

      // Check if any service orders exist
      if (!serviceOrders || serviceOrders.length === 0) {
        return res.status(404).json({ error: 'No service orders found' });
      }

      // Format the response for the frontend
      const response = serviceOrders.map(serviceOrder => ({
        orderId: serviceOrder.order_id,
        serviceTypeName: serviceOrder.ServiceType ? serviceOrder.ServiceType.name : null,
        customerName: serviceOrder.Customer ? serviceOrder.Customer.name : null,
        customerEmail: serviceOrder.Customer ? serviceOrder.Customer.email : null,
        serviceOrderStatus: serviceOrder.status,
        serviceOrderPriority: serviceOrder.priority,
        assignedEmployees: serviceOrder.ServiceOrderAssignments.map(assignment => ({
          name: assignment.Employee ? assignment.Employee.name : null,
          email: assignment.Employee ? assignment.Employee.email : null,
        })),
        serviceOrderOrderAttachments: serviceOrder.Attachments.map(attachment => ({
          file_path: attachment.file_path,
          file_type: attachment.file_type,
        })),
      }));

      // Calculate pagination metadata
      const totalItems = count;
      const totalPages = Math.ceil(totalItems / limit);

      // Send the response with pagination metadata
      res.status(200).json({
        data: response,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      next(error); // Pass errors to error-handling middleware
    }
  }

    // POST /api/service-orders
    async createServiceOrder(req, res, next) {
        try {
            const data = req.body;
            const order = await serviceOrderService.createServiceOrder(data);
            res.status(201).json({ message: 'Service order created', order });
        } catch (error) {
            console.error('Error creating service order:', error);

            // Handle Sequelize foreign key constraint error
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                const field = error?.fields?.[0] || 'unknown';
                return res.status(400).json({
                    error: 'Bad Request',
                    message: `Invalid foreign key: ${field}. Make sure the referenced ID exists.`,
                    detail: error.message
                });
            }

            // Handle Sequelize validation error (e.g., missing required fields)
            if (error.name === 'SequelizeValidationError') {
                const messages = error.errors.map(e => e.message);
                return res.status(400).json({
                    error: 'Validation Error',
                    message: messages.join('; ')
                });
            }

            // Handle Sequelize unique constraint violation (optional)
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'A record with the same unique field already exists.',
                    detail: error.errors.map(e => e.message).join('; ')
                });
            }

            // Fallback for any other unhandled errors
            next(error);
        }
    }

    // PUT /api/service-orders/:order_id
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

    // GET /api/service-orders/:order_id
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

    // DELETE /api/service-orders/:order_id
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
