import { Router } from "express";
import { CreateDependent } from "../controllers/dashboard/dependant-controller/create";
import { DeleteDependent } from "../controllers/dashboard/dependant-controller/delete";
import { ReadOneDependent } from "../controllers/dashboard/dependant-controller/read-one";
import { ReadManyDependents } from "../controllers/dashboard/dependant-controller/read";
import { UpdateDependent } from "../controllers/dashboard/dependant-controller/update";

const dependantRoutes = Router();

// --------------------------------

dependantRoutes.post("/create", async (req, res) => {
  const response = await CreateDependent(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

dependantRoutes.delete("/delete/:dependentID", async (req, res) => {
  const response = await DeleteDependent(req.params.dependentID);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

dependantRoutes.get("/read-one/:dependentID", async (req, res) => {
  const response = await ReadOneDependent(req.params.dependentID);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

dependantRoutes.get("/read-many/:chiefOccupantId", async (req, res) => {
  const response = await ReadManyDependents(req.params.chiefOccupantId);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

dependantRoutes.put("/update/:dependentID", async (req, res) => {
  const response = await UpdateDependent(req.params.dependentID, req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default dependantRoutes;
