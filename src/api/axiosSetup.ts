import axios from 'axios';

// Create an Axios instance with your base URL
const apiClient = axios.create({
  // This grabs the variable from GitHub Secrets during deployment,
  // or from your local .env file during development
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;