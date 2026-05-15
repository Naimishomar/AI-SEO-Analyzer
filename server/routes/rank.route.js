import express from "express";
import { addKeyword, getKeywords, getKeyword, refreshKeyword, deleteKeyword, toggleTracking } from "../controllers/rank.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/add", authMiddleware, addKeyword);
router.get("/list", authMiddleware, getKeywords);
router.get("/:id", authMiddleware, getKeyword);
router.post("/:id/refresh", authMiddleware, refreshKeyword);
router.delete("/keyword/:id", authMiddleware, deleteKeyword);
router.put("/:id/toggle", authMiddleware, toggleTracking); 

export default router;