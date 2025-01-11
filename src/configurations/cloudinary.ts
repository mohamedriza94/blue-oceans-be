import { v2 as cloudinary } from "cloudinary";
import { envData } from "../constants/env-data";

cloudinary.config({
  cloud_name: envData.cloudinary.cloudName,
  api_key: envData.cloudinary.apiKey,
  api_secret: envData.cloudinary.apiSecret,
});

export default cloudinary;
