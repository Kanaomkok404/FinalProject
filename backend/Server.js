import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./Route/TaskRoute.js";
import questionRoutes from "./Route/questionRoute.js";
import commentRoutes from "./Route/commentRoute.js";
import calendarRoutes from "./Route/calendarPageRoute.js";
import documentRoutes from "./Route/documentRoute.js";
import authRoutes from "./Route/authRoute.js";
import descriptionRoutes from "./Route/descriptionRoute.js";
import keepRoutes from "./Route/keepRoute.js";
import pool from "./db.js"; 
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true               
}));

app.use("/uploads", express.static(path.join("uploads")));

pool.connect((err) => {
  if (err) {
    console.error("Database connection error", err.stack);
  } else {
    console.log("Connected to PostgreSQL ✅");
  }
});

// Route ทดสอบ
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/tasks", taskRoutes);
app.use("/documents", documentRoutes);
app.use("/questions", questionRoutes); 
app.use("/comments", commentRoutes);
app.use("/calendar", calendarRoutes);
app.use("/auth", authRoutes);
app.use('/tasks', descriptionRoutes);
app.use("/keeps", keepRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "*******" : "Not set!");

