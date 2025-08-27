import { connection } from "../app.js";

/**
 * Creates a new job application.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const createApplication = async (req, res) => {
  try {
    const { name, email, work_id } = req.body;
    const resume = req.file ? `/uploads/cvs/${req.file.filename}` : null;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please log in" });
    }

    if (!name || !email || !work_id) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const [existing] = await connection.execute(
      "SELECT id FROM applications WHERE work_id = ? AND user_id = ?",
      [work_id, userId]
    );
    if (existing.length > 0) {
      return res.status(403).json({
        success: false,
        message: "You have already applied to this work.",
        applicationId: existing[0].id,
      });
    }

    const [workRows] = await connection.execute(
      "SELECT user_id FROM works WHERE id = ?",
      [work_id]
    );
    if (workRows.length === 0) {
      return res.status(404).json({ success: false, message: "Work not found" });
    }
    const employerId = workRows[0].user_id;

    const [result] = await connection.execute(
      "INSERT INTO applications (name, email, resume, work_id, user_id, status) VALUES (?, ?, ?, ?, ?, 'pending')",
      [name, email, resume, work_id, userId]
    );

    console.log(`Notification: New application submitted for work ${work_id} by ${name}. Employer ID: ${employerId}`);

    res.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: result.insertId,
    });
  } catch (error) {
    console.error("Create application error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves applications for an employer.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getEmployerApplications = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || req.user.role !== "employer") {
      return res.status(403).json({ success: false, message: "Only employers can view applications" });
    }

    const [rows] = await connection.execute(
      `SELECT a.id, a.name, a.email, a.resume, a.status, a.work_id, a.schedule_datetime, a.meet_link, w.title,
       COALESCE(c.company_name, 'Unknown Company') AS company_name 
       FROM applications a 
       JOIN works w ON a.work_id = w.id 
       LEFT JOIN companies c ON w.companies_id = c.id 
       WHERE w.user_id = ?`,
      [userId]
    );

    console.log("Employer applications fetched:", rows);

    res.json({
      success: true,
      applications: rows.map(app => ({
        ...app,
        schedule_datetime: app.schedule_datetime ? new Date(app.schedule_datetime).toISOString() : null,
      })),
    });
  } catch (error) {
    console.error("Get employer applications error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Updates the status and schedule of an application.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, scheduleDatetime, meetLink } = req.body;
    const userId = req.user?.id;

    if (!userId || req.user.role !== "employer") {
      return res.status(403).json({ success: false, message: "Only employers can update application status" });
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if (scheduleDatetime && isNaN(Date.parse(scheduleDatetime))) {
      console.error("Invalid scheduleDatetime received:", scheduleDatetime);
      return res.status(400).json({ success: false, message: "Invalid datetime format" });
    }

    console.log("Received scheduleDatetime:", scheduleDatetime);

    const [applicationRows] = await connection.execute(
      `SELECT a.*, w.user_id, w.title 
       FROM applications a 
       JOIN works w ON a.work_id = w.id 
       WHERE a.id = ? AND w.user_id = ?`,
      [id, userId]
    );
    if (applicationRows.length === 0) {
      return res.status(404).json({ success: false, message: "Application not found or not yours" });
    }

    const formattedDatetime = scheduleDatetime
      ? new Date(scheduleDatetime).toISOString().slice(0, 19).replace("T", " ")
      : null;

    console.log("Formatted scheduleDatetime for DB:", formattedDatetime);

    await connection.execute(
      "UPDATE applications SET status = ?, schedule_datetime = ?, meet_link = ? WHERE id = ?",
      [status, formattedDatetime, meetLink || null, id]
    );

    const [updatedRows] = await connection.execute(
      "SELECT schedule_datetime FROM applications WHERE id = ?",
      [id]
    );
    console.log("Saved schedule_datetime in DB:", updatedRows[0].schedule_datetime);

    res.json({
      success: true,
      message: "Application status updated successfully",
    });
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Edits an existing application.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const editApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const resume = req.file ? `/uploads/cvs/${req.file.filename}` : null;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM applications WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Application not found or not yours" });
    }

    const updates = [];
    const values = [];
    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (resume) {
      updates.push("resume = ?");
      values.push(resume);
    }
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);
    await connection.execute(`UPDATE applications SET ${updates.join(", ")} WHERE id = ?`, values);

    res.json({ success: true, message: "Application updated successfully" });
  } catch (error) {
    console.error("Edit application error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Deletes an application.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [rows] = await connection.execute(
      "SELECT * FROM applications WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Application not found or not yours" });
    }

    await connection.execute("DELETE FROM applications WHERE id = ?", [id]);

    res.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error("Delete application error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Retrieves a user's applications (single by work_id or all).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
export const getUserApplication = async (req, res) => {
  try {
    const { work_id } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (work_id) {
      // Fetch single application by work_id
      const [rows] = await connection.execute(
        `SELECT a.id, a.name, a.email, a.resume, a.status, a.schedule_datetime, a.meet_link, a.work_id, w.title, w.image,
         COALESCE(c.company_name, 'Unknown Company') AS company_name 
         FROM applications a 
         JOIN works w ON a.work_id = w.id 
         LEFT JOIN companies c ON w.companies_id = c.id 
         WHERE a.work_id = ? AND a.user_id = ?`,
        [work_id, userId]
      );
      res.json({
        success: true,
        application: rows.length > 0 ? {
          ...rows[0],
          schedule_datetime: rows[0].schedule_datetime ? new Date(rows[0].schedule_datetime).toISOString() : null,
        } : null,
      });
    } else {
      // Fetch all user applications
      const [rows] = await connection.execute(
        `SELECT a.id, a.name, a.email, a.resume, a.status, a.schedule_datetime, a.meet_link, a.work_id, w.title, w.image,
         COALESCE(c.company_name, 'Unknown Company') AS company_name 
         FROM applications a 
         JOIN works w ON a.work_id = w.id 
         LEFT JOIN companies c ON w.companies_id = c.id 
         WHERE a.user_id = ?`,
        [userId]
      );
      res.json({
        success: true,
        applications: rows.map(app => ({
          ...app,
          schedule_datetime: app.schedule_datetime ? new Date(app.schedule_datetime).toISOString() : null,
        })),
      });
    }
  } catch (error) {
    console.error("Get user application error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};