'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

/**
 * Home Page
 * Landing page with role-based redirection
 * 
 * WHY: Different users should see different dashboards.
 * This page redirects authenticated users to their role-specific dashboard.
 */
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      if (user.role === 'candidate') {
        router.push('/candidate/jobs');
      } else if (user.role === 'employer') {
        router.push('/employer/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero Section - Professional Search Experience */}
      <div className="bg-bg-soft border-b border-border py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black text-secondary mb-6 leading-tight">
              One search, <span className="text-primary">millions of jobs.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted mb-12">
              The #1 job site in the world with over 300M unique visitors every month.
            </p>

            {/* Premium Search Container */}
            <div className="bg-white p-2 rounded-xl shadow-lg flex flex-col md:flex-row gap-2 border border-border">
              <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100">
                <svg className="w-5 h-5 text-muted mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="w-full focus:outline-none text-secondary font-medium"
                />
              </div>
              <div className="flex-1 flex items-center px-4 py-3">
                <svg className="w-5 h-5 text-muted mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="City or remote"
                  className="w-full focus:outline-none text-secondary font-medium"
                />
              </div>
              <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-bold transition-all shadow-sm">
                Find Jobs
              </button>
            </div>

            <p className="mt-6 text-sm text-muted">
              <span className="font-bold text-secondary">Post your resume</span> – It only takes a few seconds
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Features Section - Structured & Premium */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
          <div>
            <h2 className="text-3xl font-black text-secondary mb-6">Explore the right <span className="text-primary">career path</span> for you</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-secondary">Secure & Verified</h3>
                  <p className="text-muted">Every job posting is manually reviewed by our expert team to ensure maximum reliability.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-secondary">Instant Applications</h3>
                  <p className="text-muted">Apply to jobs with just one click using your saved profile and professional resume.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-soft p-6 rounded-2xl border border-border mt-8">
              <div className="text-3xl font-black text-primary mb-1">10k+</div>
              <div className="text-sm font-bold text-muted uppercase tracking-wider">Active Jobs</div>
            </div>
            <div className="bg-secondary p-6 rounded-2xl text-white">
              <div className="text-3xl font-black mb-1">5k+</div>
              <div className="text-sm font-bold opacity-80 uppercase tracking-wider">Companies</div>
            </div>
            <div className="bg-primary p-6 rounded-2xl text-white">
              <div className="text-3xl font-black mb-1">50k+</div>
              <div className="text-sm font-bold opacity-80 uppercase tracking-wider">Candidates</div>
            </div>
            <div className="bg-bg-soft p-6 rounded-2xl border border-border mt-[-2rem]">
              <div className="text-3xl font-black text-secondary mb-1">2M+</div>
              <div className="text-sm font-bold text-muted uppercase tracking-wider">Matches</div>
            </div>
          </div>
        </div>

        {/* Call to Action for Employers */}
        <div className="bg-secondary rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-6">Hiring? We can help.</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Reach millions of job seekers. Get your job postings in front of the right candidates.
            </p>
            <Link
              href="/register"
              className="inline-block bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-xl font-black text-lg transition-all transform hover:scale-105"
            >
              Post a Job Now
            </Link>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Professional Footer-like copyright */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted bg-bg-soft">
        <p>© 2026 JobPortal. Inspired by excellence in recruitment.</p>
      </footer>
    </div>
  );
}
