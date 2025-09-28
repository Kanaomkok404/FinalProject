import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";
import pool from "../db.js";
import authenticateToken from "../Middleware/authMiddleware.js";

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop();
    const isSpecialFile = ["pdf", "zip", "xlsx", "docx", "pptx", "pbix"].includes(ext);
    return {
      folder: "questions_uploads",
      format: undefined,
      public_id: `${Date.now()}_${file.originalname}`,
      resource_type: isSpecialFile ? "raw" : "auto",
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post("/", authenticateToken, upload.array("files", 10), async (req, res) => {
  const { content } = req.body;
  const user_name = req.user.username;
  const file_urls = req.files.map((file) => decodeURIComponent(file.path));

  try {
    const result = await pool.query(
      "INSERT INTO questions (user_name, content, file_urls) VALUES ($1, $2, $3) RETURNING *",
      [user_name, content, file_urls.length > 0 ? file_urls : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create question" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*, u.display_name 
      FROM questions q
      JOIN users u ON q.user_name = u.username
      WHERE q.is_hidden = false
      ORDER BY q.created_at DESC

    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, role } = req.user;

  try {
    const post = await pool.query("SELECT * FROM questions WHERE id=$1", [id]);
    if (post.rows.length === 0) return res.status(404).json({ error: "Question not found" });

    const postOwner = post.rows[0].user_name;
    if (role !== "admin" && username !== postOwner) {
      return res.status(403).json({ error: "⛔ ไม่มีสิทธิ์ลบโพสต์นี้" });
    }

    const postFiles = post.rows[0].file_urls || [];
    for (const fileUrl of postFiles) {
      const publicId = fileUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`questions_uploads/${publicId}`);
    }

    await pool.query("DELETE FROM questions WHERE id=$1", [id]);
    res.status(200).json({ message: "✅ ลบโพสต์และไฟล์เรียบร้อยแล้ว" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete question" });
  }
});

export default router;
