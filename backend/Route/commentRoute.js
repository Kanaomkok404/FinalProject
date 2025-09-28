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
      folder: "comments_uploads",
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
  const { question_id, content } = req.body;
  const user_name = req.user.username;
  const file_urls = req.files.map((file) => decodeURIComponent(file.path));

  try {
    const result = await pool.query(
      "INSERT INTO comments (question_id, user_name, content, file_urls) VALUES ($1, $2, $3, $4) RETURNING *",
      [question_id, user_name, content, file_urls.length > 0 ? file_urls : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting comment:", err);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

router.get("/:question_id", async (req, res) => {
  const { question_id } = req.params;
  try {
    const result = await pool.query(`
      SELECT c.*, u.display_name 
      FROM comments c
      JOIN users u ON c.user_name = u.username
      WHERE c.question_id = $1
      ORDER BY c.created_at DESC
    `, [question_id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, role } = req.user;

  try {
    const comment = await pool.query("SELECT * FROM comments WHERE id=$1", [id]);
    if (comment.rows.length === 0) return res.status(404).json({ error: "Comment not found" });

    const commentOwner = comment.rows[0].user_name;
    if (role !== "admin" && username !== commentOwner) {
      return res.status(403).json({ error: "⛔ ไม่มีสิทธิ์ลบคอมเมนต์นี้" });
    }

    const commentFiles = comment.rows[0].file_urls || [];
    for (const fileUrl of commentFiles) {
      const publicId = fileUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`comments_uploads/${publicId}`);
    }

    await pool.query("DELETE FROM comments WHERE id=$1", [id]);
    res.status(200).json({ message: "✅ ลบคอมเมนต์และไฟล์เรียบร้อยแล้ว" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
