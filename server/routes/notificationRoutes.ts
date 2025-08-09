import { Router } from "express";
import notificationController from "../controllers/notification";

const router = Router();

router.get("/", notificationController.getNotifications.bind(notificationController));

router.post("/mark-as-read", notificationController.markAsRead.bind(notificationController));

export default router;
