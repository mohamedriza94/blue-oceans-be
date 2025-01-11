import mongoose from "mongoose";
import { envData } from "../constants/env-data";

const connectDB = async () => {
  try {
    const connectionString =
      "mongodb+srv://administrator:yZkgjzLZz7fLiC9s@savorspreelocaldevelopm.vucvw.mongodb.net/riza-development";

    await mongoose.connect(envData.mongodbURI || connectionString);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
