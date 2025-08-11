// routes/serviceOrderRoutes.ts
import { Router } from "express";
import serviceOrderController from "../controllers/serviceOrder";

const router = Router();

// GET /api/service-orders
// GET /api/service-orders?status=new&priority=high&page=1&limit=10
router.get("/", serviceOrderController.getAllServiceOrders);


// GET /api/service-orders/:id
router.get("/:id", serviceOrderController.getServiceOrderById);

// POST /api/service-orders
router.post("/", serviceOrderController.createServiceOrder);

// PUT /api/service-orders/:id
router.put("/:id", serviceOrderController.updateServiceOrder);

// DELETE /api/service-orders/:id
router.delete("/:id", serviceOrderController.deleteServiceOrder);

// GET /api/service-orders/overdue
router.get("/overdue", serviceOrderController.getOverdueOrders);

export default router;
