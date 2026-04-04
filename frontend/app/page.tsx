'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import api from '@/lib/api';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  // Resume upload modal state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    router.push(`/jobs?${params.toString()}`);
  };

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'candidate') {
        router.push('/candidate/jobs');
      } else if (user.role === 'employer' && user.isApproved) {
        router.push('/employer/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, loading, router]);

  const handlePostResumeClick = () => {
    if (!user) {
      // Not logged in → go to register
      router.push('/register');
    } else if (user.role === 'candidate') {
      setShowResumeModal(true);
      setUploadSuccess(false);
      setUploadError('');
      setSelectedFile(null);
    } else {
      router.push('/register');
    }
  };

  const handleFileSelect = (file: File) => {
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only PDF and Word (.doc/.docx) files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be under 5 MB.');
      return;
    }
    setUploadError('');
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      await api.post('/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccess(true);
      setSelectedFile(null);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    setShowResumeModal(false);
    setSelectedFile(null);
    setUploadSuccess(false);
    setUploadError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-bg-soft border-b border-border py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black text-secondary mb-6 leading-tight">
              One search, <span className="text-primary">millions of jobs.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted mb-12">
              The #1 job site in the world with over 300M unique visitors every month.
            </p>

            {/* Search Container */}
            <div className="bg-white p-2 rounded-xl shadow-lg flex flex-col md:flex-row gap-2 border border-border">
              <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-100">
                <svg className="w-5 h-5 text-muted mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="w-full focus:outline-none text-secondary font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-bold transition-all shadow-sm"
              >
                Find Jobs
              </button>
            </div>

            <p className="mt-6 text-sm text-muted">
              <button
                id="post-resume-btn"
                onClick={handlePostResumeClick}
                className="font-bold text-primary hover:text-primary-hover underline underline-offset-2 transition-colors cursor-pointer"
              >
                Post your resume
              </button>
              {' '}– It only takes a few seconds
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Features Section */}
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

        {/* CTA for Employers */}
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
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-primary opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-blue-400 opacity-10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <footer className="border-t border-border py-8 text-center text-sm text-muted bg-bg-soft">
        <p>© 2026 JobPortal. Inspired by excellence in recruitment.</p>
      </footer>

      {/* ─── Resume Upload Modal ─── */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-secondary">Upload Your Resume</h2>
                <p className="text-sm text-muted mt-1">PDF or Word · Max 5 MB</p>
              </div>
              <button
                onClick={closeModal}
                id="close-resume-modal"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {uploadSuccess ? (
              /* ─── Success State ─── */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">Resume Uploaded!</h3>
                <p className="text-muted mb-6">Your resume has been saved to your profile.</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 rounded-xl border border-border text-secondary font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    href="/candidate/profile"
                    onClick={closeModal}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ) : (
              /* ─── Upload State ─── */
              <>
                {/* Drop Zone */}
                <div
                  id="resume-dropzone"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-primary bg-blue-50'
                      : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-primary hover:bg-blue-50/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="resume-file-input"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />

                  {selectedFile ? (
                    <div>
                      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="font-bold text-secondary">{selectedFile.name}</p>
                      <p className="text-sm text-muted mt-1">{(selectedFile.size / 1024).toFixed(0)} KB · Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="font-semibold text-secondary">Drag & drop your resume here</p>
                      <p className="text-sm text-muted mt-1">or <span className="text-primary font-bold">click to browse</span></p>
                      <p className="text-xs text-muted mt-3">Supported: PDF, DOC, DOCX · Max 5 MB</p>
                    </div>
                  )}
                </div>

                {/* Error */}
                {uploadError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {uploadError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 rounded-xl border border-border text-secondary font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="upload-resume-btn"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Uploading…
                      </>
                    ) : (
                      'Upload Resume'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
