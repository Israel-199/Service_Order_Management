const {
  ServiceOrder,
  ServiceOrderAssignment,
  Employee,
  RecurringOrder,
  sequelize, // ← your connected instance
  Sequelize,
} = require("../models");

const { parsePagination } = require("../utils/pagination");
const { buildSearchCondition } = require("../utils/search");

const { Op } = Sequelize;

class ServiceOrderService {
  async getAllServiceOrders(req, res, next) {
    try {
      // Extract query parameters with defaults
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const sortBy = req.query.sortBy || "order_id";
      const order =
        req.query.order && req.query.order.toLowerCase() === "desc"
          ? "DESC"
          : "ASC";

      // Validate query parameters
      const validSortFields = ["order_id", "status", "priority", "created_at"];
      if (!validSortFields.includes(sortBy)) {
        return res
          .status(400)
          .json({
            error: "Invalid sortBy field",
            validFields: validSortFields,
          });
      }

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Fetch service orders with pagination and sorting
      const { count, rows: serviceOrders } = await ServiceOrder.findAndCountAll(
        {
          include: [
            {
              model: ServiceType,
              attributes: ["name"], // For ServiceTypeName
            },
            {
              model: Customer,
              attributes: ["name", "email"], // For customerName, customerEmail
            },
            {
              model: ServiceOrderAssignment,
              include: [
                {
                  model: Employee,
                  attributes: ["name", "email"], // For assignedEmployees
                },
              ],
            },
            {
              model: Attachment,
              attributes: ["file_path", "file_type"], // For serviceOrderOrderAttachments
            },
          ],
          attributes: ["order_id", "status", "priority", "created_at"], // Include created_at for sorting
          limit,
          offset,
          order: [[sortBy, order]],
        }
      );

      // Check if any service orders exist
      if (!serviceOrders || serviceOrders.length === 0) {
        return res.status(404).json({ error: "No service orders found" });
      }

      // Format the response for the frontend
      const response = serviceOrders.map((serviceOrder) => ({
        orderId: serviceOrder.order_id,
        serviceTypeName: serviceOrder.ServiceType
          ? serviceOrder.ServiceType.name
          : null,
        customerName: serviceOrder.Customer ? serviceOrder.Customer.name : null,
        customerEmail: serviceOrder.Customer
          ? serviceOrder.Customer.email
          : null,
        serviceOrderStatus: serviceOrder.status,
        serviceOrderPriority: serviceOrder.priority,
        assignedEmployees: serviceOrder.ServiceOrderAssignments.map(
          (assignment) => ({
            name: assignment.Employee ? assignment.Employee.name : null,
            email: assignment.Employee ? assignment.Employee.email : null,
          })
        ),
        serviceOrderOrderAttachments: serviceOrder.Attachments.map(
          (attachment) => ({
            file_path: attachment.file_path,
            file_type: attachment.file_type,
          })
        ),
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

  async createServiceOrder(data) {
    return await sequelize.transaction(async (t) => {
      // 1) Create the main service order
      const order = await ServiceOrder.create(
        {
          customer_id: data.customer_id,
          service_type_id: data.service_type_id,
          description: data.description,
          priority: data.priority,
          status: data.status || "new",
          lead_employees_id: data.lead_employees_id || null,
          attachment: data.attachment || null,
          // …any other fields…
        },
        { transaction: t }
      );

      // 2) Create an assignment if we have a lead technician
      if (data.lead_employees_id) {
        await ServiceOrderAssignment.create(
          {
            order_id: order.order_id,
            employees_id: data.lead_employees_id,
            role_in_order: "lead",
            assigned_at: new Date(),
          },
          { transaction: t }
        );
      }

      // 3) If this is meant to recur, create a RecurringOrder
      //    we require both frequency and end_date to consider it recurring
      if (data.frequency && data.end_date) {
        await RecurringOrder.create(
          {
            order_id: order.order_id,
            frequency: data.frequency, // e.g. "daily" | "weekly" | "monthly"
            start_date: data.start_date || new Date(), // optional override
            end_date: data.end_date, // e.g. "2025-12-31"
          },
          { transaction: t }
        );
      }

      return order;
    });
  }

  async updateServiceOrder(id, data) {
    const order = await ServiceOrder.findByPk(id);
    if (!order) throw new Error("Service Order not found");
    return await order.update(data);
  }

  async deleteServiceOrder(id) {
    const order = await ServiceOrder.findByPk(id);
    if (!order) throw new Error("Service Order not found");
    await order.destroy();
    return { message: "Service Order deleted successfully" };
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
