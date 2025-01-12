import { Router } from "express";
import { CreateAdmin } from "../controllers/dashboard/admin-controller/create";

const seedRoutes = Router();

// --------------------------------

seedRoutes.post("/create-admin", async (req, res) => {
  const response = await CreateAdmin();
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default seedRoutes;
