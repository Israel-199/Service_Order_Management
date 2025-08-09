'use strict';

const { ServiceOrder, ServiceOrderAssignment, Employee, RecurringOrder, sequelize, Sequelize } = require('../models');
const notificationService = require('./notificationService');
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition } = require('../utils/search');

const { Op } = Sequelize;

class ServiceOrderService {
  async getAllServiceOrders(req, res, next) {
    try {
      const { page, limit, offset, sortBy, sortOrder } = parsePagination(req.query);
      const search = req.query.search || '';

      const validSortFields = ['order_id', 'status', 'priority', 'created_at', 'due_date'];
      if (!validSortFields.includes(sortBy)) {
        return res.status(400).json({
          error: 'Invalid sortBy field',
          validFields: validSortFields,
        });
      }

      const where = {};
      if (req.query.status) where.status = req.query.status;
      if (req.query.priority) where.priority = req.query.priority;
      if (req.query.customer_id) where.customer_id = req.query.customer_id;
      if (req.query.overdue) {
        where.due_date = {
          [Op.lte]: new Date(),
          [Op.ne]: null,
        };
        where.status = { [Op.ne]: 'completed' };
      }
      if (search) {
        const searchFields = ['description', 'status'];
        const searchCondition = buildSearchCondition(search, searchFields);
        where[Op.and] = searchCondition;
      }

      const { count, rows: serviceOrders } = await ServiceOrder.findAndCountAll({
        where,
        include: [
          { model: ServiceType, attributes: ['name'] },
          { model: Customer, attributes: ['name', 'email'] },
          {
            model: ServiceOrderAssignment,
            include: [{ model: Employee, attributes: ['name', 'email'] }],
          },
          { model: Attachment, attributes: ['file_path', 'file_type'] },
        ],
        attributes: ['order_id', 'status', 'priority', 'created_at'],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
      });

      if (!serviceOrders || serviceOrders.length === 0) {
        return res.status(404).json({ error: 'No service orders found' });
      }

      const response = serviceOrders.map(serviceOrder => ({
        orderId: serviceOrder.order_id,
        serviceTypeName: serviceOrder.ServiceType ? serviceOrder.ServiceType.name : null,
        customerName: serviceOrder.Customer ? serviceOrder.Customer.name : null,
        customerEmail: serviceOrder.Customer ? serviceOrder.Customer.email : null,
        serviceOrderStatus: serviceOrder.status,
        serviceOrderPriority: serviceOrder.priority,
        dueDate: serviceOrder.due_date,
        assignedEmployees: serviceOrder.ServiceOrderAssignments.map(assignment => ({
          name: assignment.Employee ? assignment.Employee.name : null,
          email: assignment.Employee ? assignment.Employee.email : null,
        })),
        serviceOrderAttachments: serviceOrder.Attachments.map(attachment => ({
          file_path: attachment.file_path,
          file_type: attachment.file_type,
        })),
      }));

      res.status(200).json({
        data: response,
        pagination: { totalItems: count, totalPages: Math.ceil(count / limit), currentPage: page, itemsPerPage: limit },
      });
    } catch (error) {
      next(error);
    }
  }

  async createServiceOrder(data) {
    return sequelize.transaction(async (t) => {
      const order = await ServiceOrder.create({
        customer_id: data.customer_id,
        service_type_id: data.service_type_id,
        description: data.description,
        priority: data.priority,
        status: 'new',
        due_date: data.due_date,
        created_at: new Date()
      }, { transaction: t });

      // Create notification without recipient ID
      notificationService.createNotification(
        order.order_id,
        'new_order',
        `New service order created: ${order.order_id}`
      );

      return order;
    });
  }

  async updateServiceOrder(id, data) {
    try {
      const order = await ServiceOrder.findByPk(id);
      if (!order) throw new Error('Service Order not found');

      const updates = { ...data, updated_at: new Date() };
      if (data.status === 'completed' && order.status !== 'completed') {
        updates.completed_at = new Date();
      } else if (data.status === 'assigned' && order.status !== 'assigned') {
        updates.assigned_at = new Date();
      } else if (data.status === 'closed' && order.status !== 'closed') {
        updates.closed_at = new Date();
      }

      await order.update(updates);

      if (data.status === 'completed' && order.lead_employees_id) {
        await notificationService.createNotification(
          order.lead_employees_id,
          id,
          'completed',
          `Service order ${id} completed`
        );
      }

      return order;
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.parent && error.parent.code === 'ER_LOCK_WAIT_TIMEOUT') {
        throw new Error('Database lock timeout during service order update. Please try again.');
      }
      throw error;
    }
  }

  async deleteServiceOrder(id) {
    try {
      const order = await ServiceOrder.findByPk(id);
      if (!order) throw new Error('Service Order not found');
      await order.destroy();
      return { message: 'Service Order deleted successfully' };
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.parent && error.parent.code === 'ER_LOCK_WAIT_TIMEOUT') {
        throw new Error('Database lock timeout during service order deletion. Please try again.');
      }
      throw error;
    }
  }

  async getOverdueOrders() {
    try {
      const overdueOrders = await ServiceOrder.findAll({
        where: {
          due_date: {
            [Op.lte]: new Date(),
            [Op.ne]: null,
          },
          status: { [Op.ne]: 'completed' },
        },
        include: [
          { model: Employee, attributes: ['employees_id', 'name', 'email'] },
        ],
      });

      for (const order of overdueOrders) {
        if (order.lead_employees_id) {
          await notificationService.createNotification(
            order.lead_employees_id,
            order.order_id,
            'overdue',
            `Service order ${order.order_id} is overdue. Due date: ${order.due_date}`
          );
        }
      }

      return overdueOrders;
    } catch (error) {
      if (error.name === 'SequelizeDatabaseError' && error.parent && error.parent.code === 'ER_LOCK_WAIT_TIMEOUT') {
        throw new Error('Database lock timeout during overdue orders check. Please try again.');
      }
      throw error;
    }
  }
}

module.exports = new ServiceOrderService();

// async getServiceOrderById(id) {
//   return await ServiceOrder.findByPk(id);
// }

// async getAllServiceOrders(query) {
//   const {
//     limit,
//     offset,
//     sortBy,
//     sortOrder,
//     page
//   } = parsePagination(query);

//   const search = query.search || query.q || null;

//   const whereClause = search
//     ? buildSearchCondition(search, ['description', 'status', 'priority'], Sequelize)
//     : {};

//   const { rows: orders, count: total } = await ServiceOrder.findAndCountAll({
//     where: whereClause,
//     order: [[sortBy, sortOrder]],
//     limit,
//     offset,
//   });

//   return {
//     orders,
//     pagination: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// }
