// routes/serviceOrderRoutes.ts
import { Router } from "express";
import ServiceOrderController from "../controllers/serviceOrder";
import { upload } from "../middleware/upload";

const router = Router();

// GET /api/service-orders
// GET /api/service-orders?status=new&priority=high&page=1&limit=10
router.get("/", ServiceOrderController.getAllServiceOrders);


// // GET /api/service-orders/:id
router.get("/:id", ServiceOrderController.getServiceOrderById);

// // POST /api/service-orders
router.post(
  "/",
  upload.array("attachments"), // Multer middleware
  ServiceOrderController.createServiceOrder
);
router.put(
  ":id",
  upload.array("attachments"),
  ServiceOrderController.updateServiceOrder
);

// // DELETE /api/service-orders/:id
router.delete("/:id", ServiceOrderController.deleteServiceOrder);

// GET /api/service-orders/overdue
router.get("/overdue", ServiceOrderController.getOverdueOrders);




// Attachment endpoints
router.get("/:id/attachments", ServiceOrderController.listAttachments);
router.get("/attachments/:id/download", ServiceOrderController.downloadAttachment);

export default router;




