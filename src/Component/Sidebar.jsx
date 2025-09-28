import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation(); // ดึง path ของหน้าเว็บปัจจุบัน

  const menuItems = [
    { name: "Tracking", path: "/" },
    { name: "Calendar", path: "/calendar" },
    { name: "Doc", path: "/doc" },
    { name: "Question", path: "/question" },
    { name: "keeps", path: "/keeps" },
  ];

  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col">
      <div className="p-4">
        <img
          src="https://rdbi.co.th/wp-content/uploads/2024/04/RDBI-logo-e1714477558117.png"
          alt="R&DBI Logo"
          className="mx-auto"
        />
      </div>
      <nav className="flex-1 mt-6">
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-2 rounded-lg text-center transition ${
                  location.pathname === item.path
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
