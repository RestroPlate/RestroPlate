import axios from "axios";

// Create an Axios instance with your base URL
const apiClient = axios.create({
  // This grabs the variable from GitHub Secrets during deployment,
  // or from your local .env file during development
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT token to every request if one is stored
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("restroplate_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;