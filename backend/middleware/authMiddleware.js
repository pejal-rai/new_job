import jwt from 'jsonwebtoken'

export const authenticateUser = (req, res, next) => {
    const cookies = req.headers.cookie;
    if (!cookies) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    const token = cookies.split("=")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, "jwttoken");
        req.user = verified;
        next();
    } catch (error) {
        console.error(" Token Verification Failed:", error.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Forbidden: Admin access required",
        });
    }
    next();
};