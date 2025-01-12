import { Router } from "express";
import { CreateBuilding } from "../controllers/dashboard/building-controller/create";
import { ReadOneBuilding } from "../controllers/dashboard/building-controller/read-one";
import {
  IBuildingQueryParams,
  ReadManyBuildings,
} from "../controllers/dashboard/building-controller/read";
import { UpdateBuilding } from "../controllers/dashboard/building-controller/update";

const buildingRoutes = Router();

// --------------------------------

buildingRoutes.post("/create-building", async (req, res) => {
  const response = await CreateBuilding(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

buildingRoutes.get("/read-one-building/:buildingID", async (req, res) => {
  const response = await ReadOneBuilding(req.params.buildingID);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

buildingRoutes.get("/read-many-buildings", async (req, res) => {
  const queryParams = req.query as unknown as IBuildingQueryParams;
  const response = await ReadManyBuildings(queryParams);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

buildingRoutes.put("/update-building/:buildingID", async (req, res) => {
  const response = await UpdateBuilding(req.params.buildingID, req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default buildingRoutes;
