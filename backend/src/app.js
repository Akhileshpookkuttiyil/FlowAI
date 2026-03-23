import express from "express";
import cors from "cors";
import aiRoutes from "./routes/ai.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

app.use("/api", aiRoutes);

app.get("/", (req, res) => {
  res.send("FlowAI API is running...");
});

app.use(errorHandler);

export default app;
