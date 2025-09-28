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
        folder: "documents_uploads",
        format: undefined, 
        public_id: `${Date.now()}_${file.originalname}`, 
        resource_type: isSpecialFile ? "raw" : "auto", 
      };
    },
  });

  const upload = multer({ 
    storage, 
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB
  });

  router.post("/upload", authenticateToken, upload.single("file"), async (req, res) => {
    try {
      const { description } = req.body;
      const fileName = req.file.originalname;
      const filePath = decodeURIComponent(req.file.path); 
      const fileSize = req.file.size;
      const created_by = req.user.username;

      const result = await pool.query(
        `INSERT INTO documents (name, description, file_path, size, created_by)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [fileName, description, filePath, fileSize, created_by]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error uploading file:", err);
      res.status(500).send("Server error");
    }
  });

  router.get("/", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM documents ORDER BY uploaded_at DESC");
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching documents:", err);
      res.status(500).send("Server error");
    }
  });

  router.get("/download/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM documents WHERE id = $1", [id]);

      if (result.rows.length === 0) {
        return res.status(404).send("File not found");
      }

      const filePath = result.rows[0].file_path;
      const downloadUrl = filePath.replace("/upload/", "/upload/fl_attachment:");
      res.redirect(downloadUrl);
    } catch (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Server error");
    }
  });

  router.delete("/delete/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { username, role } = req.user;

    try {
      const fileQuery = await pool.query("SELECT * FROM documents WHERE id = $1", [id]);

      if (fileQuery.rows.length === 0) {
        return res.status(404).json({ error: "File not found" });
      }

      const file = fileQuery.rows[0];
      if (role !== "admin" && file.created_by !== username) {
        return res.status(403).json({ error: "ไม่มีสิทธิ์ลบไฟล์นี้" });
      }

      const fileUrl = file.file_path;
      const publicId = fileUrl.split("/").pop().split(".")[0];

      try {
        await cloudinary.uploader.destroy(`documents_uploads/${publicId}`);
        console.log("File deleted from Cloudinary:", publicId);
      } catch (err) {
        console.error("Error deleting file from Cloudinary:", err);
      }

      await pool.query("DELETE FROM documents WHERE id = $1", [id]);
      res.json({ message: "File deleted successfully" });
    } catch (err) {
      console.error("Error deleting file:", err);
      res.status(500).send("Server error");
    }
  });

  export default router;
