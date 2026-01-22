/// <reference types="vite/client" />
import axios from 'axios';

// Get base URL from environment or default to the active ngrok tunnel
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://kaleidoscopically-prorailroad-kris.ngrok-free.dev';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
    timeout: 10000,
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Standardize error format or log global errors here
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);
