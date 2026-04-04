import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import aiRoutes from "./routes/ai.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();



app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(ClerkExpressWithAuth());
app.use(express.json());

app.use("/api", aiRoutes);

app.get("/", (req, res) => {
  res.send("FlowAI API is running...");
});

app.use(errorHandler);

export default app;
