'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Protected Route Component
 * Wrapper for pages that require authentication and specific roles
 * 
 * WHY: This ensures only authorized users can access certain pages.
 * For example, only candidates can apply for jobs, only employers can post jobs.
 * 
 * USAGE: 
 * <ProtectedRoute allowedRoles={['candidate']}>
 *   <YourPage />
 * </ProtectedRoute>
 */

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('candidate' | 'employer' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Not authenticated
            if (!user) {
                router.push('/login');
                return;
            }

            // Authenticated but wrong role
            if (allowedRoles && !allowedRoles.includes(user.role)) {
                router.push('/'); // Redirect to home
                return;
            }

            // Check employer approval
            if (user.role === 'employer' && !user.isApproved) {
                // Show pending approval message
                console.warn('Employer account pending approval');
            }
        }
    }, [user, loading, allowedRoles, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return null;
    }

    // Wrong role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null;
    }

    // Employer not approved
    if (user.role === 'employer' && !user.isApproved) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Approval</h2>
                    <p className="text-gray-600 mb-6">
                        Your employer account is currently under review. You'll be able to post jobs once an admin approves your account.
                    </p>
                    <a
                        href="/"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                        Go to Home
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
