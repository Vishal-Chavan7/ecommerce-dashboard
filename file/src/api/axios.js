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
    console.log(
      "Axios Interceptor - Token from localStorage:",
      token ? "Token exists" : "No token found"
    );
    console.log("Axios Interceptor - Request URL:", config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Axios Interceptor - Authorization header set");
    } else {
      console.warn("Axios Interceptor - No token found in localStorage!");
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
    console.log(
      "Axios Response Success:",
      response.config.url,
      "Status:",
      response.status
    );
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      console.error(
        "Axios Response Error:",
        error.config.url,
        "Status:",
        status,
        "Message:",
        data.message
      );

      if (status === 401) {
        console.warn("401 Unauthorized - Redirecting to sign-in");
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
      console.error("Axios Error - No response from server:", error.request);
      return Promise.reject({
        message: "No response from server. Please check your connection.",
      });
    } else {
      // Something else happened
      console.error("Axios Error:", error.message);
      return Promise.reject({
        message: error.message || "An error occurred",
      });
    }
  }
);

export default api;
