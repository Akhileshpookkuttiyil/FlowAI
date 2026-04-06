import express from "express";
import { sendEmail } from "../controllers/email.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateRequest } from "../validators/ai.validator.js";
import { sendEmailSchema } from "../validators/email.validator.js";

const router = express.Router();

router.post("/send-email", requireAuth, validateRequest(sendEmailSchema), sendEmail);

export default router;
