//import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import { db } from "../models/index";
import notificationService from "./notificationService";
import { buildSearchCondition } from "../utils/search";
import { parsePagination } from "../utils/pagination";
import type {
  //  ParsedPagination,
  QueryParams,
  PaginationResult,
} from "../utils/pagination";

export interface AssignedEmployee {
  id: number;
  name: string | null;
}

export interface ServiceOrderAttachment {
  file_path: string;
  file_type: string;
}

type Priority = "low" | "medium" | "high";
type Frequency = "daily" | "weekly" | "monthly";
type Status = "new" | "assigned" | "in_progress" | "completed" | "closed";
type file_type = "image" | "document" | "audio";

interface CreateServiceOrderInput {
  customer_id: number;
  service_type_id: number;
  description?: string;
  priority: Priority;
  due_date?: Date;
  status?: Status;
  // employee IDs to assign (employees table uses employees_id)
  assignments?: number[];
  attachments?: {
    file_path: string;
    file_type: file_type;
  }[];
  // Optional recurring schedule
  recurring?: {
    frequency: Frequency;
    next_due_date?: Date;
    end_date: Date;
  };
}

export interface ServiceOrderResponse {
  orderId: number;
  serviceTypeName: string | null;
  customerName: string | null;
  customerEmail: string | null;
  serviceOrderStatus: string;
  serviceOrderPriority: string;
  dueDate: Date | null;
  assignedEmployees: AssignedEmployee[];
  serviceOrderAttachments: ServiceOrderAttachment[];
}

class ServiceOrderService {
  async getAllServiceOrders(
    query: QueryParams
  ): Promise<PaginationResult<ServiceOrderResponse>> {
    const { page, limit, offset, sortBy, sortOrder } = parsePagination(query);

    const validSortFields = [
      "order_id",
      "status",
      "priority",
      "created_at",
      "due_date",
    ];
    if (!validSortFields.includes(sortBy)) {
      throw new Error(
        `Invalid sortBy field. Valid fields are: ${validSortFields.join(", ")}`
      );
    }

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.customer_id) where.customer_id = query.customer_id;
    if (query.overdue) {
      where.due_date = {
        [Op.lte]: new Date(),
        [Op.ne]: null,
      };
      where.status = { [Op.ne]: "completed" };
    }

    const search = query.search || query.q || "";
    if (search) {
      const searchFields = ["description", "status"];
      const searchCondition = buildSearchCondition(searchFields, search);
      where[Op.and] = searchCondition;
    }

    const { count, rows } = await db.ServiceOrder.findAndCountAll({
      where,
      include: [
        { model: db.ServiceType, attributes: ["name"] },
        { model: db.Customer, attributes: ["name", "email"] },
        {
          model: db.ServiceOrderAssignment,
          include: [
            {
              model: db.Employee,
              attributes: ["employee_id", "name", "email"],
            },
          ],
        },
        { model: db.Attachment, attributes: ["file_path", "file_type"] },
      ],
      attributes: ["order_id", "status", "priority", "created_at", "due_date"],
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    if (!rows || rows.length === 0) {
      return {
        items: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    const serviceOrders: ServiceOrderResponse[] = rows.map((order) => ({
      orderId: order.order_id,
      serviceTypeName: order.ServiceType?.name ?? null,
      customerName: order.Customer?.name ?? null,
      customerEmail: order.Customer?.email ?? null,
      serviceOrderStatus: order.status ?? "unknown",
      serviceOrderPriority: order.priority ?? "low",
      dueDate: order.due_date ?? null,
      assignedEmployees:
        order.ServiceOrderAssignments?.map((assignment) => {
          const emp = assignment.Employee as {
            employee_id: number;
            name?: string | null;
          };
          return {
            id: emp.employee_id,
            name: emp.name ?? null,
          };
        }) ?? [],
      serviceOrderAttachments:
        order.Attachments?.map((attachment) => ({
          file_path: attachment.file_path,
          file_type: attachment.file_type,
        })) ?? [],
    }));

    return {
      items: serviceOrders,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Create service order: use a transaction to create the order, COMMIT it,
   * then create notifications outside the transaction to avoid lock wait timeouts.
   */

  async createServiceOrder(data: CreateServiceOrderInput) {
    const t = await db.sequelize.transaction();
    console.log("=== Incoming createServiceOrder data ===");
    console.dir(data, { depth: null });

    try {
      console.log("[1] Creating ServiceOrder...");
      const order = await db.ServiceOrder.create(
        {
          customer_id: data.customer_id,
          service_type_id: data.service_type_id,
          description: data.description,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date,
          created_at: new Date(),
        },
        { transaction: t }
      );
      console.log("[1] ServiceOrder created:", order.toJSON());

      // 2) Create recurring order record if requested
      if (data.recurring) {
        console.log("[2] Recurring data present:", data.recurring);

        try {
          const rec = await db.RecurringOrder.create(
            {
              order_id: order.order_id,
              frequency: data.recurring.frequency,
              next_due_date: data.recurring.next_due_date ?? undefined,
              end_date: data.recurring.end_date,
              created_at: new Date(),
            },
            { transaction: t }
          );
          console.log("[2] RecurringOrder created:", rec.toJSON());
        } catch (recErr) {
          console.error("[2] RecurringOrder creation FAILED:", recErr);
          throw recErr;
        }
      } else {
        console.log(
          "[2] No recurring data provided — skipping recurring order creation."
        );
      }

      // 3 & 4) Run duplicate checks in parallel only if needed
      const [existingAssignments, existingAttachments] = await Promise.all([
        data.assignments?.length
          ? db.ServiceOrderAssignment.findAll({
              where: {
                order_id: order.order_id,
                employee_id: data.assignments,
              },
              transaction: t,
            })
          : Promise.resolve([]),
        data.attachments?.length
          ? db.Attachment.findAll({
              where: {
                order_id: order.order_id,
                file_path: data.attachments.map((att) => att.file_path),
              },
              transaction: t,
            })
          : Promise.resolve([]),
      ]);

      // 3) Insert new assignments if any
      if (data.assignments?.length) {
        const existingEmpIds = new Set(
          existingAssignments.map((a) => a.employee_id)
        );
        const newAssignments = data.assignments
          .filter((empId) => !existingEmpIds.has(empId))
          .map((empId) => ({
            order_id: order.order_id,
            employee_id: empId,
            assigned_at: new Date(),
          }));

        console.log("[3] Assignments check:");
        console.table([
          ...existingAssignments.map((a) => ({
            status: "EXISTS",
            employee_id: a.employee_id,
          })),
          ...newAssignments.map((a) => ({
            status: "NEW",
            employee_id: a.employee_id,
          })),
        ]);

        if (newAssignments.length > 0) {
          await db.ServiceOrderAssignment.bulkCreate(newAssignments, {
            transaction: t,
          });
          console.log(`[3] Inserted ${newAssignments.length} new assignments.`);
        } else {
          console.log("[3] No new assignments to insert.");
        }
      }

      // 4) Insert new attachments if any
      if (data.attachments?.length) {
        const existingPaths = new Set(
          existingAttachments.map((a) => a.file_path)
        );
        const newAttachments = data.attachments
          .filter((att) => !existingPaths.has(att.file_path))
          .map((att) => ({
            order_id: order.order_id,
            file_path: att.file_path,
            file_type: att.file_type,
            created_at: new Date(),
          }));

        console.log("[4] Attachments check:");
        console.table([
          ...existingAttachments.map((a) => ({
            status: "EXISTS",
            file_path: a.file_path,
          })),
          ...newAttachments.map((a) => ({
            status: "NEW",
            file_path: a.file_path,
          })),
        ]);

        if (newAttachments.length > 0) {
          await db.Attachment.bulkCreate(newAttachments, { transaction: t });
          console.log(`[4] Inserted ${newAttachments.length} new attachments.`);
        } else {
          console.log("[4] No new attachments to insert.");
        }
      }

      // 5) Commit the transaction
      console.log("[5] Committing transaction...");
      await t.commit();
      console.log("[5] Transaction committed successfully.");

      // 6) Send notification (outside transaction)
      try {
        await notificationService.createNotification(
          order.order_id,
          "new_order",
          `New service order created: ${order.order_id}`
        );
        console.log("[6] Notification sent.");
      } catch (notifErr) {
        console.error("[6] Notification creation failed:", notifErr);
      }

      return order;
    } catch (err: any) {
      await t.rollback();
      console.error("[X] Create service order error:", err.errors || err);
      throw err;
    }
  }

  async updateServiceOrder(id: number, data: Partial<CreateServiceOrderInput>) {
    const t = await db.sequelize.transaction();
    console.log("=== Incoming updateServiceOrder data ===");
    console.dir(data, { depth: null });

    try {
      // 1) Find existing service order
      const order = await db.ServiceOrder.findByPk(id, { transaction: t });
      if (!order) {
        throw new Error("Service Order not found");
      }
      console.log("[1] ServiceOrder found:", order.toJSON());

      // 2) Update main service order fields
      await order.update(
        {
          customer_id: data.customer_id ?? order.customer_id,
          service_type_id: data.service_type_id ?? order.service_type_id,
          description: data.description ?? order.description,
          priority: data.priority ?? order.priority,
          status: data.status ?? order.status,
          due_date: data.due_date ?? order.due_date,
          updated_at: new Date(),
        },
        { transaction: t }
      );
      console.log("[2] ServiceOrder updated");

      // 3) Update or create recurring order
      if (data.recurring) {
        const existingRecurring = await db.RecurringOrder.findOne({
          where: { order_id: id },
          transaction: t,
        });

        if (existingRecurring) {
          console.log("[3] Updating existing RecurringOrder");
          await existingRecurring.update(
            {
              frequency:
                data.recurring.frequency ?? existingRecurring.frequency,
              next_due_date:
                data.recurring.next_due_date ?? existingRecurring.next_due_date,
              end_date: data.recurring.end_date ?? existingRecurring.end_date,
              // Do NOT update created_at on update
            },
            { transaction: t }
          );
        } else {
          console.log("[3] Creating new RecurringOrder");
          await db.RecurringOrder.create(
            {
              order_id: id,
              frequency: data.recurring.frequency,
              next_due_date: data.recurring.next_due_date ?? undefined,
              end_date: data.recurring.end_date,
              created_at: new Date(),
            },
            { transaction: t }
          );
        }
      } else {
        console.log(
          "[3] No recurring data provided, skipping RecurringOrder update"
        );
      }

      // 4) Delete existing assignments & add new if provided
      if (data.assignments) {
        console.log("[4] Updating assignments");
        await db.ServiceOrderAssignment.destroy({
          where: { order_id: id },
          transaction: t,
        });

        if (data.assignments.length > 0) {
          const newAssignments = data.assignments.map((empId) => ({
            order_id: id,
            employee_id: empId,
            assigned_at: new Date(),
          }));

          await db.ServiceOrderAssignment.bulkCreate(newAssignments, {
            transaction: t,
          });
          console.log(`[4] Inserted ${newAssignments.length} new assignments`);
        } else {
          console.log("[4] No assignments to insert");
        }
      } else {
        console.log("[4] Assignments not provided, skipping");
      }

      // 5) Delete existing attachments & add new if provided
      if (data.attachments) {
        console.log("[5] Updating attachments");
        await db.Attachment.destroy({
          where: { order_id: id },
          transaction: t,
        });

        if (data.attachments.length > 0) {
          const newAttachments = data.attachments.map((att) => ({
            order_id: id,
            file_path: att.file_path,
            file_type: att.file_type,
            created_at: new Date(),
          }));

          await db.Attachment.bulkCreate(newAttachments, { transaction: t });
          console.log(`[5] Inserted ${newAttachments.length} new attachments`);
        } else {
          console.log("[5] No attachments to insert");
        }
      } else {
        console.log("[5] Attachments not provided, skipping");
      }

      // 6) Commit transaction
      console.log("[6] Committing transaction");
      await t.commit();

      // 7) Send notification outside transaction if status changed to completed
      if (data.status === "completed") {
        try {
          await notificationService.createNotification(
            id,
            "completed",
            `Service order ${id} completed`
          );
          console.log("[7] Notification sent for completed order");
        } catch (notifErr) {
          console.error("[7] Notification creation failed:", notifErr);
        }
      }

      return order;
    } catch (err: any) {
      await t.rollback();
      console.error("[X] Update service order error:", err.errors || err);
      throw err;
    }
  }

  async deleteServiceOrder(id: number) {
    try {
      const order = await db.ServiceOrder.findByPk(id);
      if (!order) throw new Error("Service Order not found");
      await order.destroy();
      return { message: "Service Order deleted successfully" };
    } catch (error: any) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.parent &&
        error.parent.code === "ER_LOCK_WAIT_TIMEOUT"
      ) {
        throw new Error(
          "Database lock timeout during service order deletion. Please try again."
        );
      }
      throw error;
    }
  }

  async getServiceOrderById(orderId: number) {
    const order = await db.ServiceOrder.findOne({
      where: { order_id: orderId },
      include: [
        { model: db.ServiceType, attributes: ['name'] },
        { model: db.Customer, attributes: ['name', 'email'] },
        {
          model: db.ServiceOrderAssignment,
          include: [{ model: db.Employee, attributes: ['employee_id', 'name', 'email'] }],
        },
        { model: db.Attachment, attributes: ['file_path', 'file_type'] },
      ],
    });

    if (!order) {
      return null;
    }

    return {
      orderId: order.order_id,
      serviceTypeName: order.ServiceType?.name ?? null,
      customerName: order.Customer?.name ?? null,
      customerEmail: order.Customer?.email ?? null,
      serviceOrderStatus: order.status ?? 'unknown',
      serviceOrderPriority: order.priority ?? 'low',
      dueDate: order.due_date ?? null,
      assignedEmployees:
        order.ServiceOrderAssignments?.map((a) => {
          const emp = a.Employee as {
            employee_id: number;
            name?: string | null;
          };
          return {
            id: emp.employee_id,
            name: emp.name ?? null,
          };
        }) ?? [],
      serviceOrderAttachments:
        order.Attachments?.map((att) => ({
          file_path: att.file_path,
          file_type: att.file_type,
        })) ?? [],
    };
  }
  async getOverdueOrders() {
    try {
      // fixed where clause (it had a nested due_date previously)
      const overdueOrders = await db.ServiceOrder.findAll({
        where: {
          due_date: { [Op.lte]: new Date() },
          status: { [Op.ne]: "completed" },
        },
        include: [
          { model: db.Employee, attributes: ["employee_id", "name", "email"] },
        ],
      });

      for (const order of overdueOrders) {
        if (order.employee_id) {
          try {
            await notificationService.createNotification(
              order.order_id,
              "overdue",
              `Service order ${order.order_id} is overdue. Due date: ${order.due_date}`
            );
          } catch (nErr) {
            console.error(
              "Failed to create overdue notification for order",
              order.order_id,
              nErr
            );
          }
        }
      }

      return overdueOrders;
    } catch (error: any) {
      if (
        error.name === "SequelizeDatabaseError" &&
        error.parent &&
        error.parent.code === "ER_LOCK_WAIT_TIMEOUT"
      ) {
        throw new Error(
          "Database lock timeout during overdue orders check. Please try again."
        );
      }
      throw error;
    }
  }
}

export default new ServiceOrderService();

// async createServiceOrder(data: {
//   customer_id: number;
//   service_type_id: number;
//   description?: string;
//   priority: "low" | "medium" | "high";
//   due_date?: Date;
//   assignments?: number[]; // employee_ids
//   attachments?: { file_path: string; file_type: "image" | "document" | "audio" }[];
// }) {
//   const t = await db.sequelize.transaction();
//   try {
//     // Step 1: Create the service order
//     const order = await db.ServiceOrder.create({
//       customer_id: data.customer_id,
//       service_type_id: data.service_type_id,
//       description: data.description,
//       priority: data.priority,
//       status: "new",
//       due_date: data.due_date,
//       created_at: new Date(),
//     }, { transaction: t });

//     // Step 2: Insert multiple assignments (if provided)
//     if (data.assignments?.length) {
//       await Promise.all(
//         data.assignments.map(empId =>
//           db.ServiceOrderAssignment.create({
//             order_id: order.order_id,
//             employee_id: empId,
//             assigned_at: new Date(),
//           }, { transaction: t })
//         )
//       );
//     }

//     // Step 3: Insert multiple attachments (if provided)
//     if (data.attachments?.length) {
//       await Promise.all(
//         data.attachments.map(att =>
//           db.Attachment.create({
//             order_id: order.order_id,
//             file_path: att.file_path,
//             file_type: att.file_type,
//           }, { transaction: t })
//         )
//       );
//     }

//     // Step 4: Commit transaction
//     await t.commit();

//     // Step 5: Send notification *after* transaction to avoid locks
//     try {
//       await notificationService.createNotification(
//         order.order_id,
//         "new_order",
//         `New service order created: ${order.order_id}`
//       );
//     } catch (notifErr) {
//       console.error("Notification creation failed:", notifErr);
//     }

//     return order;
//   } catch (err) {
//     await t.rollback();
//     throw err;
//   }
// }
