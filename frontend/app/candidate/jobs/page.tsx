'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import Link from 'next/link';

/**
 * Candidate Jobs Page
 * Browse and search for jobs with advanced filters
 */

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    jobType: string;
    experienceLevel: string;
    salaryRange: {
        min: number;
        max: number;
        currency: string;
    };
    description: string;
    requirements: string[];
    createdAt: string;
}

export default function CandidateJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        jobType: '',
        experienceLevel: '',
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchJobs();
    }, [filters, page]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
            });

            const response = await api.get(`/jobs?${params}`);
            setJobs(response.data.data);
            setTotalPages(response.data.pagination.pages);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
        setPage(1); // Reset to first page
    };

    return (
        <ProtectedRoute allowedRoles={['candidate']}>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Jobs</h1>

                    {/* Filters */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                            />

                            <input
                                type="text"
                                placeholder="Location"
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                            />

                            <select
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.jobType}
                                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                            >
                                <option value="">All Job Types</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Remote">Remote</option>
                            </select>

                            <select
                                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.experienceLevel}
                                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                            >
                                <option value="">All Experience Levels</option>
                                <option value="Entry">Entry</option>
                                <option value="Mid">Mid</option>
                                <option value="Senior">Senior</option>
                                <option value="Lead">Lead</option>
                            </select>
                        </div>
                    </div>

                    {/* Job Listings */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="text-xl text-gray-600">Loading jobs...</div>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <p className="text-xl text-gray-600">No jobs found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <div key={job._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <Link href={`/candidate/jobs/${job._id}`}>
                                                <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                                                    {job.title}
                                                </h2>
                                            </Link>
                                            <p className="text-lg text-gray-700 mt-1">{job.company}</p>
                                            <div className="flex flex-wrap gap-3 mt-3">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                                    📍 {job.location}
                                                </span>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                                                    💼 {job.jobType}
                                                </span>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                                                    📊 {job.experienceLevel}
                                                </span>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                                                    💰 ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mt-4 line-clamp-2">{job.description}</p>
                                        </div>
                                        <Link
                                            href={`/candidate/jobs/${job._id}`}
                                            className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-gray-700">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
