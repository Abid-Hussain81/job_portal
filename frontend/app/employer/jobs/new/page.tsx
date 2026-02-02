'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

/**
 * Post New Job Page
 * Form for employers to create job postings
 */

export default function PostJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        company: '',
        location: '',
        jobType: 'Full-time',
        experienceLevel: 'Mid',
        salaryMin: '',
        salaryMax: '',
        requirements: [''],
        responsibilities: [''],
        benefits: [''],
        openings: '1',
    });

    const handleArrayChange = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits') => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newArray.length > 0 ? newArray : [''] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const jobData = {
                title: formData.title,
                description: formData.description,
                company: formData.company,
                location: formData.location,
                jobType: formData.jobType,
                experienceLevel: formData.experienceLevel,
                salaryRange: {
                    min: Number(formData.salaryMin),
                    max: Number(formData.salaryMax),
                },
                requirements: formData.requirements.filter(r => r.trim() !== ''),
                responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
                benefits: formData.benefits.filter(b => b.trim() !== ''),
                openings: Number(formData.openings),
            };

            await api.post('/jobs', jobData);
            router.push('/employer/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['employer']}>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a New Job</h1>

                    {error && (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                        {/* Basic Info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.jobType}
                                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Remote">Remote</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level *</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.experienceLevel}
                                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                                >
                                    <option value="Entry">Entry</option>
                                    <option value="Mid">Mid</option>
                                    <option value="Senior">Senior</option>
                                    <option value="Lead">Lead</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary *</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.salaryMin}
                                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary *</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.salaryMax}
                                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Openings *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.openings}
                                onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                            <textarea
                                required
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Requirements */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Requirements *</label>
                            {formData.requirements.map((req, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={req}
                                        onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                                        placeholder="e.g., 3+ years of experience in React"
                                    />
                                    {formData.requirements.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('requirements', index)}
                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('requirements')}
                                className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                + Add Requirement
                            </button>
                        </div>

                        {/* Responsibilities */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities (Optional)</label>
                            {formData.responsibilities.map((resp, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={resp}
                                        onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                                        placeholder="e.g., Lead development of new features"
                                    />
                                    {formData.responsibilities.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('responsibilities', index)}
                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('responsibilities')}
                                className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                + Add Responsibility
                            </button>
                        </div>

                        {/* Benefits */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Benefits (Optional)</label>
                            {formData.benefits.map((benefit, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={benefit}
                                        onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                                        placeholder="e.g., Health insurance, Remote work"
                                    />
                                    {formData.benefits.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('benefits', index)}
                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('benefits')}
                                className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                + Add Benefit
                            </button>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Posting...' : 'Post Job'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
