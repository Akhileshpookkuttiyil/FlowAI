import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  mongoUri: process.env.MONGO_URI,
};