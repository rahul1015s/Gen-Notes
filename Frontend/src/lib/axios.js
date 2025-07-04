import axios from "axios";

// Create a reusable axios instance with base settings
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1/",  // Base URL for all API requests
  withCredentials: true,                     // Send cookies along with requests (helps with authentication if needed)
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  // Get token from localStorage (set during login)
  const token = localStorage.getItem("token");

  // If token exists, attach it to the Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // The format is: Authorization: Bearer yourTokenHere
  }

  // Return updated config to continue with the request
  return config;
});

export default api;
