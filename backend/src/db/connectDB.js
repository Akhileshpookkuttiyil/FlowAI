import mongoose from "mongoose";
import { config } from "../config/env.js";

export const connectDB = async () => {
  try {
    if (!config.mongoUri) {
      console.warn("MONGO_URI not set. History features disabled.");
      return;
    }

    await mongoose.connect(config.mongoUri);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};
