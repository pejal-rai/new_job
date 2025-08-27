import express from "express";
import {
    changePassword,
    getProfile,
    getUserStats,
    login,
    logout,
    register,
    verifyEmail,
    updateProfile,
    updateUserRole,
    getAllUsers,
} from "../controllers/authController.js";
import { authenticateUser, isAdmin } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/upload.js";

export const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.get("/profile", authenticateUser, getProfile);
authRoute.put("/profile", authenticateUser, uploadImage.single("profileImage"), updateProfile);
authRoute.post("/login", login);
authRoute.post("/logout", logout);
authRoute.post("/change-password", authenticateUser, changePassword);
authRoute.get("/stats/users", authenticateUser, isAdmin, getUserStats);
authRoute.post("/verify-email", verifyEmail);
authRoute.put("/update-role", authenticateUser, isAdmin, updateUserRole);
authRoute.get("/users", authenticateUser, isAdmin, getAllUsers);