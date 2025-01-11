import dotenv from "dotenv";

dotenv.config();

export const envData = {
  mongodbURI: process.env.MONGODB_URI,
  port: process.env.PORT,
  nodeENV: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  brevoAPIKey: process.env.BREVO_API_KEY,
  frontendBusinessDashboardURI: process.env.FRONTEND_BUSINESS_DASHBOARD_URI,
  mainBackendURI: process.env.MAIN_BACKEND_URI,
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
  },
  cloudinary: {
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  },
};
