'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

/**
 * Job Details & Application Page
 * View full job details and apply
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

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [applicationData, setApplicationData] = useState({
        coverLetter: '',
        resumeURL: '',
        expectedSalary: '',
        availableFrom: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setApplying(true);

        try {
            await api.post('/applications', {
                jobId: params.id,
                ...applicationData,
                expectedSalary: applicationData.expectedSalary ? Number(applicationData.expectedSalary) : undefined,
            });
            setSuccess('Application submitted successfully!');
            setTimeout(() => router.push('/candidate/dashboard'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['candidate']}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-xl text-gray-600">Loading...</div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!job) {
        return (
            <ProtectedRoute allowedRoles={['candidate']}>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-xl text-gray-600">Job not found</div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['candidate']}>
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

                        <button
                            onClick={() => setShowApplicationForm(!showApplicationForm)}
                            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-lg"
                        >
                            {showApplicationForm ? 'Hide Application Form' : 'Apply Now'}
                        </button>
                    </div>

                    {/* Application Form */}
                    {showApplicationForm && (
                        <div className="bg-white p-8 rounded-lg shadow-md mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Form</h2>

                            {error && (
                                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleApply} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cover Letter *
                                    </label>
                                    <textarea
                                        required
                                        rows={6}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tell us why you're a great fit for this role..."
                                        value={applicationData.coverLetter}
                                        onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Resume URL *
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="https://example.com/your-resume.pdf"
                                        value={applicationData.resumeURL}
                                        onChange={(e) => setApplicationData({ ...applicationData, resumeURL: e.target.value })}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">Link to your resume (Google Drive, Dropbox, etc.)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expected Salary (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="50000"
                                        value={applicationData.expectedSalary}
                                        onChange={(e) => setApplicationData({ ...applicationData, expectedSalary: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Available From (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={applicationData.availableFrom}
                                        onChange={(e) => setApplicationData({ ...applicationData, availableFrom: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={applying}
                                    className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {applying ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </form>
                        </div>
                    )}

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
        </ProtectedRoute>
    );
}
