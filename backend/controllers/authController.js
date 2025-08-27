import jwt from "jsonwebtoken";
import hash from "password-hash";
import { connection } from "../app.js";
import { sendEmailNotification } from "../utils/email.js";

// Generate a random 6-digit code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role = "user" } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (name, email, password).",
            });
        }

        const hashedPassword = hash.generate(password);
        const verificationCode = generateVerificationCode();

        const [rows] = await connection.execute(
            "SELECT * FROM `users` WHERE `email` = ?",
            [email]
        );
        if (rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        await connection.execute(
            "INSERT INTO `users` (`name`, `email`, `password`, `role`, `verification_code`, `is_verified`, `profile_image`) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [name, email, hashedPassword, role, verificationCode, false, null]
        );

        // Send verification email
        await sendEmailNotification(
            email,
            "Email Verification Code",
            `Your verification code is: ${verificationCode}`
        );

        res.json({
            success: true,
            message: "Registration successful. Please check your email for the verification code.",
        });
    } catch (error) {
        console.log("Registration error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required.",
            });
        }

        const [rows] = await connection.execute(
            "SELECT * FROM `users` WHERE `email` = ? AND `verification_code` = ?",
            [email, code]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or verification code.",
            });
        }

        await connection.execute(
            "UPDATE `users` SET `is_verified` = ?, `verification_code` = NULL WHERE `email` = ?",
            [true, email]
        );

        res.json({
            success: true,
            message: "Email verified successfully. You can now log in.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (email, password).",
            });
        }

        const [rows] = await connection.execute(
            "SELECT * FROM `users` WHERE `email` = ?",
            [email]
        );
        if (
            rows.length === 0 ||
            !hash.verify(password, rows[0].password) ||
            !rows[0].is_verified
        ) {
            return res.status(400).json({
                success: false,
                message: rows[0]?.is_verified
                    ? "Incorrect email or password"
                    : "Please verify your email before logging in.",
            });
        }

        const user = rows[0];
        const token = jwt.sign({ id: user.id, role: user.role }, "jwttoken", {
            expiresIn: "1h",
        });

        res.cookie("token", token, {
            httpOnly: false,
            sameSite: "None",
            secure: true,
            maxAge: 3600000,
        });

        res.json({
            success: true,
            message: "User logged in successfully",
        });
    } catch (error) {
        console.log("Login error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message,
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user?.id;
        const profileImage = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required",
            });
        }

        // Check if new email is already taken by another user
        const [emailCheck] = await connection.execute(
            "SELECT * FROM users WHERE email = ? AND id != ?",
            [email, userId]
        );

        if (emailCheck.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already in use",
            });
        }

        // Update profile with or without image
        await connection.execute(
            "UPDATE users SET name = ?, email = ?, profile_image = COALESCE(?, profile_image) WHERE id = ?",
            [name, email, profileImage, userId]
        );

        // Fetch updated user data
        const [updatedUser] = await connection.execute(
            "SELECT id, name, email, phone, role, profile_image FROM users WHERE id = ?",
            [userId]
        );

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser[0],
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const [rows] = await connection.execute(
            "SELECT id, name, email, phone, role, profile_image FROM users WHERE id = ?",
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized user" });
        }

        const [user] = await connection.execute(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isPasswordValid = hash.verify(currentPassword, user[0].password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        const hashedPassword = hash.generate(newPassword);

        await connection.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, userId]
        );

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// authController.js
export const getAllUsers = async (req, res) => {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admins can access user data",
            });
        }

        const [rows] = await connection.execute(
            "SELECT id, name, email, role FROM users WHERE role IN ('user', 'employer')"
        );

        res.json({
            success: true,
            users: rows,
        });
    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getUserStats = async (req, res) => {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admins can access stats",
            });
        }
        const [rows] = await connection.execute("SELECT COUNT(*) as total FROM users");
        res.json({ success: true, total: rows[0].total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { userId, newRole } = req.body;
        if (req.user?.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admins can update user roles",
            });
        }
        if (!["user", "employer"].includes(newRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Use 'user' or 'employer'.",
            });
        }

        // Check if user exists
        const [user] = await connection.execute("SELECT * FROM users WHERE id = ?", [userId]);
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // If changing employer to user, check for associated company
        if (user[0].role === "employer" && newRole === "user") {
            const [company] = await connection.execute(
                "SELECT * FROM companies WHERE user_id = ?",
                [userId]
            );
            if (company.length > 0) {
                // Delete or mark company as inactive
                await connection.execute("DELETE FROM companies WHERE user_id = ?", [userId]);
                // Optionally notify user
                await sendEmailNotification(
                    user[0].email,
                    "Company Removed",
                    `Your company has been removed as your role has been changed to 'user'.`
                );
            }
        }

        // Update user role
        await connection.execute("UPDATE users SET role = ? WHERE id = ?", [newRole, userId]);

        res.json({
            success: true,
            message: `User role updated to ${newRole} successfully`,
        });
    } catch (error) {
        console.error("Update user role error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};