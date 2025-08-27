import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDb } from "./database.js";
import { authRoute } from "./routes/authRoute.js";
import { workRoute } from "./routes/workRoute.js";
import { companyRoute } from "./routes/companyRoute.js";
import { applicationRoute } from "./routes/applicationRoute.js";
import cvRoute from "./routes/cvRoute.js";
import { chatRoute } from "./routes/chatRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import cron from "node-cron";
import { deleteExpiredWorks } from "./controllers/workController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

const port = 5000;
export let connection;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

connection = await connectDb();
console.log("Server starting...");
console.log("Database connection:", connection ? "Connected" : "Failed");

app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage });
app.use("/api/cv", upload.single("photo"), cvRoute);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.get("/", (req, res) => {
  res.json({ name: "job", version: "1.0.0", main: "app.js" });
});
app.use("/api/auth", authRoute);
app.use("/api/works", workRoute);
app.use("/api/companies", companyRoute);
app.use("/api/applications", applicationRoute);
app.use("/api/cv", cvRoute);
app.use("/api/chat", chatRoute);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinChat", ({ workId, userId }) => {
    const room = `chat_${workId}`;
    socket.join(room);
    console.log(`User ${userId} joined room: ${room}`);
  });

  socket.on("sendMessage", async ({ workId, senderId, message }) => {
    try {
      const [result] = await connection.execute(
        "INSERT INTO messages (sender_id, work_id, message) VALUES (?, ?, ?)",
        [senderId, workId, message]
      );
      console.log(`Message saved with ID: ${result.insertId}`);

      const [messages] = await connection.execute(
        "SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?",
        [result.insertId]
      );
      const savedMessage = messages[0];

      const room = `chat_${workId}`;
      io.to(room).emit("receiveMessage", savedMessage);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", { message: "Failed to save message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

cron.schedule("* * * * *", async () => {
  console.log("Cron job triggered at:", new Date().toISOString());
  try {
    await deleteExpiredWorks();
  } catch (error) {
    console.error("Cron job error:", error.stack);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const startServer = async () => {
  try {
    console.log("Testing deleteExpiredWorks...");
    await deleteExpiredWorks();
    server.listen(port, () => {
      console.log(`App running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();