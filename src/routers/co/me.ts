import { Router } from "express";
import { ReadOneChiefOccupant } from "../../controllers/dashboard/chief-occupant-controller/read-one";

const meRoutes = Router();

// --------------------------------

meRoutes.get("/", async (req, res) => {
  const occupantID = req.body.currentUser._id;

  const response = await ReadOneChiefOccupant(occupantID);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

export default meRoutes;
