import { createContext, useContext, useState } from "react";
import offlineSyncService from "../services/offlineSyncService.js";

// Create a new context to hold authentication-related values
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  /**
   * isAuthenticated state:
   * - Initializes based on localStorage.
   * - !! converts truthy/falsy to true/false.
   * - So if token exists, isAuthenticated starts as true.
   */
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  /**
   * login function:
   * - Stores token in localStorage.
   * - Updates state to reflect user is logged in.
   */
  const login = (token) => {
    localStorage.setItem("token", token);
    offlineSyncService.setAuthToken(token).catch(() => {});
    setIsAuthenticated(true);
  };

  /**
   * logout function:
   * - Removes token from localStorage.
   * - Updates state to reflect user is logged out.
   */
  const logout = () => {
    localStorage.removeItem("token");
    offlineSyncService.clearAuthToken().catch(() => {});
    setIsAuthenticated(false);
  };

  /**
   * Provide the context values:
   * - isAuthenticated: current login status.
   * - login: function to log in.
   * - logout: function to log out.
   * - children: nested components that can consume this context.
   */
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access AuthContext:
 * - Makes consuming context cleaner in other components.
 */
export const useAuth = () => useContext(AuthContext);
