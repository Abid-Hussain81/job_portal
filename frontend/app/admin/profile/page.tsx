'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

/**
 * Admin Profile Page
 * System administrators can view and manage their basic account details.
 */
export default function AdminProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile/me');
            const data = response.data.data;
            setProfile(data);
            setFormData({
                name: data.user.name,
                phone: data.user.phone || '',
            });
        } catch (error) {
            console.error('Failed to fetch admin profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/profile/me', formData);
            setMessage({ type: 'success', text: 'Administrative profile updated successfully.' });
            fetchProfile();
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile.',
            });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen bg-bg-soft">
                <Navbar />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <header className="mb-12">
                        <h1 className="text-4xl font-black text-secondary tracking-tight">Administrative Identity</h1>
                        <p className="text-muted mt-2 font-medium text-lg">Manage your secure identity within the Master Control System.</p>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
                            <p className="text-xl font-black text-secondary animate-pulse">Retrieving Credentials...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Profile Sidebar */}
                            <div className="md:col-span-1">
                                <div className="card-premium p-8 text-center bg-secondary text-white">
                                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/20">
                                        <span className="text-4xl font-black">{formData.name.charAt(0)}</span>
                                    </div>
                                    <h2 className="text-2xl font-black mb-1">{formData.name}</h2>
                                    <p className="text-white/60 font-black uppercase tracking-widest text-xs">System Administrator</p>

                                    <div className="mt-8 pt-8 border-t border-white/10 text-left">
                                        <div className="mb-4">
                                            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Status</p>
                                            <div className="flex items-center">
                                                <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
                                                <span className="text-sm font-bold">Authorized Access</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Identity UID</p>
                                            <p className="text-sm font-mono truncate">{profile?.user?._id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Form */}
                            <div className="md:col-span-2">
                                <div className="card-premium p-10">
                                    <h2 className="text-2xl font-black text-secondary mb-8 flex items-center">
                                        <span className="w-2 h-8 bg-primary rounded-full mr-4"></span>
                                        Core Credentials
                                    </h2>

                                    {message.text && (
                                        <div className={`mb-8 p-4 rounded-xl font-bold flex items-center ${message.type === 'success'
                                                ? 'bg-success/10 text-success border border-success/20'
                                                : 'bg-error/10 text-error border border-error/20'
                                            }`}>
                                            <span className="mr-3">{message.type === 'success' ? '✓' : '⚠'}</span>
                                            {message.text}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <label className="block text-sm font-black text-muted uppercase tracking-widest mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-5 py-4 bg-bg-soft border-2 border-border rounded-2xl focus:border-primary focus:outline-none font-bold text-secondary transition-colors"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-muted uppercase tracking-widest mb-2">Primary Email (System Log)</label>
                                                <input
                                                    type="email"
                                                    value={profile?.user?.email}
                                                    className="w-full px-5 py-4 bg-gray-100 border-2 border-border rounded-2xl font-bold text-muted cursor-not-allowed"
                                                    disabled
                                                />
                                                <p className="text-xs text-muted mt-2 font-medium italic">Contact the SysOps department to modify core identification email.</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-black text-muted uppercase tracking-widest mb-2">Secure Contact Number</label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-5 py-4 bg-bg-soft border-2 border-border rounded-2xl focus:border-primary focus:outline-none font-bold text-secondary transition-colors"
                                                    placeholder="Enter verified phone number"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6">
                                            <button
                                                type="submit"
                                                disabled={updating}
                                                className="w-full md:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:scale-100"
                                            >
                                                {updating ? 'Committing Changes...' : 'Update Credentials'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
