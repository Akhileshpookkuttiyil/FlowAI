import express from "express";
import cors from "cors";
import aiRoutes from "./routes/ai.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// FIX: Specify allowed origins explicitly instead of allowing all (*).
// This allows the Vite dev server and any deployed frontend to call the API.
app.use(cors({
  origin: [
    "http://localhost:5173",  // Vite dev server
    "http://localhost:4173",  // Vite preview
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

app.use("/api", aiRoutes);

app.get("/", (req, res) => {
  res.send("FlowAI API is running...");
});

// Global Error Handler
app.use(errorHandler);

export default app;
