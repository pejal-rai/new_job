import express from "express";
import { createCompany, getCompany, editCompany, deleteCompany, approveCompany, getAllCompanies, getCompanyById, upload, handleMulterErrors } from "../controllers/companyController.js";
import { authenticateUser, isAdmin } from "../middleware/authMiddleware.js";

export const companyRoute = express.Router();

companyRoute.post("/create", authenticateUser, upload, handleMulterErrors, createCompany);
companyRoute.get("/", authenticateUser, getCompany);
companyRoute.put("/edit", authenticateUser, upload, handleMulterErrors, editCompany);
companyRoute.delete("/delete", authenticateUser, deleteCompany);
companyRoute.post("/approve", authenticateUser, isAdmin, approveCompany);
companyRoute.get("/all", getAllCompanies);
companyRoute.get("/:id", getCompanyById);