'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

/**
 * Register Page
 * Handles new user registration with role selection
 */
export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'candidate' as 'candidate' | 'employer',
        company: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            router.push('/'); // Redirect based on role
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-bg-soft">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4 py-12">
                <div className="max-w-xl w-full">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-secondary tracking-tight">Create your account</h2>
                        <p className="mt-3 text-muted font-medium text-lg">
                            Start your professional journey with <span className="text-primary font-bold">JobPortal</span>.
                        </p>
                    </div>

                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-border">
                        {error && (
                            <div className="mb-8 bg-red-50 border-l-4 border-error p-4 text-error text-sm font-bold flex items-center">
                                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {/* Role Selection - Professional Toggles */}
                            <div>
                                <label className="block text-sm font-black text-secondary mb-3 uppercase tracking-widest">
                                    I am a:
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'candidate' })}
                                        className={`py-4 px-6 rounded-2xl text-sm font-black transition-all border-2 ${formData.role === 'candidate'
                                            ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]'
                                            : 'bg-white text-muted border-border hover:border-primary/50'
                                            }`}
                                    >
                                        🚀 Job Seeker
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'employer' })}
                                        className={`py-4 px-6 rounded-2xl text-sm font-black transition-all border-2 ${formData.role === 'employer'
                                            ? 'bg-secondary text-white border-secondary shadow-lg scale-[1.02]'
                                            : 'bg-white text-muted border-border hover:border-secondary/50'
                                            }`}
                                    >
                                        🏢 Employer
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="md:col-span-2">
                                    <label htmlFor="name" className="block text-sm font-black text-secondary mb-2 uppercase tracking-wide">
                                        Full Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full px-5 py-4 rounded-xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-black text-secondary mb-2 uppercase tracking-wide">
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full px-5 py-4 rounded-xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-black text-secondary mb-2 uppercase tracking-wide">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        minLength={6}
                                        className="w-full px-5 py-4 rounded-xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                        placeholder="Min. 6 characters"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>

                                {/* Company (for employers only) */}
                                {formData.role === 'employer' && (
                                    <div className="md:col-span-2">
                                        <label htmlFor="company" className="block text-sm font-black text-secondary mb-2 uppercase tracking-wide">
                                            Company Name
                                        </label>
                                        <input
                                            id="company"
                                            name="company"
                                            type="text"
                                            required
                                            className="w-full px-5 py-4 rounded-xl border border-border focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all font-medium"
                                            placeholder="e.g. Acme Corporation"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                )}

                                {/* Phone */}
                                <div className="md:col-span-2">
                                    <label htmlFor="phone" className="block text-sm font-black text-secondary mb-2 uppercase tracking-wide">
                                        Phone Number (Optional)
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        className="w-full px-5 py-4 rounded-xl border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary-hover text-white py-5 rounded-2xl font-black text-xl transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center group"
                                >
                                    {loading ? (
                                        'Creating your account...'
                                    ) : (
                                        <>
                                            <span>Register Now</span>
                                            <svg className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-center text-muted font-bold text-sm">
                                Already have an account?{' '}
                                <Link href="/login" className="text-primary hover:underline underline-offset-4 decoration-2">
                                    Sign in here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
