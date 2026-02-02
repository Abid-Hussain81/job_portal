'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

/**
 * Candidate Profile Page
 * Manage profile, resume, and job preferences
 */

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data.data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                // Profile doesn't exist yet
                setProfile(null);
            } else {
                setError('Failed to load profile');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['candidate']}>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="text-xl text-gray-600">Loading profile...</div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Management</h3>
                                <p className="text-gray-600 mb-6">
                                    Profile management feature is coming soon. You'll be able to add your skills, experience, education, and resume here.
                                </p>
                                <p className="text-sm text-gray-500">
                                    For now, you can apply to jobs using the job application form.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
