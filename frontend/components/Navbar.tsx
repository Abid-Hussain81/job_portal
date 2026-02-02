'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Navbar Component
 * Role-based navigation with authentication state
 * 
 * WHY: Different user roles see different navigation options.
 * Candidates see job browsing, employers see job posting, admins see admin panel.
 */
export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                            JobPortal
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        {!user ? (
                            <>
                                <Link
                                    href="/jobs"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Browse Jobs
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Candidate Links */}
                                {user.role === 'candidate' && (
                                    <>
                                        <Link
                                            href="/candidate/jobs"
                                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Browse Jobs
                                        </Link>
                                        <Link
                                            href="/candidate/dashboard"
                                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            My Applications
                                        </Link>
                                        <Link
                                            href="/candidate/profile"
                                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Profile
                                        </Link>
                                    </>
                                )}

                                {/* Employer Links */}
                                {user.role === 'employer' && (
                                    <>
                                        <Link
                                            href="/employer/dashboard"
                                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/employer/jobs/new"
                                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Post Job
                                        </Link>
                                        <Link
                                            href="/employer/applicants"
                                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Applicants
                                        </Link>
                                    </>
                                )}

                                {/* Admin Links */}
                                {user.role === 'admin' && (
                                    <>
                                        <Link
                                            href="/admin/dashboard"
                                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/admin/users"
                                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Users
                                        </Link>
                                        <Link
                                            href="/admin/jobs"
                                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Jobs
                                        </Link>
                                    </>
                                )}

                                {/* User Info & Logout */}
                                <div className="flex items-center space-x-3 border-l pl-4">
                                    <span className="text-sm text-gray-700">
                                        {user.name}
                                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                            {user.role}
                                        </span>
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
