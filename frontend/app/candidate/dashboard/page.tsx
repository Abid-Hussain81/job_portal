'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import Link from 'next/link';

/**
 * Candidate Dashboard
 * View all applications and their status
 */

interface Application {
    _id: string;
    job: {
        _id: string;
        title: string;
        company: string;
        location: string;
        jobType: string;
        status: string;
    };
    status: string;
    createdAt: string;
}

export default function CandidateDashboard() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await api.get('/applications/my-applications');
            setApplications(response.data.data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'shortlisted':
                return 'bg-blue-100 text-blue-800';
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <ProtectedRoute allowedRoles={['candidate']}>
            <div className="min-h-screen bg-bg-soft">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header className="mb-10 text-center md:text-left">
                        <h1 className="text-4xl font-black text-secondary tracking-tight">My Professional Journey</h1>
                        <p className="text-muted mt-2 font-medium text-lg">Track and manage your ongoing career opportunities.</p>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
                            <p className="text-xl font-black text-secondary animate-pulse">Retrieving Applications...</p>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="card-premium p-16 text-center max-w-2xl mx-auto">
                            <div className="w-24 h-24 bg-bg-soft rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <svg className="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-secondary mb-4">No Active Applications</h3>
                            <p className="text-muted font-medium mb-10 text-lg leading-relaxed">Your professional journey is waiting to begin. Explore thousands of opportunities tailored just for you.</p>
                            <Link
                                href="/candidate/jobs"
                                className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 group"
                            >
                                <span>Browse Opportunities</span>
                                <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {applications.map((application) => (
                                <div key={application._id} className="card-premium p-8 group hover:border-primary transition-all duration-300">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${getStatusColor(application.status)}`}>
                                                    {application.status}
                                                </span>
                                                <span className="text-xs font-bold text-muted uppercase tracking-widest">
                                                    Ref: {application._id.slice(-8)}
                                                </span>
                                            </div>
                                            <Link href={`/candidate/jobs/${application.job._id}`}>
                                                <h2 className="text-2xl font-black text-secondary group-hover:text-primary transition-colors leading-tight mb-2">
                                                    {application.job.title}
                                                </h2>
                                            </Link>
                                            <p className="text-xl font-bold text-muted mb-6">{application.job.company}</p>

                                            <div className="flex flex-wrap gap-4 mb-6">
                                                <div className="flex items-center text-secondary font-bold text-sm bg-bg-soft px-4 py-2 rounded-xl">
                                                    <span className="mr-2 text-primary">📍</span> {application.job.location}
                                                </div>
                                                <div className="flex items-center text-secondary font-bold text-sm bg-bg-soft px-4 py-2 rounded-xl">
                                                    <span className="mr-2 text-primary">💼</span> {application.job.jobType}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-border">
                                                <p className="text-sm font-bold text-muted">
                                                    Applied on <span className="text-secondary">{new Date(application.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </p>
                                                <Link
                                                    href={`/candidate/jobs/${application.job._id}`}
                                                    className="text-primary font-black text-sm uppercase tracking-widest hover:underline underline-offset-8"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
