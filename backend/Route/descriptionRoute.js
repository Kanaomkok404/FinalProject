import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../cloudinary.js";
import express from "express";
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

  router.post("/:id/description", authenticateToken, upload.array("files", 10), async (req, res) => {
    const { id } = req.params;
    const { description, keepFiles } = req.body;
    const { username, role } = req.user;
  
    try {
      const taskResult = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
      if (taskResult.rows.length === 0) {
        return res.status(404).json({ message: "ไม่พบ task นี้" });
      }
  
      const task = taskResult.rows[0];
      if (role !== "admin" && task.created_by !== username) {
        return res.status(403).json({ message: "⛔ ไม่มีสิทธิ์เพิ่มคำอธิบาย" });
      }
  
      // Parse keepFiles (ชื่อไฟล์ที่ยังเหลืออยู่)
      const keepFileNames = keepFiles ? JSON.parse(keepFiles) : [];
  
      // กรองไฟล์เก่าใน DB ที่ยังไม่ถูกลบ
      const oldFiles = task.description_files || [];
      const filesToKeep = oldFiles.filter(file => keepFileNames.includes(file.name));
      const filesToDelete = oldFiles.filter(file => !keepFileNames.includes(file.name));
  
      // ลบไฟล์ที่ผู้ใช้ลบออกแล้วจาก Cloudinary
      for (const file of filesToDelete) {
        const publicId = file.url.split("/").pop().split(".")[0]; // เดา public_id
        try {
          await cloudinary.uploader.destroy(`documents_uploads/${publicId}`, {
            resource_type: "auto", // หรือ "raw" ถ้ามั่นใจเป็นพวก pdf, zip ฯลฯ
          });
        } catch (deleteErr) {
          console.warn(`ลบไฟล์ไม่สำเร็จ: ${file.url}`, deleteErr.message);
        }
      }
  
      // รวมไฟล์ใหม่กับที่เก็บไว้
      const newFileObjects = req.files.map((file) => ({
        name: file.originalname,
        url: decodeURIComponent(file.path),
      }));
      const finalFileList = [...filesToKeep, ...newFileObjects];
  
      const updated = await pool.query(
        `UPDATE tasks SET description = $1, description_files = $2 WHERE id = $3 RETURNING *`,
        [description, JSON.stringify(finalFileList), id]
      );
  
      res.status(200).json(updated.rows[0]);
    } catch (err) {
      console.error("Error saving description:", err);
      res.status(500).json({ error: "Failed to save description" });
    }
  });
  

export default router;