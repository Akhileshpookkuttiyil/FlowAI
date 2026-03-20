import express from "express";
import cors from "cors";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", aiRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;