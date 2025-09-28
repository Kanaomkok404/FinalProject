import { useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext"; 
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const API_URL = `${import.meta.env.VITE_API_URL}/auth/login`;

  const handleLogin = async () => {
    console.log("🚀 handleLogin ถูกเรียกแล้ว!");
    try {
      const res = await axios.post(API_URL, { username, password }, {
        withCredentials: true 
      });

      console.log("🟢 Login response:", res.data);
      console.log("🧾 Response JSON:", JSON.stringify(res.data, null, 2));


      const { token, username: usernameFromServer, role, display_name } = res.data;

      console.log("📦 ได้ค่าจาก backend:", { token, username, role, display_name });

      localStorage.setItem("token", token);
      localStorage.setItem("username", usernameFromServer);
      localStorage.setItem("role", role);
      localStorage.setItem("display_name", display_name);

      login(token, usernameFromServer, role, display_name);

      alert("เข้าสู่ระบบสำเร็จ!");
      window.location.href = "/";
    } catch (err) {
      console.error("❌ Login Error:", err);
      setError(err.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-20 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4">เข้าสู่ระบบ</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <input
        type="text"
        placeholder="ชื่อผู้ใช้"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />
      <input
        type="password"
        placeholder="รหัสผ่าน"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded mb-3"
      />
      <button
        onClick={handleLogin}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        เข้าสู่ระบบ
      </button>

      <p className="text-sm mt-4 text-center">
        ยังไม่มีบัญชีใช่ไหม?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          ลงทะเบียนที่นี่
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
