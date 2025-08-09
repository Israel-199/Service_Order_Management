// controllers/serviceOrderController.ts
import { Request, Response, NextFunction } from "express";
import serviceOrderService, { ServiceOrderResponse,
} from "../services/serviceOrderService";
import type { PaginationResult, QueryParams } from "../utils/pagination";

class ServiceOrderController {
  async getAllServiceOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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

  async createServiceOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = req.body as {
        customer_id: number;
        service_type_id: number;
        description?: string;
        priority: "low" | "medium" | "high";
        due_date?: Date;
      };

      const order = await serviceOrderService.createServiceOrder(data);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  async updateServiceOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const updatedOrder = await serviceOrderService.updateServiceOrder(id, data);
      res.status(200).json(updatedOrder);
    } catch (error) {
      next(error);
    }
  }

  async deleteServiceOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      const result = await serviceOrderService.deleteServiceOrder(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOverdueOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const overdueOrders = await serviceOrderService.getOverdueOrders();
      res.status(200).json(overdueOrders);
    } catch (error) {
      next(error);
    }
  }
}

export default new ServiceOrderController();
