'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import Link from 'next/link';

/**
 * Public Job Details Page
 * View full job details
 * Application requires login
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
    responsibilities?: string[];
    benefits?: string[];
    deadline?: string;
    openings: number;
}

export default function PublicJobDetailsPage() {
    const params = useParams();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJob();
    }, [params.id]);

    const fetchJob = async () => {
        try {
            const response = await api.get(`/jobs/${params.id}`);
            setJob(response.data.data);
        } catch (error) {
            console.error('Failed to fetch job:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="text-xl text-gray-600">Loading...</div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="text-xl text-gray-600">Job not found</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Job Header */}
                <div className="bg-white p-8 rounded-lg shadow-md mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <p className="text-xl text-gray-700 mb-4">{job.company}</p>

                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800">
                            📍 {job.location}
                        </span>
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-100 text-green-800">
                            💼 {job.jobType}
                        </span>
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-purple-100 text-purple-800">
                            📊 {job.experienceLevel}
                        </span>
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-yellow-100 text-yellow-800">
                            💰 ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                        </span>
                    </div>

                    <Link
                        href="/login?redirect=/candidate/jobs"
                        className="w-full sm:w-auto inline-block text-center px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-lg transition-colors shadow-sm hover:shadow-md"
                    >
                        Login to Apply
                    </Link>
                </div>

                {/* Job Description */}
                <div className="bg-white p-8 rounded-lg shadow-md mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>

                {/* Requirements */}
                <div className="bg-white p-8 rounded-lg shadow-md mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                        ))}
                    </ul>
                </div>

                {/* Responsibilities */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                    <div className="bg-white p-8 rounded-lg shadow-md mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {job.responsibilities.map((resp, index) => (
                                <li key={index}>{resp}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Benefits */}
                {job.benefits && job.benefits.length > 0 && (
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {job.benefits.map((benefit, index) => (
                                <li key={index}>{benefit}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
