import express from "express";
import { getAnalysis, getAnalyses, deleteAnalysis, analyseUrl } from "../controllers/analysis.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/analyze", authMiddleware, analyseUrl);
router.get("/list", authMiddleware, getAnalyses);
router.get("/:id", authMiddleware, getAnalysis);
router.delete("/:id", authMiddleware, deleteAnalysis);  

export default router;