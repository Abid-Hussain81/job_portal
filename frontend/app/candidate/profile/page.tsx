'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface Profile {
  _id: string;
  summary?: string;
  skills?: string[];
  resumeURL?: string;
  experience?: any[];
  education?: any[];
  portfolio?: {
    website?: string;
    linkedin?: string;
    github?: string;
  };
}

export default function CandidateProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  // Summary editing state
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [savingSummary, setSavingSummary] = useState(false);

  // Resume upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile/me');
      setProfile(response.data.data);
    } catch (err: any) {
      setError('Failed to load profile. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    try {
      setSavingSummary(true);
      const res = await api.put('/profile/me', { summary: editedSummary });
      setProfile(res.data.data);
      setIsEditingSummary(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save summary.');
    } finally {
      setSavingSummary(false);
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
    setUploadMsg('');
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
    setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      const res = await api.post('/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMsg('✓ Resume uploaded successfully!');
      setSelectedFile(null);
      // Refresh profile to show new resume
      await fetchProfile();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return;
    setDeletingResume(true);
    try {
      await api.delete('/profile/resume');
      setUploadMsg('Resume deleted.');
      await fetchProfile();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Failed to delete resume.');
    } finally {
      setDeletingResume(false);
    }
  };

  const getResumeFullURL = (resumeURL: string) => {
    if (resumeURL.startsWith('http')) return resumeURL;
    return `${API_BASE}${resumeURL}`;
  };

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setError('Only JPEG, PNG, and SVG images are allowed for avatars.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar file size must be under 5 MB.');
      return;
    }

    setUploadingAvatar(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Refresh AuthContext user to reflect new profile picture everywhere
      await refreshUser();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['candidate']}>
      <div className="min-h-screen bg-bg-soft font-sans">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-secondary">My Profile</h1>
            <p className="text-muted mt-1">Manage your resume and professional information</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-muted">Loading profile…</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
              {error}
            </div>
          ) : (
            <div className="space-y-6">

              {/* ─── User Info Card ─── */}
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6 flex items-center gap-5">
                <div 
                  className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-black shrink-0 relative group cursor-pointer overflow-hidden shadow-inner"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept=".jpg,.jpeg,.png,.svg"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `${API_BASE}${user.profilePicture}`} 
                      alt="Profile Avatar"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase() || '?'}</span>
                  )}
                  
                  {/* Upload Overlay */}
                  <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-opacity ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {uploadingAvatar ? (
                       <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                       </svg>
                    ) : (
                      <>
                        <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-white">Upload</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-secondary">{user?.name}</h2>
                  <p className="text-muted text-sm">{user?.email}</p>
                  <span className="inline-block mt-1.5 px-3 py-0.5 bg-blue-100 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                    Candidate
                  </span>
                </div>
              </div>

              {/* ─── Resume Card ─── */}
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-secondary">Resume / CV</h3>
                    <p className="text-xs text-muted">PDF or Word · Max 5 MB</p>
                  </div>
                </div>

                {/* Current Resume (if exists) */}
                {profile?.resumeURL && (
                  <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-green-700">
                          {getFileExtension(profile.resumeURL)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-secondary text-sm">Current Resume</p>
                        <p className="text-xs text-muted">Uploaded to your profile</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={getResumeFullURL(profile.resumeURL)}
                        target="_blank"
                        rel="noopener noreferrer"
                        id="view-resume-btn"
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </a>
                      <a
                        href={getResumeFullURL(profile.resumeURL)}
                        download
                        id="download-resume-btn"
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-border text-secondary text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </a>
                      <button
                        onClick={handleDeleteResume}
                        disabled={deletingResume}
                        id="delete-resume-btn"
                        className="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 border border-red-200 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingResume ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload feedback */}
                {uploadMsg && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
                    {uploadMsg}
                  </div>
                )}
                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {uploadError}
                  </div>
                )}

                {/* Drop Zone */}
                <div
                  id="profile-resume-dropzone"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-primary bg-blue-50'
                      : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 hover:border-primary hover:bg-blue-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="profile-file-input"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />

                  {selectedFile ? (
                    <div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="font-bold text-secondary">{selectedFile.name}</p>
                      <p className="text-sm text-muted mt-1">
                        {(selectedFile.size / 1024).toFixed(0)} KB · Click to change file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="font-semibold text-secondary">
                        {profile?.resumeURL ? 'Upload a new resume to replace current' : 'Drag & drop your resume here'}
                      </p>
                      <p className="text-sm text-muted mt-1">
                        or <span className="text-primary font-bold">click to browse</span>
                      </p>
                      <p className="text-xs text-muted mt-3">PDF, DOC, DOCX · Max 5 MB</p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                {selectedFile && (
                  <button
                    id="profile-upload-btn"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="mt-4 w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Resume
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* ─── Summary / Skills Placeholder Card ─── */}
              <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-secondary">Professional Summary</h3>
                  </div>
                  {!isEditingSummary && (
                    <button
                      onClick={() => {
                        setEditedSummary(profile?.summary || '');
                        setIsEditingSummary(true);
                      }}
                      className="px-4 py-2 bg-purple-50 text-purple-700 text-sm font-semibold rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditingSummary ? (
                  <div className="space-y-4">
                    <textarea
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      placeholder="Write a brief professional summary..."
                      className="w-full h-32 p-4 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-secondary"
                    />
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setIsEditingSummary(false)}
                        disabled={savingSummary}
                        className="px-4 py-2 border border-border text-secondary font-semibold hover:bg-gray-50 transition-colors rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSummary}
                        disabled={savingSummary}
                        className="px-4 py-2 bg-primary text-white font-semibold hover:bg-primary-hover transition-colors rounded-lg flex items-center gap-2 disabled:opacity-70"
                      >
                        {savingSummary ? 'Saving...' : 'Save Summary'}
                      </button>
                    </div>
                  </div>
                ) : profile?.summary ? (
                  <p className="text-secondary whitespace-pre-wrap leading-relaxed">{profile.summary}</p>
                ) : (
                  <p className="text-muted text-sm italic">No summary added yet. Click edit to add one.</p>
                )}

                {/* Skills */}
                {profile?.skills && profile.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-primary text-sm font-semibold rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
