'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Professional Admin Login Page
 * WHY: Distinct from normal login to emphasize authority and security
 */
export default function AdminLoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData);
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Admin authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary relative overflow-hidden p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-white mb-6 shadow-2xl transform rotate-3">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">System Administration</h1>
                    <p className="text-blue-200 mt-2 font-bold tracking-widest uppercase text-xs">Secure Gateway Pro</p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl">
                    {error && (
                        <div className="mb-6 bg-red-100 border-l-4 border-error p-4 text-error text-sm font-black uppercase">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-secondary mb-2 uppercase tracking-widest">Master Identity</label>
                            <input
                                type="email"
                                required
                                className="w-full px-5 py-4 bg-bg-soft rounded-xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-secondary"
                                placeholder="Admin Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-secondary mb-2 uppercase tracking-widest">Cipher Code</label>
                            <input
                                type="password"
                                required
                                className="w-full px-5 py-4 bg-bg-soft rounded-xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-bold text-secondary"
                                placeholder="Master Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-secondary hover:bg-black text-white py-4 rounded-xl font-black text-lg transition-all shadow-xl flex items-center justify-center group"
                        >
                            {loading ? (
                                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    <span>Establish Link</span>
                                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <Link href="/login" className="text-secondary text-sm font-black hover:text-primary transition-colors underline underline-offset-4 decoration-2 decoration-primary/20">
                            Return to Public Terminal
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-center text-blue-200/50 text-xs font-bold uppercase tracking-widest">
                    V.1.6.2 // Secure Session Monitoring Active
                </p>
            </div>
        </div>
    );
}
