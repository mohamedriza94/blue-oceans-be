import { Router } from "express";
import { CreateChiefOccupant } from "../controllers/dashboard/chief-occupant-controller/create";
import { ReadOneChiefOccupant } from "../controllers/dashboard/chief-occupant-controller/read-one";
import {
  IChiefOccupantQueryParams,
  ReadManyChiefOccupants,
} from "../controllers/dashboard/chief-occupant-controller/read";
import { UpdateChiefOccupant } from "../controllers/dashboard/chief-occupant-controller/update";

const chiefOccupantRoutes = Router();

// --------------------------------

chiefOccupantRoutes.post("/create", async (req, res) => {
  const response = await CreateChiefOccupant(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

chiefOccupantRoutes.get("/read-one/:occupantID", async (req, res) => {
  const response = await ReadOneChiefOccupant(req.params.occupantID);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

chiefOccupantRoutes.get("/read-many", async (req, res) => {
  const queryParams = req.query as unknown as IChiefOccupantQueryParams;
  const response = await ReadManyChiefOccupants(queryParams);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

chiefOccupantRoutes.put("/update/:occupantID", async (req, res) => {
  const response = await UpdateChiefOccupant(req.params.occupantID, req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default chiefOccupantRoutes;
