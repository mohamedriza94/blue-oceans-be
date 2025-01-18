import { Router } from "express";
import { CreateExtensionRequest } from "../controllers/dashboard/extension-request/create-extension-request";
import {
  IExtensionRequestQueryParams,
  ReadManyExtensionRequests,
} from "../controllers/dashboard/extension-request/read-many";
import { ReadOneExtensionRequest } from "../controllers/dashboard/extension-request/read-one";
import { UpdateExtensionRequest } from "../controllers/dashboard/extension-request/update-extension-request";

const extensionRequestRoutes = Router();

// --------------------------------

extensionRequestRoutes.post("/create", async (req, res) => {
  const response = await CreateExtensionRequest(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

extensionRequestRoutes.get("/read-many", async (req, res) => {
  const queryParams = req.query as unknown as IExtensionRequestQueryParams;
  const response = await ReadManyExtensionRequests(queryParams);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

extensionRequestRoutes.get(
  "/read-one/:extensionRequestId",
  async (req, res) => {
    const response = await ReadOneExtensionRequest(
      req.params.extensionRequestId
    );
    return res.status(response.statusCode).json(response);
  }
);

// --------------------------------

extensionRequestRoutes.put("/update/:extensionRequestId", async (req, res) => {
  const response = await UpdateExtensionRequest(
    req.params.extensionRequestId,
    req.body
  );
  return res.status(response.statusCode).json(response);
});

export default extensionRequestRoutes;
