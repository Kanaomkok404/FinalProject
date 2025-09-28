import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true);

  // ✅ NEW: สร้าง user object ที่ใช้ใน context อื่นๆ ได้
  const user = {
    username,
    role,
    displayName,
    token,
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");
    const storedDisplayName = localStorage.getItem("display_name");

    if (storedToken) {
      setToken(storedToken); 
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setRole(storedRole);
      setDisplayName(storedDisplayName);
    }
    setLoading(false);
  }, []);

  const login = (token, username, role, display_name) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
    localStorage.setItem("display_name", display_name);

    setToken(token);
    setIsAuthenticated(true);
    setUsername(username);
    setRole(role);
    setDisplayName(display_name);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("display_name");

    setToken(null);
    setIsAuthenticated(false);
    setUsername(null);
    setRole(null);
    setDisplayName(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        role,
        displayName,
        token,
        user, // ✅ NEW: เพิ่ม user object เข้า context
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const useIsAdmin = () => {
  const { role } = useAuth();
  return role === "admin";
};

export { AuthContext };
