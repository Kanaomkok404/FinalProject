import express from "express";
import pool from "../db.js";
import authenticateToken from "../Middleware/authMiddleware.js";

const router = express.Router();

// ✅ 1. Keep question
router.post('/', authenticateToken, async (req, res) => {
  const { question_id, custom_title } = req.body;
  const kept_by = req.user.username;
  try {
    const result = await pool.query(
      `INSERT INTO kept_questions (question_id, kept_by, custom_title)
       VALUES ($1, $2, $3)
       ON CONFLICT (question_id, kept_by) DO NOTHING
       RETURNING *`,
      [question_id, kept_by, custom_title]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'โพสต์นี้ถูก keep ไปแล้วนะ' });
    }

    await pool.query(
      'UPDATE questions SET is_hidden = true WHERE id = $1',
      [question_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to keep question' });
  }
});

// ✅ 2. Get kept posts เฉพาะของตัวเอง
router.get('/', authenticateToken, async (req, res) => {
  const { username } = req.user;
  try {
    const keptResult = await pool.query(
      `SELECT k.*, q.content, q.file_urls, u.display_name AS display_name
       FROM kept_questions k
       JOIN questions q ON k.question_id = q.id
       JOIN users u ON q.user_name = u.username
       WHERE k.kept_by = $1
       ORDER BY k.created_at DESC`,
      [username]
    );

    const keptQuestions = keptResult.rows;
    const questionIds = keptQuestions.map(q => q.question_id);

    const commentResult = await pool.query(
      `SELECT c.*, u.display_name 
       FROM comments c
       JOIN users u ON c.user_name = u.username
       WHERE c.question_id = ANY($1)
       ORDER BY c.created_at ASC`,
      [questionIds]
    );

    const allComments = commentResult.rows;

    const responseData = keptQuestions.map(post => ({
      ...post,
      created_at: post.created_at,
      comments: allComments.filter(c => c.question_id === post.question_id),
    }));

    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch kept questions' });
  }
});

// ✅ 3. Get all kept posts ของทุก user (ใช้ในหน้า "โพสต์ที่เก็บไว้")
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const keptResult = await pool.query(
      `SELECT k.*, q.content, q.file_urls, u.display_name AS display_name
       FROM kept_questions k
       JOIN questions q ON k.question_id = q.id
       JOIN users u ON q.user_name = u.username
       ORDER BY k.created_at DESC`
    );

    const keptQuestions = keptResult.rows;
    const questionIds = keptQuestions.map(q => q.question_id);

    const commentResult = await pool.query(
      `SELECT c.*, u.display_name 
       FROM comments c
       JOIN users u ON c.user_name = u.username
       WHERE c.question_id = ANY($1)
       ORDER BY c.created_at ASC`,
      [questionIds]
    );

    const allComments = commentResult.rows;

    const responseData = keptQuestions.map(post => ({
      ...post,
      created_at: post.created_at,
      comments: allComments.filter(c => c.question_id === post.question_id),
    }));

    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch all kept questions' });
  }
});

// ✅ 4. Get comments ของ kept post
router.get("/:id/comments", authenticateToken, async (req, res) => {
  const keptId = req.params.id;

  try {
    const keptResult = await pool.query(
      "SELECT question_id FROM kept_questions WHERE id = $1",
      [keptId]
    );

    if (keptResult.rows.length === 0) {
      return res.status(404).json({ error: "Kept post not found" });
    }

    const questionId = keptResult.rows[0].question_id;

    const commentResult = await pool.query(
      `SELECT c.*, u.display_name 
       FROM comments c
       JOIN users u ON c.user_name = u.username
       WHERE c.question_id = $1
       ORDER BY c.created_at ASC`,
      [questionId]
    );

    res.json(commentResult.rows);
  } catch (err) {
    console.error("Error fetching comments for kept post:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// ✅ 5. Delete kept post (delete comment + question จริงๆ ด้วย)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const username = req.user.username;

  try {
    const kept = await pool.query(
      'SELECT * FROM kept_questions WHERE id = $1 AND kept_by = $2',
      [id, username]
    );

    if (kept.rows.length === 0) {
      return res.status(404).json({ message: 'Kept post not found or unauthorized' });
    }

    const questionId = kept.rows[0].question_id;

    await pool.query('DELETE FROM kept_questions WHERE id = $1', [id]);
    await pool.query('DELETE FROM comments WHERE question_id = $1', [questionId]);
    await pool.query('DELETE FROM questions WHERE id = $1', [questionId]);

    res.json({ message: 'Kept post and original question deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete kept post' });
  }
});

export default router;
