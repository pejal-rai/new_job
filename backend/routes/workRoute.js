// workRoute.js
import express from "express";
import { createWork, deleteWork, editWork, getAllWorks, getWorkById, getWorksByCompanyId } from "../controllers/workController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/upload.js";

export const workRoute = express.Router();

// Logging middleware
const logRequest = (req, res, next) => {
    console.log("Request headers:", req.headers);
    console.log("Request method:", req.method);
    console.log("Request URL:", req.url);
    next();
};
workRoute.post("/create", logRequest, authenticateUser, uploadImage.single("image"), createWork);
workRoute.get("/", authenticateUser,getAllWorks);
workRoute.get("/:id", getWorkById);
workRoute.put("/:id", authenticateUser, uploadImage.single("image"), editWork);
workRoute.delete("/:id", authenticateUser, deleteWork);
workRoute.get("/company/:company_id", getWorksByCompanyId);