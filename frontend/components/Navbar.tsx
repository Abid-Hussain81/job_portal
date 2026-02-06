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
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">J</span>
                            <span className="text-xl font-bold tracking-tight text-secondary">JobPortal</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-1">
                        {!user ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/jobs"
                                    className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                >
                                    Browse Jobs
                                </Link>
                                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                                <Link
                                    href="/login"
                                    className="text-primary hover:text-primary-hover px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-md text-sm font-bold transition-all shadow-sm hover:shadow-md"
                                >
                                    Employers / Post Job
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-1">
                                {/* Candidate Links */}
                                {user.role === 'candidate' && (
                                    <>
                                        <Link
                                            href="/candidate/jobs"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            Find Jobs
                                        </Link>
                                        <Link
                                            href="/candidate/dashboard"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            My Applications
                                        </Link>
                                        <Link
                                            href="/candidate/profile"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
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
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/employer/jobs/new"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            Post a Job
                                        </Link>
                                        <Link
                                            href="/employer/applicants"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            Applicants
                                        </Link>
                                        <Link
                                            href="/employer/profile"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            Company Profile
                                        </Link>
                                    </>
                                )}

                                {/* Admin Links */}
                                {user.role === 'admin' && (
                                    <>
                                        <Link
                                            href="/admin/dashboard"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            Admin Panel
                                        </Link>
                                        <Link
                                            href="/admin/users"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            Users
                                        </Link>
                                        <Link
                                            href="/admin/jobs"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            Jobs
                                        </Link>
                                        <Link
                                            href="/admin/employers"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            Approvals
                                        </Link>
                                        <Link
                                            href="/admin/profile"
                                            className="text-muted hover:text-primary px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                                        >
                                            My Profile
                                        </Link>
                                    </>
                                )}

                                {/* User Menu Divider */}
                                <div className="h-8 w-px bg-gray-200 mx-4"></div>

                                {/* User Profile & Logout */}
                                <div className="flex items-center space-x-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-bold text-secondary leading-none">
                                            {user.name}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-primary mt-1">
                                            {user.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-muted hover:text-error transition-colors rounded-full hover:bg-red-50"
                                        title="Logout"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
