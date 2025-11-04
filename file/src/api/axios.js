import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/sign-in";
      }

      return Promise.reject({
        message: data.message || "Something went wrong",
        status,
        data,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: "No response from server. Please check your connection.",
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || "An error occurred",
      });
    }
  }
);

export default api;
