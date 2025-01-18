import { Router } from "express";
import { ReadNotifications } from "../services/notifications/read-notifications";
import { UpdateNotificationById } from "../services/notifications/update-notification";

const notificationRoutes = Router();

notificationRoutes.get("/read-notifications", async (req, res) => {
  const response = await ReadNotifications();
  return res.status(response.statusCode).json(response);
});

// --------------------------------

notificationRoutes.put("/update/:notificationId", async (req, res) => {
  await UpdateNotificationById(req.params.notificationId);
  return res.status(200);
});

export default notificationRoutes;
