import express from "express";
import { getCV, createCV, updateCV, deleteCV } from "../controllers/cvController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

// Define and export the router in one go
const cvRoute = express.Router();

// Logging middleware
const logRequest = (req, res, next) => {
    next();
};

// Routes
cvRoute.get("/my-cv", logRequest, authenticateUser, getCV);
cvRoute.post("/create", logRequest, authenticateUser, createCV);
cvRoute.put("/update", logRequest, authenticateUser, updateCV);
cvRoute.delete("/delete", logRequest, authenticateUser, deleteCV);

export default cvRoute; // Single export using default