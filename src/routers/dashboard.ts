import { Router } from "express";
import { GetDashboardData, LoadLeasesForChart } from "../controllers/dashboard/stats-controller/dashboard-controller";

const dashboardRoutes = Router();

// --------------------------------

dashboardRoutes.get("/counts", async (req, res) => {
  const response = await GetDashboardData();
  return res.status(response.statusCode).json(response);
});

// --------------------------------

dashboardRoutes.post("/lease-data-for-chart", async (req, res) => {
  const response = await LoadLeasesForChart(req.body.year);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default dashboardRoutes;
