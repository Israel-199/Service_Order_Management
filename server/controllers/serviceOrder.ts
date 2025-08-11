// controllers/serviceOrderController.ts
import { Request, Response, NextFunction } from "express";
import serviceOrderService, {
  ServiceOrderResponse,
} from "../services/serviceOrderService";
import type { PaginationResult, QueryParams } from "../utils/pagination";

// Define a DTO interface for the request body
interface CreateServiceOrderDTO {
  customer_id: number;
  service_type_id: number;
  description?: string;
  priority: "low" | "medium" | "high";
  due_date?: string; // from client (ISO)
  status?: "new" | "assigned" | "in_progress" | "completed" | "closed";
  assignments?: number[]; // employees ids
  attachments?: {
    file_path: string;
    file_type: "image" | "document" | "audio";
  }[];
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    next_due_date?: string;
    end_date: string;
  };
}

class ServiceOrderController {
  async getServiceOrderById(req: Request, res: Response) {
    const orderId = Number(req.params.id);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    try {
      const order = await serviceOrderService.getServiceOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Service order not found' });
      }
      return res.status(200).json(order);
    } catch (error) {
      console.error('Error fetching service order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAllServiceOrders(req: Request, res: Response, next: NextFunction) {
    try {
      // Cast query to QueryParams (safe if input sanitized)
      const query = req.query as unknown as QueryParams;

      const result: PaginationResult<ServiceOrderResponse> =
        await serviceOrderService.getAllServiceOrders(query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createServiceOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as CreateServiceOrderDTO;

      // Basic runtime validation
      if (!body.customer_id || !body.service_type_id || !body.priority) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Map / parse dates (if provided)
      const orderData = {
        customer_id: body.customer_id,
        service_type_id: body.service_type_id,
        description: body.description,
        priority: body.priority,
        due_date: body.due_date ? new Date(body.due_date) : undefined,
        status: body.status || "new",
        assignments: body.assignments,
        attachments: body.attachments,
        recurring: body.recurring
          ? {
              frequency: body.recurring.frequency,
              next_due_date: body.recurring.next_due_date
                ? new Date(body.recurring.next_due_date)
                : undefined,
              end_date: new Date(body.recurring.end_date),
            }
          : undefined,
      };

      const order = await serviceOrderService.createServiceOrder(orderData);
      res
        .status(201)
        .json({ message: "Service order created", order_id: order.order_id });
    } catch (error) {
      next(error);
    }
  }

  async updateServiceOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const updatedOrder = await serviceOrderService.updateServiceOrder(
        id,
        data
      );
      res.status(200).json(updatedOrder);
    } catch (error) {
      next(error);
    }
  }

  async deleteServiceOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await serviceOrderService.deleteServiceOrder(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOverdueOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const overdueOrders = await serviceOrderService.getOverdueOrders();
      res.status(200).json(overdueOrders);
    } catch (error) {
      next(error);
    }
  }
}

export default new ServiceOrderController();
