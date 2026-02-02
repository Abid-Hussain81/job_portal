'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, login as loginUser, logout as logoutUser, register as registerUser, RegisterData, LoginData } from '@/lib/auth';

/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 * 
 * WHY: Context API allows us to share authentication state globally
 * without prop drilling. This is essential for role-based routing.
 */

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (data: LoginData) => {
        const response = await loginUser(data);
        setUser(response.user);
    };

    const register = async (data: RegisterData) => {
        const response = await registerUser(data);
        setUser(response.user);
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    const refreshUser = async () => {
        await loadUser();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
