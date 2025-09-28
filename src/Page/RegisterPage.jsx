import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    display_name: "",
    role: "user", 
  });
  const [message, setMessage] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/auth/register`;

  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API_URL, form);
      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl mb-4 font-semibold">สมัครสมาชิก</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="text"
          name="display_name"
          placeholder="ชื่อที่ใช้แสดงผล"
          value={form.display_name}
          onChange={handleChange}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 mb-3 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          สมัครสมาชิก
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default RegisterPage;
