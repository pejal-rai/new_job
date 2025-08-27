import { connection } from "../app.js";
import { sendEmailNotification } from "../utils/email.js";

export const createWork = async (req, res) => {
    try {
        const { title, position, salary, requirement, description, apply_date, end_date } = req.body;
        const userId = req.user?.id;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        console.log("Create work request:", {
            userId,
            title,
            position,
            salary,
            requirement,
            description,
            apply_date,
            end_date,
            image,
            file: req.file
        });

        if (!userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const [company] = await connection.execute(
            "SELECT id FROM companies WHERE user_id = ? AND status = 'approved'",
            [userId]
        );
        if (company.length === 0) {
            return res.status(403).json({ success: false, message: "Only approved employers can create jobs" });
        }

        if (!title || !position || !salary || !apply_date || !end_date) {
            return res.status(400).json({ success: false, message: "Required fields are missing" });
        }

        const companiesId = company[0].id;

        const [result] = await connection.execute(
            "INSERT INTO works (user_id, companies_id, title, position, salary, requirement, description, apply_date, end_date, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [userId, companiesId, title, position, salary, requirement || null, description || null, apply_date, end_date, image]
        );

        res.json({ success: true, message: "Job created successfully", workId: result.insertId });
    } catch (error) {
        console.error("Create work error:", error.stack);
        res.status(500).json({ success: false, message: error.message || "Failed to create job" });
    }
};

export const getAllWorks = async (req, res) => {
    try {
        const [rows] = await connection.execute(
            `SELECT w.*, u.name AS employer_name, c.company_name
             FROM works w 
             JOIN users u ON w.user_id = u.id
             LEFT JOIN companies c ON w.user_id = c.user_id`
        );
        res.json({ success: true, works: rows });
    } catch (error) {
        console.error("Get all works error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWorkById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await connection.execute(
            `SELECT w.*, u.name AS employer_name, c.id AS company_id, c.company_name
             FROM works w 
             JOIN users u ON w.user_id = u.id
             LEFT JOIN companies c ON w.user_id = c.user_id
             WHERE w.id = ?`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        res.json({ success: true, work: rows[0] });
    } catch (error) {
        console.error("Get work by ID error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getWorksByCompanyId = async (req, res) => {
    try {
        const { company_id } = req.params;

        const [company] = await connection.execute(
            `SELECT user_id FROM companies WHERE id = ?`,
            [company_id]
        );

        if (company.length === 0) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        const companyUserId = company[0].user_id;

        const [rows] = await connection.execute(
            `SELECT w.*, u.name AS employer_name, c.company_name
             FROM works w 
             JOIN users u ON w.user_id = u.id
             LEFT JOIN companies c ON w.user_id = c.user_id
             WHERE w.user_id = ?`,
            [companyUserId]
        );

        if (rows.length === 0) {
            return res.status(200).json({ success: true, works: [], message: "No jobs found for this company" });
        }

        res.json({ success: true, works: rows });
    } catch (error) {
        console.error("Get works by company ID error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const editWork = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, position, salary, requirement, description, apply_date, end_date } = req.body;
        const authenticatedUserId = req.user?.id;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        if (!authenticatedUserId || req.user.role !== "employer") {
            return res.status(403).json({ success: false, message: "Only employers can edit job postings" });
        }

        const [job] = await connection.execute("SELECT user_id, image FROM works WHERE id = ?", [id]);
        if (job.length === 0 || job[0].user_id !== authenticatedUserId) {
            return res.status(403).json({ success: false, message: "You can only edit your own jobs" });
        }

        const missingFields = [];
        if (!title) missingFields.push("title");
        if (!position) missingFields.push("position");
        if (!salary) missingFields.push("salary");
        if (!requirement) missingFields.push("requirement");
        if (!description) missingFields.push("description");
        if (!apply_date) missingFields.push("apply_date");
        if (!end_date) missingFields.push("end_date");

        if (missingFields.length > 0) {
            return res.status(400).json({ success: false, message: `Missing required fields: ${missingFields.join(", ")}` });
        }

        const updatedImage = image || job[0].image;

        await connection.execute(
            "UPDATE works SET title = ?, position = ?, salary = ?, requirement = ?, description = ?, apply_date = ?, end_date = ?, image = ? WHERE id = ?",
            [title, position, salary, requirement, description, apply_date, end_date, updatedImage, id]
        );

        res.json({ success: true, message: "Job updated successfully" });
    } catch (error) {
        console.error("Edit work error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteWork = async (req, res) => {
    try {
        const { id } = req.params;
        const authenticatedUserId = req.user?.id;

        if (!authenticatedUserId || req.user.role !== "employer") {
            return res.status(403).json({ success: false, message: "Only employers can delete job postings" });
        }

        const [job] = await connection.execute("SELECT user_id FROM works WHERE id = ?", [id]);
        if (job.length === 0 || job[0].user_id !== authenticatedUserId) {
            return res.status(403).json({ success: false, message: "You can only delete your own jobs" });
        }

        await connection.execute("DELETE FROM works WHERE id = ?", [id]);
        res.json({ success: true, message: "Job deleted successfully" });
    } catch (error) {
        console.error("Delete work error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteExpiredWorks = async () => {
    try {
        // Step 1: Find jobs expiring tomorrow for email notifications
        const [expiringWorks] = await connection.execute(
            `SELECT w.id, w.title, w.end_date, u.email, u.name
             FROM works w
             JOIN users u ON w.user_id = u.id
             WHERE DATE(w.end_date) = DATE(DATE_ADD(NOW(), INTERVAL 1 DAY))`
        );

        // Send email notifications for expiring jobs
        for (const work of expiringWorks) {
            const deletionDate = new Date(work.end_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const subject = `JobX: Your Job "${work.title}" Expires Tomorrow`;
            const message = `Dear ${work.name},\n\nYour job posting "${work.title}" is set to expire on ${deletionDate}. It will be automatically deleted after this date. If you wish to extend the posting, please update the end date in the JobX portal.\n\nBest regards,\nJobX Team`;

            const emailResult = await sendEmailNotification(work.email, subject, message);

            console.log(`Email notification for job ${work.id} (${work.title}) sent to ${work.email}: ${emailResult.success ? 'Success' : `Failed - ${emailResult.error}`}`);
        }

        // Step 2: Delete jobs that have already expired
        const [expiredWorks] = await connection.execute(
            "SELECT id, title, end_date FROM works WHERE end_date < NOW()"
        );

        if (expiredWorks.length === 0) {
            console.log("No expired jobs found for deletion.");
        } else {
            const expiredIds = expiredWorks.map(work => work.id);
            const placeholders = expiredIds.map(() => '?').join(',');
            await connection.execute(
                `DELETE FROM applications WHERE work_id IN (${placeholders})`,
                expiredIds
            );
            await connection.execute(
                `DELETE FROM messages WHERE work_id IN (${placeholders})`,
                expiredIds
            );
            
            await connection.execute(
                `DELETE FROM works WHERE id IN (${placeholders})`,
                expiredIds
            );

            console.log(`Deleted ${expiredWorks.length} expired jobs:`, expiredWorks.map(work => ({
                id: work.id,
                title: work.title,
                end_date: work.end_date
            })));
        }
    } catch (error) {
        console.error("Error in deleteExpiredWorks:", error.stack);
    }
};