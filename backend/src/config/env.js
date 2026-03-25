import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../../.env") });

const parseOrigins = (value) =>
  (value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const localOrigins = ["http://localhost:5173", "http://localhost:4173"];
const configuredOrigins = parseOrigins(process.env.FRONTEND_URL);

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  mongoUri: process.env.MONGO_URI,
  corsOrigins: [...new Set([...localOrigins, ...configuredOrigins])],
  openRouterSiteUrl: process.env.OPENROUTER_SITE_URL || configuredOrigins[0] || "",
  openRouterAppName: process.env.OPENROUTER_APP_NAME || "FlowAI Builder",
};
