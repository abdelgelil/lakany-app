import axios from 'axios';

// Determine the base URL. For development with proxy, it's just '/api'.
// For production, it's the full URL from the environment variable.
const baseURL = process.env.NODE_ENV === 'production' 
    ? import.meta.env.VITE_API_URL 
    : '/api';

const api = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to attach the correct token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('doctor_token') || localStorage.getItem('management_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;