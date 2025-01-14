import express from "express";
import buildingRoutes from "./building";
import apartmentRoutes from "./apartment";
import parkingRoutes from "./parking";
import chiefOccupantRoutes from "./chief-occupant";
import dependantRoutes from "./dependant";
import authenticationRoutes from "./authentication";
import resetPasswordRoutes from "./reset-password";
import seedRoutes from "./seed";
import applicationRoutes from "./application";
import meRoutes from "./co/me";
import { checkAuthentication } from "../middlewares/check-authentication";
import leaseRoutes from "./lease";

const router = express.Router();

router.use("/building", buildingRoutes);
router.use("/apartment", apartmentRoutes);
router.use("/parking", parkingRoutes);
router.use("/chief-occupant", chiefOccupantRoutes);
router.use("/dependant", dependantRoutes);
router.use("/authentication", authenticationRoutes);
router.use("/password", resetPasswordRoutes);
router.use("/application", checkAuthentication, applicationRoutes);
router.use("/lease", checkAuthentication, leaseRoutes);
router.use("/seed", seedRoutes);

// Chief Occupant Routes
router.use("/me", checkAuthentication, meRoutes);

export default router;
