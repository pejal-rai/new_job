import express from "express";
import { getChatHistory, getChatsForEmployer, deleteMessage, getChatsForUser } from "../controllers/chatController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/history/:workId", authenticateUser, getChatHistory);
router.get("/employer", authenticateUser, getChatsForEmployer);
router.get("/user", authenticateUser, getChatsForUser);
router.delete("/message/:id", authenticateUser, deleteMessage);

export { router as chatRoute };