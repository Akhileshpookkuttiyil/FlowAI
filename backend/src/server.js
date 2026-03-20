import app from "./app.js";
import { config } from "./config/env.js";
import { connectDB } from "./db/connectDB.js";

connectDB();

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});