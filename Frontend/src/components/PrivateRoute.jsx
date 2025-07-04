import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = () => {
  // Get the current authentication status from context
  const { isAuthenticated } = useAuth();

  /**
   * Logic:
   * - If user is authenticated, render child routes with <Outlet />.
   * - If not authenticated, redirect to the login page using <Navigate />.
   * - 'replace' prevents adding the login page to browser history, so back button won't return to protected route.
   */
  return isAuthenticated ? <Outlet /> : <Navigate to="/log-in" replace />;
};

export default PrivateRoute;
