
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
  
    if (loading) {
      return null; // หรือแสดง Loading Spinner
    }
  
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

export default PrivateRoute;
