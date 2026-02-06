'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Global Profile Redirect
 * WHY: Provides a single /profile URL that handles role-based redirection
 */

export default function ProfileRedirect() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else {
                // Redirect based on role
                if (user.role === 'candidate') {
                    router.push('/candidate/profile');
                } else if (user.role === 'employer') {
                    router.push('/employer/profile');
                } else if (user.role === 'admin') {
                    router.push('/admin/dashboard'); // Admins go to dashboard as they don't have a "profile" per se
                }
            }
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl text-gray-600">Redirecting...</div>
        </div>
    );
}
