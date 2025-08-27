import express from "express";
import { createApplication, editApplication, deleteApplication, getUserApplication, getEmployerApplications, updateApplicationStatus } from "../controllers/applicationController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { uploadCV } from "../middleware/upload.js";

const router = express.Router();

router.post("/", authenticateUser, uploadCV.single("resume"), createApplication);
router.put("/:id", authenticateUser, uploadCV.single("resume"), editApplication);
router.delete("/:id", authenticateUser, deleteApplication);
router.get("/", authenticateUser, getUserApplication);
router.get("/employer", authenticateUser, getEmployerApplications);
router.patch("/status/:id", authenticateUser, updateApplicationStatus);

export { router as applicationRoute };