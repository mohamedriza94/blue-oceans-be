import { Router } from "express";
import { CreateLease } from "../controllers/dashboard/lease-controller/create";
import {
  ILeaseQueryParams,
  ReadManyLeases,
} from "../controllers/dashboard/lease-controller/read-many";
import { ReadRentsOfLease } from "../controllers/dashboard/lease-controller/read-rents-of-lease";
import { PayRent } from "../controllers/dashboard/lease-controller/pay-rent";

const leaseRoutes = Router();

// --------------------------------

leaseRoutes.post("/create", async (req, res) => {
  const response = await CreateLease(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

leaseRoutes.get("/read-many-leases", async (req, res) => {
  const queryParams = req.query as unknown as ILeaseQueryParams;
  const response = await ReadManyLeases(queryParams);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

leaseRoutes.get("/read-rents-of-lease/:leaseId", async (req, res) => {
  const response = await ReadRentsOfLease(req.params.leaseId);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

leaseRoutes.put("/pay-rent", async (req, res) => {
  const response = await PayRent(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default leaseRoutes;
