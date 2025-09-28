import { useState, useEffect } from "react";
import "../index.css";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import UserMenu from "../Component/UserMenu";

const Mainpage = () => {
  const [message, setMessage] = useState("");
  const { logout, displayName, role, username } = useAuth();
  const navigate = useNavigate();

  const API_URL = `${import.meta.env.VITE_API_URL}`;

  useEffect(() => {
    fetch(`${API_URL}/`)  
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch((err) => console.error("Error fetching data:", err));
  }, [API_URL]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-6 relative">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Reports</h1>
          <UserMenu handleLogout={handleLogout} displayName={displayName} />
        </header>

        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold">Test Backend:</h2>
          <p className="text-gray-700">{message || "Loading..."}</p>
        </div>

        <div className="flex space-x-4 mt-12">
          <select className="flex-grow px-4 py-2 bg-white border rounded-lg shadow-sm">
            <option>Timeframe: All-time</option>
          </select>
          <select className="flex-grow px-4 py-2 bg-white border rounded-lg shadow-sm">
            <option>People: All</option>
          </select>
          <select className="flex-grow px-4 py-2 bg-white border rounded-lg shadow-sm">
            <option>Topic: All</option>
          </select>
        </div>

        <section className="grid grid-cols-2 gap-6 mt-6">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Recent</h2>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Strongest Topics</h2>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Notification</h2>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Statistics</h2>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Mainpage;
