import api from './api';

/**
 * Authentication Utilities
 * Helper functions for user authentication
 */

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'candidate' | 'employer' | 'admin';
    isApproved: boolean;
    company?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'candidate' | 'employer';
    company?: string;
    phone?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<{ user: User }> => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<{ user: User }> => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
    await api.post('/auth/logout');
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
    try {
        const response = await api.get('/auth/me');
        return response.data.user;
    } catch (error) {
        return null;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    return user !== null;
};
