import mongoose from "mongoose";
import { config } from "../config/env.js";

export const connectDB = async () => {
  try {
    if (!config.mongoUri) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(config.mongoUri);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
