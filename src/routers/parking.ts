import { Router } from "express";
import { CreateParkingSlot } from "../controllers/dashboard/parking-slot-controller/create";
import { ReadOneParkingSlot } from "../controllers/dashboard/parking-slot-controller/read-one";
import {
  IParkingQueryParams,
  ReadManyParkingSlots,
} from "../controllers/dashboard/parking-slot-controller/read";
import { UpdateParkingSlotStatus } from "../controllers/dashboard/parking-slot-controller/update-parking-slot-status";
import { DeleteParkingSlot } from "../controllers/dashboard/parking-slot-controller/delete";

const parkingRoutes = Router();

// --------------------------------

parkingRoutes.post("/create-parking-slot", async (req, res) => {
  const response = await CreateParkingSlot(req.body);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

parkingRoutes.get("/read-one-parking-slot/:parkingSlotID", async (req, res) => {
  const response = await ReadOneParkingSlot(req.params.parkingSlotID);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

parkingRoutes.get("/read-many-parking-slots", async (req, res) => {
  const queryParams = req.query as unknown as IParkingQueryParams;
  const response = await ReadManyParkingSlots(queryParams);
  return res.status(response.statusCode).json(response);
});

// --------------------------------

parkingRoutes.put(
  "/update-parking-slot-status/:parkingSlotID",
  async (req, res) => {
    const response = await UpdateParkingSlotStatus(
      req.params.parkingSlotID,
      req.body
    );
    return res.status(response.statusCode).json(response);
  }
);

// --------------------------------

parkingRoutes.delete("/delete-parking-slot/:slotID", async (req, res) => {
  const response = await DeleteParkingSlot(req.params.slotID);
  return res.status(response.statusCode).json(response);
});

export default parkingRoutes;
