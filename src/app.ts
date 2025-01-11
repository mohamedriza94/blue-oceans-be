import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connectDB from "./configurations/database";
import dotenv from "dotenv";
import cors from "./configurations/cors";
import { swaggerSpecs } from "./configurations/swagger-options";
import swaggerUi from "swagger-ui-express";
import router from "./routers/main";
import { envData } from "./constants/env-data";

dotenv.config();
const app = express();
const PORT = envData.port || 5000;

// Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(cors);

// Connect to MongoDB
connectDB();

// Set up Swagger UI
app.use("/swagger-api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use("/api/v1", router);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;