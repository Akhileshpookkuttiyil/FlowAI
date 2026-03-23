import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

export const config = {
  port: process.env.PORT || 5000,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  mongoUri: process.env.MONGO_URI,
};
