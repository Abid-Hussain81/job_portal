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
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
                            <p className="text-gray-600 mt-2">Manage your job postings and applications</p>
                        </div>
                        <Link
                            href="/employer/jobs/new"
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                        >
                            + Post New Job
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Total Jobs</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Active Jobs</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-600">Total Applications</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Your Job Postings</h2>
                        </div>

                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="text-xl text-gray-600">Loading jobs...</div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Posted Yet</h3>
                                <p className="text-gray-600 mb-6">Start by posting your first job</p>
                                <Link
                                    href="/employer/jobs/new"
                                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Post a Job
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {jobs.map((job) => (
                                    <div key={job._id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                                                <p className="text-gray-600 mt-1">{job.location} • {job.jobType}</p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                                                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {job.applicationCount} {job.applicationCount === 1 ? 'application' : 'applications'}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Posted {new Date(job.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/employer/applicants?jobId=${job._id}`}
                                                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                            >
                                                View Applicants
                                            </Link>
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
