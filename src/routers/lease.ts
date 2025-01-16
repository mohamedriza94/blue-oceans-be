import { Router } from "express";
import { CreateLease } from "../controllers/dashboard/lease-controller/create";
import {
  ILeaseQueryParams,
  ReadManyLeases,
} from "../controllers/dashboard/lease-controller/read-many";
import { ReadRentsOfLease } from "../controllers/dashboard/lease-controller/read-rents-of-lease";
import { PayRent } from "../controllers/dashboard/lease-controller/pay-rent";
import {
  IRentQueryParams,
  ReadRentsForOccupant,
} from "../controllers/dashboard/lease-controller/read-rents-for-occupant";
import { GetOccupantLease } from "../controllers/dashboard/lease-controller/get-occupant-lease";
import { DetailedLeaseForOccupant } from "../controllers/dashboard/lease-controller/read-detailed-lease-for-occupant";
import { GetOccupantLeaseList } from "../controllers/dashboard/lease-controller/get-occupant-lease-list";

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

leaseRoutes.get("/read-many-rents", async (req, res) => {
  const queryParams = req.query as unknown as IRentQueryParams;
  const response = await ReadRentsForOccupant(queryParams);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

leaseRoutes.get("/get-occupant-lease/:chiefOccupantId", async (req, res) => {
  const response = await GetOccupantLease(req.params.chiefOccupantId);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

leaseRoutes.get("/read-detailed-occupant-lease/:chiefOccupantId", async (req, res) => {
  const response = await DetailedLeaseForOccupant(req.params.chiefOccupantId);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

leaseRoutes.get("/get-occupant-lease-list/:chiefOccupantId", async (req, res) => {
  const response = await GetOccupantLeaseList(req.params.chiefOccupantId);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default leaseRoutes;
