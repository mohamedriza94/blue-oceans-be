import express from "express";
import buildingRoutes from "./building";
import apartmentRoutes from "./apartment";
import parkingRoutes from "./parking";
import chiefOccupantRoutes from "./chief-occupant";
import dependantRoutes from "./dependant";
import authenticationRoutes from "./authentication";
import resetPasswordRoutes from "./reset-password";

const router = express.Router();

router.use("/building", buildingRoutes);
router.use("/apartment", apartmentRoutes);
router.use("/parking", parkingRoutes);
router.use("/chief-occupant", chiefOccupantRoutes);
router.use("/dependant", dependantRoutes);
router.use("/authentication", authenticationRoutes);
router.use("/password", resetPasswordRoutes);

export default router;
