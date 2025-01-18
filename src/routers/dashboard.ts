import { Router } from "express";
import { GetDashboardData } from "../controllers/dashboard/stats-controller/dashboard-controller";

const dashboardRoutes = Router();

// --------------------------------

dashboardRoutes.get("/counts", async (req, res) => {
  const response = await GetDashboardData();
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default dashboardRoutes;
