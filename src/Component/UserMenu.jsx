import { useState, useRef, useEffect } from "react";

const UserMenu = ({ handleLogout, displayName = "ชื่อของฉัน" }) => {
  const [showPopup, setShowPopup] = useState(false);
  const menuRef = useRef(null);

  const togglePopup = () => setShowPopup(!showPopup);

  const handleClickOutside = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setShowPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/2815/2815428.png"
        alt="User Menu"
        className="w-10 h-10 cursor-pointer hover:scale-105 transition-transform"
        onClick={togglePopup}
      />
      {showPopup && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white text-center font-semibold text-sm">
            👤 {displayName}
          </div>
          <ul className="divide-y divide-gray-200 text-sm">
            <li
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => alert("Coming soon...")}>
              ℹ️ Info
            </li>
            <li
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => alert("Download started...")}>
              ⬇️ Download
            </li>
            <li
              className="px-4 py-3 hover:bg-red-100 text-red-600 font-semibold cursor-pointer transition-colors"
              onClick={handleLogout}>
              🚪 Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
