// controllers/chatController.js
import { connection } from "../app.js";

export const getChatsForUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (req.user?.role !== "user") {
            return res.status(403).json({ success: false, message: "Only users can access chats" });
        }

        const [chats] = await connection.execute(
            `SELECT DISTINCT 
             m.work_id, 
             w.title AS work_title, 
             u.id AS employer_id, 
             u.name AS employer_name,
             (SELECT message 
              FROM messages m2 
              WHERE m2.work_id = m.work_id 
              ORDER BY m2.created_at DESC 
              LIMIT 1) AS last_message,
             (SELECT created_at 
              FROM messages m3 
              WHERE m3.work_id = m.work_id 
              ORDER BY m3.created_at DESC 
              LIMIT 1) AS last_message_time
           FROM messages m
           JOIN works w ON m.work_id = w.id
           JOIN users u ON w.user_id = u.id
           WHERE m.sender_id = ? OR m.work_id IN (
               SELECT work_id FROM applications WHERE user_id = ?
           )
           ORDER BY last_message_time DESC`,
            [userId, userId]
        );

        res.json({ success: true, chats });
    } catch (error) {
        console.error("Get user chats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getChatHistory = async (req, res) => {
    try {
        const { workId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const [messages] = await connection.execute(
            `SELECT m.*, u.name AS sender_name 
             FROM messages m 
             JOIN users u ON m.sender_id = u.id 
             WHERE m.work_id = ?
             ORDER BY m.created_at ASC`,
            [workId]
        );

        res.json({ success: true, messages });
    } catch (error) {
        console.error("Get chat history error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getChatsForEmployer = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (req.user?.role !== "employer") {
            return res.status(403).json({ success: false, message: "Only employers can access chats" });
        }

        const [chats] = await connection.execute(
            `SELECT 
                m.work_id, 
                w.title AS work_title, 
                u.id AS user_id, 
                u.name AS user_name,
                m.message AS last_message,
                m.created_at AS last_message_time
            FROM messages m
            JOIN works w ON m.work_id = w.id
            JOIN users u ON m.sender_id = u.id
            JOIN (
                SELECT 
                    work_id, 
                    MAX(created_at) AS max_created_at
                FROM messages
                WHERE work_id IN (
                    SELECT id FROM works WHERE user_id = ?
                )
                GROUP BY work_id
            ) latest ON m.work_id = latest.work_id AND m.created_at = latest.max_created_at
            WHERE w.user_id = ?
            ORDER BY m.created_at DESC`,
            [userId, userId]
        );

        res.json({ success: true, chats });
    } catch (error) {
        console.error("Get employer chats error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Fetch the message to check ownership
        const [messages] = await connection.execute(
            `SELECT sender_id, work_id 
             FROM messages 
             WHERE id = ?`,
            [id]
        );

        if (messages.length === 0) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        const message = messages[0];

        // Check if the user is the sender
        if (message.sender_id !== userId) {
            return res.status(403).json({ success: false, message: "You can only delete your own messages" });
        }

        // Delete the message
        await connection.execute(
            `DELETE FROM messages 
             WHERE id = ?`,
            [id]
        );

        // Emit Socket.IO event to notify clients
        req.io.to(`chat_${message.work_id}`).emit("messageDeleted", {
            workId: message.work_id,
            messageId: parseInt(id),
        });

        res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};