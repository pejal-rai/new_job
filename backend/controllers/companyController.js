import { connection } from "../app.js";
import { uploadImage } from "../middleware/upload.js";
import multer from "multer";
import { sendEmailNotification } from "../utils/email.js";

// Simulated notification function (in-app notification)
const sendNotification = async (userId, message) => {
    try {
        await connection.execute(
            "INSERT INTO notifications (user_id, message, created_at) VALUES (?, ?, NOW())",
            [userId, message]
        );
        console.log(`In-app notification sent to user ${userId}: ${message}`);
    } catch (error) {
        console.error(`In-app notification error for user ${userId}:`, error);
    }
};

// Multer middleware for logo uploads
export const upload = uploadImage.single("logo");

export const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
    }
    if (err.message === "No file uploaded" || err.message === "Only images (jpeg, jpg, png, avif, webp) are allowed") {
        req.noFile = true;
        return next();
    }
    console.error("Unexpected Multer error:", err);
    return res.status(500).json({ success: false, message: "File upload failed" });
};

export const createCompany = async (req, res) => {
    try {
        const { company_name, address, pan_no } = req.body;
        const userId = req.user?.id;
        const logo = req.file ? `/uploads/${req.file.filename}` : '';

        console.log("Create company request:", { userId, company_name, address, pan_no, logo, noFile: req.noFile });

        if (!userId) {
            console.error("No user ID in request");
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        if (!company_name || !address || !pan_no) {
            console.error("Missing required fields:", { company_name, address, pan_no });
            return res.status(400).json({ success: false, message: "Company name, address, and PAN number are required" });
        }

        const [existing] = await connection.execute("SELECT * FROM companies WHERE user_id = ?", [userId]);
        if (existing.length > 0) {
            console.error("Company already exists for user:", userId);
            return res.status(400).json({ success: false, message: "You already have a company" });
        }

        const [result] = await connection.execute(
            "INSERT INTO companies (user_id, company_name, logo, address, pan_no, status) VALUES (?, ?, ?, ?, ?, 'pending')",
            [userId, company_name, logo, address, pan_no]
        );

        console.log("Company created:", { companyId: result.insertId });

        res.json({
            success: true,
            message: "Company creation request submitted. Awaiting admin approval.",
            companyId: result.insertId,
        });
    } catch (error) {
        console.error("Create company error:", error.message, error.stack);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create company",
        });
    }
};

export const approveCompany = async (req, res) => {
    console.log("Received approveCompany request:", req.body, req.user);
    try {
        const { companyId, status } = req.body;
        if (req.user?.role !== "admin") {
            console.error("Unauthorized access attempt:", req.user);
            return res.status(403).json({ success: false, message: "Only admins can approve companies" });
        }
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status. Use 'approved' or 'rejected'." });
        }

        const [company] = await connection.execute("SELECT * FROM companies WHERE id = ?", [companyId]);
        if (company.length === 0) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const [user] = await connection.execute("SELECT email FROM users WHERE id = ?", [company[0].user_id]);
        if (user.length === 0) {
            console.error(`User not found for user_id: ${company[0].user_id}`);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (status === "approved") {
            await Promise.all([
                connection.execute("UPDATE companies SET status = ? WHERE id = ?", [status, companyId]),
                connection.execute("UPDATE users SET role = 'employer' WHERE id = ?", [company[0].user_id]),
                sendNotification(company[0].user_id, "Your company application has been approved."),
                sendEmailNotification(
                    user[0].email,
                    "Company Application Approved",
                    `Congratulations! Your company application for ${company[0].company_name} has been approved.`
                ),
            ]);
        } else if (status === "rejected") {
            await Promise.all([
                connection.execute("DELETE FROM companies WHERE id = ?", [companyId]),
                sendNotification(company[0].user_id, "Your company application was rejected by the admin."),
                sendEmailNotification(
                    user[0].email,
                    "Company Application Rejected",
                    `We regret to inform you that your company application for ${company[0].company_name} was rejected.`
                ),
            ]);
        }

        const message = status === "approved" ? "Company approved successfully" : "Company rejected and removed";
        res.json({ success: true, message });
    } catch (error) {
        console.error("Approve company error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCompany = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        let query = "SELECT * FROM companies WHERE user_id = ?";
        let params = [userId];

        if (req.user.role === "admin") {
            query = "SELECT * FROM companies";
            params = [];
        }

        const [rows] = await connection.execute(query, params);
        if (rows.length === 0) {
            return res.status(200).json({ success: true, company: null });
        }
        res.json({ success: true, company: req.user.role === "admin" ? rows : rows[0] });
    } catch (error) {
        console.error("Get company error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to get company" });
    }
};

export const editCompany = async (req, res) => {
    try {
        const { company_name, address, pan_no } = req.body;
        const userId = req.user?.id;
        const newLogo = req.file ? `/uploads/${req.file.filename}` : null;

        if (!userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        if (!company_name || !address || !pan_no) {
            return res.status(400).json({ success: false, message: "Company name, address, and PAN number are required" });
        }

        const [rows] = await connection.execute("SELECT * FROM companies WHERE user_id = ?", [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const existingLogo = rows[0].logo;
        const logoToUse = newLogo || existingLogo;

        await connection.execute(
            "UPDATE companies SET company_name = ?, logo = ?, address = ?, pan_no = ? WHERE user_id = ?",
            [company_name, logoToUse, address, pan_no, userId]
        );
        res.json({ success: true, message: "Company updated successfully" });
    } catch (error) {
        console.error("Edit company error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to edit company",
        });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const [rows] = await connection.execute("SELECT * FROM companies WHERE user_id = ?", [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        await connection.execute("DELETE FROM companies WHERE user_id = ?", [userId]);
        res.json({ success: true, message: "Company deleted successfully" });
    } catch (error) {
        console.error("Delete company error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to delete company" });
    }
};

export const getAllCompanies = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            "SELECT id, company_name, logo, address, pan_no FROM companies WHERE status = 'approved'"
        );
        res.json({ success: true, companies: rows });
    } catch (error) {
        console.error("Get all companies error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await connection.execute(
            "SELECT id, company_name, logo, address, pan_no FROM companies WHERE id = ? AND status = 'approved'",
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Company not found or not approved" });
        }
        res.json({ success: true, company: rows[0] });
    } catch (error) {
        console.error("Get company by ID error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};