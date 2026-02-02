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
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                        <p className="text-gray-600 mt-2">Track the status of your job applications</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="text-xl text-gray-600">Loading applications...</div>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                            <p className="text-gray-600 mb-6">Start applying to jobs to see them here</p>
                            <Link
                                href="/candidate/jobs"
                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Browse Jobs
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((application) => (
                                <div key={application._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <Link href={`/candidate/jobs/${application.job._id}`}>
                                                <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                                                    {application.job.title}
                                                </h2>
                                            </Link>
                                            <p className="text-gray-700 mt-1">{application.job.company}</p>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                                                    📍 {application.job.location}
                                                </span>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                                                    💼 {application.job.jobType}
                                                </span>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-3">
                                                Applied on {new Date(application.createdAt).toLocaleDateString()}
                                            </p>
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
