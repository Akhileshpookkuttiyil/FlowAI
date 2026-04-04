import express from "express";
import { sendEmail } from "../controllers/email.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send-email", requireAuth, sendEmail);

export default router;
