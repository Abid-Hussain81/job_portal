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
    const [filteredEmployers, setFilteredEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchEmployers();
    }, []);

    useEffect(() => {
        filterEmployers();
    }, [employers, searchTerm, filterStatus]);

    const fetchEmployers = async () => {
        try {
            const response = await api.get('/admin/users');
            const allUsers = response.data.data;
            setEmployers(allUsers.filter((u: any) => u.role === 'employer'));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch employers');
        } finally {
            setLoading(false);
        }
    };

    const filterEmployers = () => {
        let filtered = employers;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter((emp) =>
                emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.company?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter((emp) => emp.status === filterStatus);
        }

        setFilteredEmployers(filtered);
    };

    const handleApprove = async (userId: string, approve: boolean) => {
        try {
            await api.put(`/admin/users/${userId}/approve`, { approve });
            await fetchEmployers();
            console.log(`Employer ${approve ? 'approved' : 'rejected'} successfully`);
        } catch (err: any) {
            console.error('Failed to update employer status:', err);
            alert(err.response?.data?.message || 'Failed to update employer status');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-bg-soft">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header className="mb-10">
                        <h1 className="text-4xl font-black text-secondary tracking-tight">Employer Management</h1>
                        <p className="text-muted mt-2 font-medium text-lg">Review, approve, and manage employer accounts</p>
                    </header>

                    {/* Search and Filter Bar */}
                    <div className="card-premium p-6 mb-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or company..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-5 py-3 pl-12 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                />
                                <svg className="w-5 h-5 text-muted absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['all', 'pending', 'active', 'inactive'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${filterStatus === status
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-white text-muted border border-border hover:border-primary'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
                            <p className="text-xl font-black text-secondary animate-pulse">Loading employers...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-2xl mb-8 font-bold flex items-center">
                            <span className="mr-3 text-xl">⚠</span> {error}
                        </div>
                    ) : (
                        <>
                            {/* Results Count */}
                            <div className="mb-4 text-sm font-bold text-muted">
                                Showing {filteredEmployers.length} of {employers.length} employers
                            </div>

                            <div className="card-premium overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-border">
                                        <thead className="bg-gray-50/80">
                                            <tr>
                                                <th className="px-8 py-5 text-left text-xs font-black text-muted uppercase tracking-widest">Company</th>
                                                <th className="px-8 py-5 text-left text-xs font-black text-muted uppercase tracking-widest">Representative</th>
                                                <th className="px-8 py-5 text-left text-xs font-black text-muted uppercase tracking-widest">Email</th>
                                                <th className="px-8 py-5 text-left text-xs font-black text-muted uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-5 text-right text-xs font-black text-muted uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-border">
                                            {filteredEmployers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-8 py-12 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <svg className="w-16 h-16 text-muted/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                            </svg>
                                                            <p className="text-muted font-bold">No employers found matching your criteria</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredEmployers.map((employer) => (
                                                    <tr key={employer._id} className="hover:bg-bg-soft/50 transition-colors group">
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mr-3 text-secondary font-black">
                                                                    {(employer.company || 'C').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="text-sm font-black text-secondary group-hover:text-primary transition-colors">
                                                                    {employer.company || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-secondary">{employer.name}</div>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-muted">{employer.email}</div>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${employer.status === 'active' ? 'bg-success/10 text-success' :
                                                                    employer.status === 'pending' ? 'bg-warning/10 text-warning' :
                                                                        'bg-error/10 text-error'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${employer.status === 'active' ? 'bg-success' :
                                                                        employer.status === 'pending' ? 'bg-warning' :
                                                                            'bg-error'
                                                                    }`}></span>
                                                                {employer.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                            {employer.status === 'pending' ? (
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        onClick={() => handleApprove(employer._id, true)}
                                                                        className="px-4 py-2 bg-success/10 text-success rounded-xl font-black text-xs uppercase hover:bg-success hover:text-white transition-all"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleApprove(employer._id, false)}
                                                                        className="px-4 py-2 bg-error/10 text-error rounded-xl font-black text-xs uppercase hover:bg-error hover:text-white transition-all"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs font-black text-muted/40 uppercase tracking-widest">
                                                                    {employer.status === 'active' ? 'Approved' : 'Rejected'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
