import { Router } from "express";
import { CreateApplication } from "../controllers/dashboard/application-controller/create";
import { DeleteApplication } from "../controllers/dashboard/application-controller/delete";
import { ReadOneApplication } from "../controllers/dashboard/application-controller/read-one";
import {
  IApplicationQueryParams,
  ReadManyApplications,
} from "../controllers/dashboard/application-controller/read";
import { UpdateApplicationStatus } from "../controllers/dashboard/application-controller/update-application-status";

const applicationRoutes = Router();

// --------------------------------

applicationRoutes.post("/create", async (req, res) => {
  const response = await CreateApplication(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

applicationRoutes.delete("/delete/:applicationID", async (req, res) => {
  const response = await DeleteApplication(req.params.applicationID);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

applicationRoutes.get("/read-one/:applicationID", async (req, res) => {
  const response = await ReadOneApplication(req.params.applicationID);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

applicationRoutes.get("/read-many", async (req, res) => {
  const queryParams = req.query as unknown as IApplicationQueryParams;
  const response = await ReadManyApplications(queryParams);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

applicationRoutes.put("/update/:applicationID", async (req, res) => {
  const response = await UpdateApplicationStatus(
    req.params.applicationID,
    req.body.status
  );
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default applicationRoutes;
