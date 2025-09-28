import bcrypt from "bcryptjs"; 
import pool from "../db.js"; 

const seedUser = async () => {
  try {
    const username = "admin";
    const plainPassword = "123456";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const insertQuery = "INSERT INTO users (username, password) VALUES ($1, $2)";
    console.log("DB password:", typeof process.env.DB_PASSWORD, process.env.DB_PASSWORD);
    await pool.query(insertQuery, [username, hashedPassword]);

    console.log("เพิ่มผู้ใช้ admin เรียบร้อยแล้ว!");
    process.exit(); // ปิด process หลังจบ
  } catch (err) {
    console.error("เกิดข้อผิดพลาด:", err);
    process.exit(1);
  }
};

seedUser();
