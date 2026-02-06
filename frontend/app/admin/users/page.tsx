'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

/**
 * Admin User Management Page
 * View and manage all users in the system
 */

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'candidate' | 'employer' | 'admin';
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', phone: '' });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            await api.post('/admin/users', newAdmin);
            setShowModal(false);
            setNewAdmin({ name: '', email: '', password: '', phone: '' });
            fetchUsers();
            alert('Administrative account authorized successfully.');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Authorization failed');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleToggleStatus = async (userId: string) => {
        try {
            await api.put(`/admin/users/${userId}/toggle-status`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Status transition failed');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('IRREVERSIBLE ACTION: Confirm user purging from Master Records?')) return;

        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Purge operation failed');
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-bg-soft text-secondary">
                <Navbar />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">User Management</h1>
                            <p className="text-muted mt-2 font-medium text-lg">Inventory and access control of all system entities.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center group"
                        >
                            <svg className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Authorize Admin
                        </button>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
                            <p className="text-xl font-black animate-pulse">Scanning Master Records...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-error/10 border border-error/20 text-error px-6 py-4 rounded-2xl mb-8 font-bold flex items-center">
                            <span className="mr-3 text-xl">⚠</span> {error}
                        </div>
                    ) : (
                        <div className="card-premium overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-border">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-8 py-6 text-left text-xs font-black text-muted uppercase tracking-widest">Entity Identity</th>
                                            <th className="px-8 py-6 text-left text-xs font-black text-muted uppercase tracking-widest">Access Role</th>
                                            <th className="px-8 py-6 text-left text-xs font-black text-muted uppercase tracking-widest">System Status</th>
                                            <th className="px-8 py-6 text-left text-xs font-black text-muted uppercase tracking-widest">Registry Date</th>
                                            <th className="px-8 py-6 text-right text-xs font-black text-muted uppercase tracking-widest">Command</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-border">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-bg-soft/50 transition-colors group">
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-bg-soft rounded-xl flex items-center justify-center mr-4 text-primary font-black">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-base font-black text-secondary group-hover:text-primary transition-colors">{user.name}</div>
                                                            <div className="text-sm font-medium text-muted">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-secondary text-white' :
                                                        user.role === 'employer' ? 'bg-primary/10 text-primary' :
                                                            'bg-success/10 text-success'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className={`w-2 h-2 rounded-full mr-2 ${user.status === 'active' ? 'bg-success animate-pulse' :
                                                            user.status === 'pending' ? 'bg-warning' : 'bg-error'
                                                            }`}></span>
                                                        <span className="text-sm font-bold capitalize">{user.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-muted uppercase">
                                                    {new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                                                    {user.role !== 'admin' ? (
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                onClick={() => handleToggleStatus(user._id)}
                                                                className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-tighter transition-all ${user.status === 'active'
                                                                    ? 'bg-error/10 text-error hover:bg-error hover:text-white'
                                                                    : 'bg-success/10 text-success hover:bg-success hover:text-white'
                                                                    }`}
                                                            >
                                                                {user.status === 'active' ? 'Deauthorize' : 'Authorize'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user._id)}
                                                                className="px-4 py-2 bg-gray-100 text-muted rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-secondary hover:text-white transition-all"
                                                            >
                                                                Purge
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs font-black text-muted/30 uppercase tracking-widest cursor-not-allowed">Admin Locked</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Authorization Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                            <div className="p-10">
                                <h3 className="text-3xl font-black text-secondary mb-2">New Administrative Warrant</h3>
                                <p className="text-muted font-medium mb-8">Grant system-wide access to a new administrative entity.</p>

                                <form onSubmit={handleCreateAdmin} className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">Legal Name</label>
                                        <input
                                            type="text"
                                            value={newAdmin.name}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                            className="w-full px-5 py-4 bg-bg-soft border-2 border-border rounded-2xl focus:border-primary focus:outline-none font-bold text-secondary transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">Secure Email</label>
                                        <input
                                            type="email"
                                            value={newAdmin.email}
                                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                            className="w-full px-5 py-4 bg-bg-soft border-2 border-border rounded-2xl focus:border-primary focus:outline-none font-bold text-secondary transition-colors"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">Initial Key</label>
                                            <input
                                                type="password"
                                                value={newAdmin.password}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                                className="w-full px-5 py-4 bg-bg-soft border-2 border-border rounded-2xl focus:border-primary focus:outline-none font-bold text-secondary transition-colors"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-muted uppercase tracking-widest mb-2">Contact Link</label>
                                            <input
                                                type="tel"
                                                value={newAdmin.phone}
                                                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                                                className="w-full px-5 py-4 bg-bg-soft border-2 border-border rounded-2xl focus:border-primary focus:outline-none font-bold text-secondary transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-8 py-4 bg-gray-100 text-muted rounded-2xl font-black transition-all hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createLoading}
                                            className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-black transition-all shadow-xl hover:shadow-2xl disabled:opacity-50"
                                        >
                                            {createLoading ? 'Authorizing...' : 'Grant Access'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
