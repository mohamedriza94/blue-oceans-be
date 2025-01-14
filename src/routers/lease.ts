import { Router } from "express";
import { CreateLease } from "../controllers/dashboard/lease-controller/create";

const leaseRoutes = Router();

// --------------------------------

leaseRoutes.post("/create", async (req, res) => {
  const response = await CreateLease(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default leaseRoutes;
