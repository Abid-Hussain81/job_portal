import axios from 'axios';

/**
 * Axios API Client
 * Configured with base URL and credentials for cookie-based auth
 * 
 * WHY: Centralized API configuration ensures all requests use the same settings.
 * withCredentials: true allows cookies to be sent with requests for JWT auth.
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // Important for cookie-based authentication
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If access token expired, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Don't redirect to login if we're just checking auth status
            const isCheckingAuth = originalRequest.url?.includes('/auth/me');

            if (isCheckingAuth) {
                // Just return the error, don't try to refresh or redirect
                return Promise.reject(error);
            }

            try {
                await api.post('/auth/refresh');
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login only if not already on login/register
                if (typeof window !== 'undefined' &&
                    !window.location.pathname.includes('/login') &&
                    !window.location.pathname.includes('/register')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
