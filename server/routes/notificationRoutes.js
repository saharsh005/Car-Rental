import express from "express";
import { sendNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.post("/send", sendNotifications);

export default router;
