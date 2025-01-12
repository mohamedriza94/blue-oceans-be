import { Router } from "express";
import { CreateApartment } from "../controllers/dashboard/apartment-controller/create";
import { ReadOneApartment } from "../controllers/dashboard/apartment-controller/read-one";
import {
  IApartmentQueryParams,
  ReadManyApartments,
} from "../controllers/dashboard/apartment-controller/read";
import { UpdateApartment } from "../controllers/dashboard/apartment-controller/update";

const apartmentRoutes = Router();

// --------------------------------

apartmentRoutes.post("/create-apartment", async (req, res) => {
  const response = await CreateApartment(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

apartmentRoutes.get("/read-one-apartment/:apartmentID", async (req, res) => {
  const response = await ReadOneApartment(req.params.apartmentID);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

apartmentRoutes.get("/read-many-apartments", async (req, res) => {
  const queryParams = req.query as unknown as IApartmentQueryParams;
  const response = await ReadManyApartments(queryParams);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

apartmentRoutes.put("/update-apartment/:apartmentID", async (req, res) => {
  const response = await UpdateApartment(req.params.apartmentID, req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default apartmentRoutes;
