import express from "express";
import { askAI } from "../controllers/ai.controller.js";
import { saveResponse } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/ask-ai", askAI);
router.post("/save", saveResponse);

export default router;