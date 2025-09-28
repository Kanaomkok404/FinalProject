import express from "express";
import moment from "moment";
import pool from "../db.js";
import authenticateToken from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  const requestedUsername = req.query.username;
  const { username, role } = req.user;

  try {
    let result;
    if (role !== "admin") {
      result = await pool.query(
        "SELECT * FROM tasks WHERE created_by = $1 ORDER BY created_at DESC",
        [username]
      );
    } else if (requestedUsername) {
      result = await pool.query(
        "SELECT * FROM tasks WHERE created_by = $1 ORDER BY created_at DESC",
        [requestedUsername]
      );
    } else {
      result = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/", authenticateToken, async (req, res) => {
  const { title, description, due_date, status, priority, assigned_to, department, category, start_date, actual_date } = req.body;
  const created_by = req.user.username;
  const cleanDate = (date) => (date === "" ? null : date);

  try {
    const result = await pool.query(
      `INSERT INTO tasks 
       (title, description, due_date, status, priority, assigned_to, created_by, department, category, start_date, actual_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, description, due_date, status, priority, assigned_to, created_by, department, category, start_date, cleanDate(actual_date)]
    );
    const newTask = result.rows[0];

    const userResult = await pool.query(
      "SELECT display_name FROM users WHERE username = $1",
      [created_by]
    );
    const displayName = userResult.rows[0]?.display_name || created_by;

    const cleanStart = moment(start_date).format("YYYY-MM-DD");
    const cleanEnd = moment(due_date).format("YYYY-MM-DD");

    await pool.query(
      `INSERT INTO calendar (task_id, name, start_date, end_date, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [newTask.id, title, cleanStart, cleanEnd, created_by]
    );

    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});


router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, status, priority, department, category, start_date, actual_date } = req.body;
  const { username, role } = req.user;
  const cleanDate = (date) => (date === "" ? null : date);

  try {
    const result = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบ task นี้" });
    }

    const task = result.rows[0];
    if (role !== "admin" && task.assigned_to !== username && task.created_by !== username) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์แก้ไขงานนี้" });
    }

    const updated = await pool.query(
      "UPDATE tasks SET title=$1, description=$2, due_date=$3, status=$4, priority=$5, department=$6, category=$7, start_date=$8, actual_date=$9 WHERE id=$10 RETURNING *",
      [title, description, due_date, status, priority, department, category, start_date, cleanDate(actual_date), id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, role } = req.user;
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE id=$1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบ task นี้" });
    }
    const task = result.rows[0];
    if (role !== "admin" && task.assigned_to !== username && task.created_by !== username) {
      return res.status(403).json({ message: "ไม่มีสิทธิ์ลบงานนี้" });
    }
    await pool.query("DELETE FROM calendar WHERE task_id = $1", [id]);
    await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
