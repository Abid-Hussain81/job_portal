'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

/**
 * Admin Employers Approval Page
 * Review and approve/reject pending employer accounts
 */

interface Employer {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    company: string;
    createdAt: string;
}

export default function AdminEmployersPage() {
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEmployers();
    }, []);

    const fetchEmployers = async () => {
        try {
            const response = await api.get('/admin/users');
            // Filter only employers and potentially pending ones if needed, 
            // but the UI shows all employers for management.
            const allUsers = response.data.data;
            setEmployers(allUsers.filter((u: any) => u.role === 'employer'));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch employers');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string, approve: boolean) => {
        try {
            // Note: The backend route is /users/:id/approve
            await api.put(`/admin/users/${userId}/approve`, { approve });
            fetchEmployers(); // Refresh list
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update employer status');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Employer Management</h1>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="text-xl text-gray-600">Loading employers...</div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    ) : (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rep Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {employers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No employers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        employers.map((employer) => (
                                            <tr key={employer._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{employer.company || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{employer.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{employer.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employer.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            employer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {employer.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {employer.status === 'pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(employer._id, true)}
                                                                className="text-green-600 hover:text-green-900 mr-4"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleApprove(employer._id, false)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">Processed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
