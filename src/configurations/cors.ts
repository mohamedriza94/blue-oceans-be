import cors from "cors";
import { envData } from "../constants/env-data";

const corsOptions = {
  origin: [envData.frontendBusinessDashboardURI || "http://localhost:3000", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  credentials: true, // Allow credentials (e.g., cookies)
  optionsSuccessStatus: 200, // For older browsers
};

export default cors(corsOptions);
