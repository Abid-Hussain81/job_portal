'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

/**
 * Applicants Page
 * View and manage applications for a specific job
 */

interface Application {
    _id: string;
    candidate: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    status: string;
    coverLetter: string;
    resumeURL: string;
    expectedSalary?: number;
    availableFrom?: string;
    createdAt: string;
}

export default function ApplicantsPage() {
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    useEffect(() => {
        if (jobId) {
            fetchApplications();
        }
    }, [jobId]);

    const fetchApplications = async () => {
        try {
            const response = await api.get(`/applications/job/${jobId}`);
            setApplications(response.data.data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (applicationId: string, status: string) => {
        try {
            await api.put(`/applications/${applicationId}/status`, { status });
            // Refresh applications
            fetchApplications();
            setSelectedApp(null);
        } catch (error) {
            console.error('Failed to update status:', error);
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
        <ProtectedRoute allowedRoles={['employer']}>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Applicants</h1>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="text-xl text-gray-600">Loading applications...</div>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                            <p className="text-gray-600">Applications will appear here once candidates apply</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Applications List */}
                            <div className="space-y-4">
                                {applications.map((app) => (
                                    <div
                                        key={app._id}
                                        onClick={() => setSelectedApp(app)}
                                        className={`bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow ${selectedApp?._id === app._id ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{app.candidate.name}</h3>
                                                <p className="text-sm text-gray-600">{app.candidate.email}</p>
                                                {app.candidate.phone && (
                                                    <p className="text-sm text-gray-600">{app.candidate.phone}</p>
                                                )}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Applied {new Date(app.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Application Details */}
                            <div className="lg:sticky lg:top-8 lg:h-fit">
                                {selectedApp ? (
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Details</h2>

                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700 mb-1">Candidate</h3>
                                                <p className="text-gray-900">{selectedApp.candidate.name}</p>
                                                <p className="text-sm text-gray-600">{selectedApp.candidate.email}</p>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700 mb-1">Cover Letter</h3>
                                                <p className="text-gray-900 whitespace-pre-line">{selectedApp.coverLetter}</p>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700 mb-1">Resume</h3>
                                                <a
                                                    href={selectedApp.resumeURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View Resume →
                                                </a>
                                            </div>

                                            {selectedApp.expectedSalary && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-1">Expected Salary</h3>
                                                    <p className="text-gray-900">${selectedApp.expectedSalary.toLocaleString()}</p>
                                                </div>
                                            )}

                                            {selectedApp.availableFrom && (
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-1">Available From</h3>
                                                    <p className="text-gray-900">{new Date(selectedApp.availableFrom).toLocaleDateString()}</p>
                                                </div>
                                            )}

                                            <div className="pt-4 border-t">
                                                <h3 className="text-sm font-medium text-gray-700 mb-3">Update Status</h3>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => updateStatus(selectedApp._id, 'shortlisted')}
                                                        disabled={selectedApp.status === 'shortlisted'}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Shortlist
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(selectedApp._id, 'accepted')}
                                                        disabled={selectedApp.status === 'accepted'}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(selectedApp._id, 'rejected')}
                                                        disabled={selectedApp.status === 'rejected'}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(selectedApp._id, 'pending')}
                                                        disabled={selectedApp.status === 'pending'}
                                                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Reset
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white p-12 rounded-lg shadow-md text-center">
                                        <p className="text-gray-600">Select an application to view details</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
