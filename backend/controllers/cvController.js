import { jsPDF } from "jspdf";
import path from "path";
import { fileURLToPath } from "url";
import { connection } from "../app.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../public/uploads/cvs");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple HTML parser for <ul> and <li> tags
const parseHtmlList = (html) => {
    if (!html) return ["No content provided"];
    const listItems = [];
    const liRegex = /<li[^>]*>(.*?)<\/li>/gi;
    let match;
    while ((match = liRegex.exec(html)) !== null) {
        listItems.push(match[1].replace(/<[^>]+>/g, ""));
    }
    return listItems.length > 0 ? listItems : [html.replace(/<[^>]+>/g, "")];
};

// Helper function to generate a polished PDF CV with photo and enhanced design
const generateCVPDF = (cvData, user, photoPath = null) => {
    const doc = new jsPDF();

    // Colors
    const primaryColor = "#1E3A8A"; // Deep Blue
    const sidebarStart = "#F1F5F9"; // Very Light Gray
    const sidebarEnd = "#E2E8F0"; // Light Gray
    const textColor = "#111827"; // Dark Gray
    const accentColor = "#10B981"; // Emerald Green

    // Layout Settings
    const sidebarWidth = 60;
    const contentMargin = sidebarWidth + 10;
    const contentWidth = 130;
    let yPosSidebar = 15;
    let yPosContent = 15;

    // Fonts
    doc.addFont("helvetica", "Helvetica", "normal");
    doc.addFont("helvetica", "Helvetica", "bold");

    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 10, "F"); // Top header bar

    // Sidebar with Gradient
    doc.setFillColor(sidebarStart);
    doc.rect(0, 10, sidebarWidth, 148.5, "F"); // Top half
    doc.setFillColor(sidebarEnd);
    doc.rect(0, 158.5, sidebarWidth, 138.5, "F"); // Bottom half

    // Photo without Circular Frame
    if (photoPath && fs.existsSync(photoPath)) {
        try {
            console.log("Loading photo from:", photoPath);
            const imgData = fs.readFileSync(photoPath);
            const ext = path.extname(photoPath).slice(1).toUpperCase();
            console.log("Image extension:", ext);

            // Add image
            doc.addImage(imgData, ext, 15, yPosSidebar + 5, 34, 34, undefined, "FAST");
            console.log("Image added to PDF at x=15, y=", yPosSidebar + 5);

            yPosSidebar += 50;
        } catch (error) {
            console.error("Error adding photo to PDF:", error.message);
        }
    } else {
        console.log("Photo path invalid or file does not exist:", photoPath);
    }

    // Sidebar: Contact Info
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.setFont("Helvetica", "bold");
    doc.text(cvData.name || "N/A", 10, yPosSidebar, { maxWidth: sidebarWidth - 20 });
    yPosSidebar += 10;

    doc.setFontSize(9);
    doc.setTextColor(textColor);
    doc.setFont("Helvetica", "normal");
    doc.text(`Email: ${cvData.email || "N/A"}`, 10, yPosSidebar, { maxWidth: sidebarWidth - 20 });
    yPosSidebar += 8;
    doc.text(`Phone: ${cvData.phone || "N/A"}`, 10, yPosSidebar, { maxWidth: sidebarWidth - 20 });
    yPosSidebar += 10;

    // Main Content (Right)
    // Professional Profile
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.setFont("Helvetica", "bold");
    doc.text("Professional Profile", contentMargin, yPosContent);
    yPosContent += 6;

    doc.setDrawColor(accentColor);
    doc.setLineWidth(0.8);
    doc.line(contentMargin, yPosContent, contentMargin + 60, yPosContent); // Section divider
    yPosContent += 8;

    doc.setFontSize(10);
    doc.setTextColor(textColor);
    doc.setFont("Helvetica", "normal");
    doc.text("A dedicated professional with a strong background in the field.", contentMargin, yPosContent, { maxWidth: contentWidth });
    yPosContent += 10;

    // Education
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.setFont("Helvetica", "bold");
    doc.text("Education", contentMargin, yPosContent);
    yPosContent += 6;

    doc.setDrawColor(accentColor);
    doc.line(contentMargin, yPosContent, contentMargin + 40, yPosContent);
    yPosContent += 8;

    doc.setFontSize(10);
    doc.setTextColor(textColor);
    doc.setFont("Helvetica", "normal");
    const educationItems = parseHtmlList(cvData.education);
    educationItems.forEach((item, index) => {
        doc.setFillColor(accentColor);
        doc.rect(contentMargin, yPosContent - 2, 2, 2, "F"); // Square bullet
        doc.text(item, contentMargin + 6, yPosContent, { maxWidth: contentWidth });
        yPosContent += 7;
    });
    yPosContent += 8;

    // Experience
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.setFont("Helvetica", "bold");
    doc.text("Experience", contentMargin, yPosContent);
    yPosContent += 6;

    doc.setDrawColor(accentColor);
    doc.line(contentMargin, yPosContent, contentMargin + 40, yPosContent);
    yPosContent += 8;

    doc.setFontSize(10);
    doc.setTextColor(textColor);
    const experienceItems = parseHtmlList(cvData.experience);
    experienceItems.forEach((item, index) => {
        doc.setFillColor(accentColor);
        doc.rect(contentMargin, yPosContent - 2, 2, 2, "F");
        doc.text(item, contentMargin + 6, yPosContent, { maxWidth: contentWidth });
        yPosContent += 7;
    });
    yPosContent += 8;

    // Skills
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.setFont("Helvetica", "bold");
    doc.text("Skills", contentMargin, yPosContent);
    yPosContent += 6;

    doc.setDrawColor(accentColor);
    doc.line(contentMargin, yPosContent, contentMargin + 40, yPosContent);
    yPosContent += 8;

    doc.setFontSize(10);
    doc.setTextColor(textColor);
    const skillsItems = parseHtmlList(cvData.skills);
    skillsItems.forEach((item, index) => {
        doc.setFillColor(accentColor);
        doc.rect(contentMargin, yPosContent - 2, 2, 2, "F");
        doc.text(item, contentMargin + 6, yPosContent, { maxWidth: contentWidth });
        yPosContent += 7;
    });

    // Footer
    doc.setFillColor(primaryColor);
    doc.rect(0, 287, 210, 10, "F");
    doc.setFontSize(8);
    doc.setTextColor("#FFFFFF");
    doc.setFont("Helvetica", "normal");
    doc.text(`CV of ${cvData.name || "N/A"}`, 10, 293);
    doc.text("Page 1 of 1", 195, 293, { align: "right" });

    // Save PDF
    const filePath = path.join(__dirname, "../public/uploads/cvs", `${user.id}_cv.pdf`);
    console.log("Saving PDF to:", filePath);
    try {
        doc.save(filePath);
    } catch (error) {
        console.error("Failed to save PDF:", error);
        throw new Error("Unable to save CV PDF");
    }
    return `/uploads/cvs/${user.id}_cv.pdf`;
};

// Fetch CV
export const getCV = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            "SELECT * FROM cvs WHERE user_id = ?",
            [req.user.id]
        );
        res.json({ success: true, cv: rows.length > 0 ? rows[0] : null });
    } catch (error) {
        console.error("Error fetching CV:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Create CV
export const createCV = async (req, res) => {
    const { name, email, phone, education, experience, skills } = req.body;
    const photo = req.file;
    console.log("Creating CV with data:", req.body, "Photo:", photo ? photo.originalname : "No photo");

    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const [existingCV] = await connection.execute(
            "SELECT id FROM cvs WHERE user_id = ?",
            [req.user.id]
        );
        if (existingCV.length > 0) {
            return res.status(403).json({
                success: false,
                message: "CV already exists. You can only edit or delete it.",
            });
        }

        let photoPath = null;
        let photoExt = null;
        if (photo) {
            photoExt = photo.mimetype.split("/")[1].toLowerCase(); // e.g., "jpeg", "png"
            photoPath = path.join(__dirname, "../public/uploads/cvs", `${req.user.id}_photo.${photoExt}`);
            console.log("Saving photo to:", photoPath);
            fs.writeFileSync(photoPath, photo.buffer);
            console.log("Photo saved successfully");
        }

        const pdfPath = generateCVPDF({ name, email, phone, education, experience, skills }, req.user, photoPath);

        const [result] = await connection.execute(
            "INSERT INTO cvs (user_id, name, email, phone, education, experience, skills, pdf_path, photo_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [req.user.id, name, email, phone || null, education, experience, skills, pdfPath, photoPath ? `/uploads/cvs/${req.user.id}_photo.${photoExt}` : null]
        );

        res.json({ success: true, cvId: result.insertId, pdfPath });
    } catch (error) {
        console.error("Error creating CV:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update CV
export const updateCV = async (req, res) => {
    const { name, email, phone, education, experience, skills } = req.body;
    const photo = req.file;
    console.log("Updating CV with data:", req.body, "Photo:", photo ? photo.originalname : "No photo");

    try {
        // Fetch existing CV to retain current photo_path if no new photo is uploaded
        const [existingCV] = await connection.execute(
            "SELECT photo_path FROM cvs WHERE user_id = ?",
            [req.user.id]
        );
        if (existingCV.length === 0) {
            return res.status(404).json({ success: false, message: "No CV found to update" });
        }

        let photoPath = existingCV[0].photo_path; // Retain existing photo path
        let photoExt = null;

        // Handle new photo upload
        if (photo) {
            photoExt = photo.mimetype.split("/")[1].toLowerCase();
            photoPath = path.join(__dirname, "../public/uploads/cvs", `${req.user.id}_photo.${photoExt}`);
            console.log("Saving new photo to:", photoPath);
            fs.writeFileSync(photoPath, photo.buffer);
            console.log("New photo saved successfully");
            photoPath = `/uploads/cvs/${req.user.id}_photo.${photoExt}`; // Update path for database
        }

        // Generate new PDF with the appropriate photo path
        const absolutePhotoPath = photoPath
            ? path.join(__dirname, "../public", photoPath.replace("/uploads/cvs/", "uploads/cvs/"))
            : null;
        console.log("Absolute photo path for PDF:", absolutePhotoPath);
        const pdfPath = generateCVPDF({ name, email, phone, education, experience, skills }, req.user, absolutePhotoPath);

        // Update CV in database
        await connection.execute(
            "UPDATE cvs SET name = ?, email = ?, phone = ?, education = ?, experience = ?, skills = ?, pdf_path = ?, photo_path = ? WHERE user_id = ?",
            [name, email, phone || null, education, experience, skills, pdfPath, photoPath, req.user.id]
        );

        res.json({ success: true, pdfPath });
    } catch (error) {
        console.error("Error updating CV:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete CV
export const deleteCV = async (req, res) => {
    try {
        const [result] = await connection.execute(
            "DELETE FROM cvs WHERE user_id = ?",
            [req.user.id]
        );
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "No CV found to delete" });
        }
    } catch (error) {
        console.error("Error deleting CV:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};