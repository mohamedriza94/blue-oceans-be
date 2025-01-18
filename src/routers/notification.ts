import { Router } from "express";
import { ReadNotifications } from "../services/notifications/read-notifications";

const notificationRoutes = Router();

notificationRoutes.get("/read-notifications", async (req, res) => {
  const response = await ReadNotifications();
  return res.status(response.statusCode).json(response);
});

export default notificationRoutes;
