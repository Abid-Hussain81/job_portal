'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

/**
 * Admin Dashboard
 * System analytics and management
 */

interface Stats {
    totalUsers: number;
    totalCandidates: number;
    totalEmployers: number;
    pendingEmployers: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalCandidates: 0,
        totalEmployers: 0,
        pendingEmployers: 0,
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            const data = response.data.data;

            // Map backend response structure to frontend state
            setStats({
                totalUsers: data.stats.users.total,
                totalCandidates: data.stats.users.candidates,
                totalEmployers: data.stats.users.employers,
                pendingEmployers: data.stats.users.pendingEmployers,
                totalJobs: data.stats.jobs.total,
                activeJobs: data.stats.jobs.active,
                totalApplications: data.stats.applications.total,
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-bg-soft">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header className="mb-12">
                        <h1 className="text-4xl font-black text-secondary tracking-tight">System Administration</h1>
                        <p className="text-muted mt-2 font-medium text-lg">Comprehensive overview of system performance and entity management.</p>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
                            <p className="text-xl font-black text-secondary animate-pulse">Synchronizing Data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                                {[
                                    { label: 'Total Users', value: stats.totalUsers, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'bg-primary/10 text-primary' },
                                    { label: 'Job Seekers', value: stats.totalCandidates, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'bg-green-100 text-green-600' },
                                    { label: 'Employers', value: stats.totalEmployers, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'bg-secondary/10 text-secondary' },
                                    { label: 'Pending Approvals', value: stats.pendingEmployers, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-error/10 text-error' },
                                    { label: 'Total Postings', value: stats.totalJobs, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'bg-indigo-100 text-indigo-600' },
                                    { label: 'Active Jobs', value: stats.activeJobs, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-success/10 text-success' },
                                    { label: 'Applications', value: stats.totalApplications, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-pink-100 text-pink-500' },
                                ].map((item, idx) => (
                                    <div key={idx} className="card-premium p-6 group">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-4 rounded-2xl ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                                                </svg>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-muted uppercase tracking-widest mb-1">{item.label}</p>
                                                <p className="text-4xl font-black text-secondary tracking-tighter">{item.value}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Management Console */}
                            <div className="card-premium p-10">
                                <h2 className="text-2xl font-black text-secondary mb-8 flex items-center">
                                    <span className="w-2 h-8 bg-primary rounded-full mr-4"></span>
                                    Management Console
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { href: '/admin/users', title: 'User Management', desc: 'Control user access, roles, and identity validation.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                                        { href: '/admin/employers', title: 'Employer Clearances', desc: 'Verify and authorize corporate entities for job posting.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                                        { href: '/admin/jobs', title: 'Content Moderation', desc: 'Audit and moderate active job listings for integrity.', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.727 2.903a2 2 0 01-.815 1.177l-1.933 1.288a2 2 0 00-1.164 2.04l.176 3.52a2 2 0 01-.429 1.556l-1.902 2.43a2 2 0 00-.54 1.02l-.477 2.387a2 2 0 001.414 1.96l2.903.727a2 2 0 011.177.815l1.288 1.933a2 2 0 002.04 1.164l3.52-.176a2 2 0 011.556.429l2.43 1.902a2 2 0 001.02.54l2.387.477a2 2 0 001.96-1.414l.727-2.903a2 2 0 01.815-1.177l1.933-1.288a2 2 0 001.164-2.04l-.176-3.52a2 2 0 01.429-1.556l1.902-2.43a2 2 0 00-.54-1.02l-2.387-.477z' },
                                    ].map((action, idx) => (
                                        <a
                                            key={idx}
                                            href={action.href}
                                            className="group block p-8 rounded-3xl border-2 border-border hover:border-primary hover:bg-bg-soft transition-all duration-300"
                                        >
                                            <div className="w-14 h-14 bg-bg-soft rounded-2xl mb-6 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-black text-secondary mb-3 group-hover:text-primary transition-colors">{action.title}</h3>
                                            <p className="text-muted font-medium leading-relaxed">{action.desc}</p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
