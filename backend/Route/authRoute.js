import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import jwt from "jsonwebtoken";
import authenticateToken from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "ไม่พบผู้ใช้งาน" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      username: user.username,
      display_name: user.display_name,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

router.post("/register", async (req, res) => {
  const { username, password, display_name } = req.body;
  const role = username.startsWith("ADMIN_") ? "admin" : "user";

  try {
    const checkQuery = "SELECT * FROM users WHERE username = $1";
    const existing = await pool.query(checkQuery, [username]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = "INSERT INTO users (username, password, display_name, role) VALUES ($1, $2, $3, $4)";
    await pool.query(insertQuery, [username, hashedPassword, display_name, role]);

    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ!" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

router.get("/users", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "⛔ คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" });
  }

  try {
    const result = await pool.query("SELECT username, display_name FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" });
  }
});

export default router;
