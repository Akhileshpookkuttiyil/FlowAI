import express from "express";
import { askAI } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/ask-ai", askAI);

export default router;