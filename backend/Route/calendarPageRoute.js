import express from "express";
import pool from "../db.js";
import moment from "moment-timezone";
import authenticateToken from "../Middleware/authMiddleware.js"; 

const router = express.Router();

router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { name, start, end } = req.body;
    const created_by = req.user.username;

    const formattedStart = moment(start).format("YYYY-MM-DD");
    const formattedEnd = moment(end).format("YYYY-MM-DD");

    const newTask = await pool.query(
      `INSERT INTO calendar (name, start_date, end_date, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, formattedStart, formattedEnd, created_by]
    );

    res.json(newTask.rows[0]);
  } catch (err) {
    console.error("❌ Database Error:", err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const tasks = await pool.query(
      `SELECT c.id, c.name, c.created_by, u.display_name,
       TO_CHAR(c.start_date, 'YYYY-MM-DD') AS start_date,
       TO_CHAR(c.end_date, 'YYYY-MM-DD') AS end_date
        FROM calendar c
        JOIN users u ON c.created_by = u.username`
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error("❌ Database Error:", err.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/delete/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, role } = req.user;

    const checkTask = await pool.query("SELECT * FROM calendar WHERE id = $1", [id]);
    if (checkTask.rows.length === 0) {
      return res.status(404).json({ message: "Task not found ❌" });
    }

    const task = checkTask.rows[0];

    if (role !== "admin" && task.created_by !== username) {
      return res.status(403).json({ message: "⛔ ไม่มีสิทธิ์ลบ Task นี้" });
    }

    await pool.query("DELETE FROM calendar WHERE id = $1", [id]);
    res.json({ message: "Task deleted successfully ✅" });
  } catch (err) {
    console.error("❌ Database Error:", err.message);
    res.status(500).send("Server Error");
  }
});

export default router;
