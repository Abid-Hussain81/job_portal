'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import Link from 'next/link';

/**
 * Employer Dashboard
 * Overview of posted jobs and applications
 */

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    jobType: string;
    status: string;
    applicationCount: number;
    createdAt: string;
}

export default function EmployerDashboard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs/employer/my-jobs');
            const jobsData = response.data.data;
            setJobs(jobsData);

            // Calculate stats
            setStats({
                totalJobs: jobsData.length,
                activeJobs: jobsData.filter((j: Job) => j.status === 'active').length,
                totalApplications: jobsData.reduce((sum: number, j: Job) => sum + j.applicationCount, 0),
            });
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'closed':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ProtectedRoute allowedRoles={['employer']}>
            <div className="min-h-screen bg-bg-soft">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-secondary tracking-tight">Employer Dashboard</h1>
                            <p className="text-muted mt-2 font-medium text-lg">Manage your talent acquisition and active job listings.</p>
                        </div>
                        <Link
                            href="/employer/jobs/new"
                            className="w-full md:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center group"
                        >
                            <svg className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                            Post New Opportunity
                        </Link>
                    </header>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
                        {[
                            { label: 'Total Postings', value: stats.totalJobs, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'bg-primary/10 text-primary' },
                            { label: 'Active Roles', value: stats.activeJobs, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-success/10 text-success' },
                            { label: 'Total Applicants', value: stats.totalApplications, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'bg-secondary/10 text-secondary' },
                        ].map((stat, idx) => (
                            <div key={idx} className="card-premium p-8 group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={stat.icon} />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-3xl font-black text-secondary tracking-tighter">{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Jobs List */}
                    <div className="card-premium overflow-hidden">
                        <div className="px-10 py-8 border-b border-border bg-gray-50/50">
                            <h2 className="text-2xl font-black text-secondary flex items-center">
                                <span className="w-2 h-8 bg-primary rounded-full mr-4"></span>
                                Corporate Listing Audit
                            </h2>
                        </div>

                        {loading ? (
                            <div className="p-24 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
                                <p className="text-xl font-black text-secondary animate-pulse">Syncing Corporate Data...</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="p-24 text-center max-w-xl mx-auto">
                                <div className="w-24 h-24 bg-bg-soft rounded-3xl flex items-center justify-center mx-auto mb-8">
                                    <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-black text-secondary mb-4">No Active Records</h3>
                                <p className="text-muted font-medium mb-10 text-lg">Initialize your corporate presence by publishing your first career opportunity.</p>
                                <Link
                                    href="/employer/jobs/new"
                                    className="inline-flex px-8 py-4 bg-primary text-white rounded-2xl font-black transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                                >
                                    Post a Job
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {jobs.map((job) => (
                                    <div key={job._id} className="p-10 hover:bg-bg-soft/50 transition-colors group">
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(job.status)}`}>
                                                        {job.status}
                                                    </span>
                                                    <span className="text-xs font-bold text-muted uppercase tracking-widest">
                                                        Ref: {job._id.slice(-8)}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-black text-secondary group-hover:text-primary transition-colors leading-tight mb-2">{job.title}</h3>
                                                <p className="text-lg font-bold text-muted mb-6 flex items-center">
                                                    <span className="mr-3">📍 {job.location}</span>
                                                    <span className="w-1.5 h-1.5 bg-border rounded-full mr-3"></span>
                                                    <span>💼 {job.jobType}</span>
                                                </p>

                                                <div className="flex flex-wrap items-center gap-6">
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-bg-soft rounded-xl border border-border">
                                                        <span className="text-2xl font-black text-primary">{job.applicationCount}</span>
                                                        <span className="text-xs font-black text-muted uppercase tracking-wider">Applicants</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-muted">
                                                        Posted on <span className="text-secondary">{new Date(job.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                                <Link
                                                    href={`/employer/applicants?jobId=${job._id}`}
                                                    className="px-8 py-4 bg-secondary text-white rounded-2xl font-black text-center transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                                >
                                                    Manage Talent
                                                </Link>
                                                <Link
                                                    href={`/employer/jobs/${job._id}/edit`}
                                                    className="px-8 py-4 bg-white border-2 border-border text-secondary rounded-2xl font-black text-center transition-all hover:border-primary hover:text-primary"
                                                >
                                                    Modify
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
