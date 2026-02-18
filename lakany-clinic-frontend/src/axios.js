import axios from 'axios';

/**
 * PRODUCTION TIP: 
 * Since our Express backend is serving the React dist folder, 
 * the frontend and backend share the same domain. 
 * Using '/api' as the baseURL will automatically point to:
 * https://lakany-app-production.up.railway.app/api
 */
const api = axios.create({
  baseURL: '/api', 
    headers: { 'Content-Type': 'application/json' }
});

// Add a request interceptor to attach tokens automatically
api.interceptors.request.use(
    (config) => {
        // Try to get tokens for any of the three roles
        const token = 
            localStorage.getItem('token') || 
            localStorage.getItem('doctor_token') || 
            localStorage.getItem('management_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add a response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized! Redirecting to login...");
            // Optional: localStorage.clear(); window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;