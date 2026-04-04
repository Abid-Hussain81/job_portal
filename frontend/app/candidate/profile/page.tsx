'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface Experience {
  _id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
}

interface Education {
  _id?: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  grade: string;
}

interface Portfolio {
  website?: string;
  linkedin?: string;
  github?: string;
  other?: string;
}

interface Profile {
  _id: string;
  summary?: string;
  skills?: string[];
  resumeURL?: string;
  experience?: Experience[];
  education?: Education[];
  portfolio?: Portfolio;
}

export default function CandidateProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  // Editing States
  const [savingField, setSavingField] = useState('');
  
  // Summary State
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');

  // Skills State
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Portfolio State
  const [isEditingPortfolio, setIsEditingPortfolio] = useState(false);
  const [editedPortfolio, setEditedPortfolio] = useState<Portfolio>({});

  // Experience State
  const [showExpModal, setShowExpModal] = useState(false);
  const [currentExp, setCurrentExp] = useState<Experience | null>(null);

  // Education State
  const [showEduModal, setShowEduModal] = useState(false);
  const [currentEdu, setCurrentEdu] = useState<Education | null>(null);

  // File Upload State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [resumeUploadMsg, setResumeUploadMsg] = useState('');
  const [resumeError, setResumeError] = useState('');
  const resumeRef = useRef<HTMLInputElement>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile/me');
      setProfile(res.data.data);
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  // --- API Update Helper ---
  const updateProfile = async (fieldTitle: string, data: Partial<Profile>) => {
    try {
      setSavingField(fieldTitle);
      const res = await api.put('/profile/me', data);
      setProfile(res.data.data);
      return true;
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to save ${fieldTitle}`);
      return false;
    } finally {
      setSavingField('');
    }
  };

  // --- Summary ---
  const saveSummary = async () => {
    const success = await updateProfile('Summary', { summary: editedSummary });
    if (success) setIsEditingSummary(false);
  };

  // --- Skills ---
  const startEditingSkills = () => {
    setEditedSkills([...(profile?.skills || [])]);
    setIsEditingSkills(true);
  };
  const addSkill = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    const s = newSkillInput.trim();
    if (s && !editedSkills.includes(s)) {
      setEditedSkills([...editedSkills, s]);
    }
    setNewSkillInput('');
  };
  const removeSkill = (skill: string) => {
    setEditedSkills(editedSkills.filter(s => s !== skill));
  };
  const saveSkills = async () => {
    const success = await updateProfile('Skills', { skills: editedSkills });
    if (success) setIsEditingSkills(false);
  };

  // --- Portfolio ---
  const savePortfolio = async () => {
    const success = await updateProfile('Portfolio', { portfolio: editedPortfolio });
    if (success) setIsEditingPortfolio(false);
  };

  // --- Experience Form ---
  const handleExpSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExp) return;
    
    // Copy current experiences
    const exps = [...(profile?.experience || [])];
    
    if (currentExp._id) {
      const idx = exps.findIndex(x => x._id === currentExp._id);
      if (idx !== -1) exps[idx] = currentExp;
    } else {
      exps.push(currentExp);
    }

    const success = await updateProfile('Experience', { experience: exps });
    if (success) setShowExpModal(false);
  };

  const deleteExp = async (id: string) => {
    if(!confirm("Delete this experience?")) return;
    const exps = profile?.experience?.filter(x => x._id !== id) || [];
    await updateProfile('Experience', { experience: exps });
  };

  // --- Education Form ---
  const handleEduSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEdu) return;
    
    const edus = [...(profile?.education || [])];
    if (currentEdu._id) {
      const idx = edus.findIndex(x => x._id === currentEdu._id);
      if (idx !== -1) edus[idx] = currentEdu;
    } else {
      edus.push(currentEdu);
    }

    const success = await updateProfile('Education', { education: edus });
    if (success) setShowEduModal(false);
  };

  const deleteEdu = async (id: string) => {
    if(!confirm("Delete this education?")) return;
    const edus = profile?.education?.filter(x => x._id !== id) || [];
    await updateProfile('Education', { education: edus });
  };

  // --- Avatar & Resume Uploads ---
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert('File up to 5MB allowed');
    
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await api.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      await refreshUser();
    } catch (err) {
      alert('Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
      if (avatarRef.current) avatarRef.current.value = '';
    }
  };

  const handleResumeSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingResume(true);
    setResumeError('');
    setResumeUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      await api.post('/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      setResumeUploadMsg('Resume uploaded successfully!');
      fetchProfile();
    } catch (err: any) {
      setResumeError(err.response?.data?.message || 'Resume upload failed');
    } finally {
      setUploadingResume(false);
      if (resumeRef.current) resumeRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return;
    setDeletingResume(true);
    try {
      await api.delete('/profile/resume');
      setResumeUploadMsg('Resume deleted.');
      fetchProfile();
    } catch (err) {
      setResumeError('Failed to delete resume.');
    } finally {
      setDeletingResume(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['candidate']}>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-bg-soft">
          <p className="text-muted font-bold animate-pulse">Loading Profile...</p>
        </div>
      </ProtectedRoute>
    );
  }

  const getFullUrl = (url: string) => url.startsWith('http') ? url : `${API_BASE}${url}`;

  return (
    <ProtectedRoute allowedRoles={['candidate']}>
      <div className="min-h-screen bg-bg-soft pb-20">
        <Navbar />

        {/* ─── Top Banner ─── */}
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div 
                className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-black shrink-0 relative group cursor-pointer shadow-lg border-4 border-white"
                onClick={() => avatarRef.current?.click()}
              >
                <input type="file" ref={avatarRef} accept=".jpg,.jpeg,.png,.svg" className="hidden" onChange={handleAvatarSelect} />
                {user?.profilePicture ? (
                  <img src={getFullUrl(user.profilePicture)} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase() || '?'}</span>
                )}
                <div className={`absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center transition-opacity ${uploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {uploadingAvatar ? (
                    <span className="text-white text-xs">Uploading...</span>
                  ) : (
                    <span className="text-white text-xs font-bold">Edit Photo</span>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-black text-secondary">{user?.name}</h1>
                <p className="text-muted text-lg mt-1">{user?.email}</p>
                {user?.phone && <p className="text-muted text-sm mt-1">{user.phone}</p>}
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                    Candidate Profile
                  </span>
                  {profile?.portfolio?.linkedin && (
                    <a href={profile.portfolio.linkedin} target="_blank" className="px-3 py-1 bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20 text-xs font-bold rounded-full transition-colors flex items-center gap-1">
                      LinkedIn
                    </a>
                  )}
                  {profile?.portfolio?.github && (
                    <a href={profile.portfolio.github} target="_blank" className="px-3 py-1 bg-gray-200 text-gray-800 hover:bg-gray-300 text-xs font-bold rounded-full transition-colors flex items-center gap-1">
                      GitHub
                    </a>
                  )}
                  {profile?.portfolio?.website && (
                    <a href={profile.portfolio.website} target="_blank" className="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs font-bold rounded-full transition-colors flex items-center gap-1">
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Content ─── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Main Info) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ─── Summary ─── */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-secondary">About</h2>
                {!isEditingSummary && (
                  <button onClick={() => { setEditedSummary(profile?.summary || ''); setIsEditingSummary(true); }} className="text-primary hover:bg-primary/10 p-2 rounded-lg text-sm font-semibold transition-colors">
                    Edit
                  </button>
                )}
              </div>
              
              {isEditingSummary ? (
                <div className="space-y-4">
                  <textarea
                    value={editedSummary}
                    onChange={(e) => setEditedSummary(e.target.value)}
                    placeholder="Write a brief professional summary to highlight your expertise..."
                    className="w-full h-32 p-4 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-secondary"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setIsEditingSummary(false)} className="px-4 py-2 border border-border text-secondary font-semibold hover:bg-gray-50 rounded-lg">Cancel</button>
                    <button onClick={saveSummary} disabled={savingField === 'Summary'} className="px-4 py-2 bg-primary text-white font-semibold hover:bg-primary-hover rounded-lg">
                      {savingField === 'Summary' ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-secondary whitespace-pre-wrap leading-relaxed">
                  {profile?.summary || <span className="text-muted italic">No professional summary provided. Add one to stand out to employers!</span>}
                </p>
              )}
            </div>

            {/* ─── Experience ─── */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-secondary">Experience</h2>
                <button 
                  onClick={() => { setCurrentExp({ title: '', company: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' }); setShowExpModal(true); }}
                  className="text-primary hover:bg-primary/10 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                >
                  <span>+ Add Experience</span>
                </button>
              </div>

              {profile?.experience && profile.experience.length > 0 ? (
                <div className="space-y-8">
                  {profile.experience.map((exp) => (
                    <div key={exp._id} className="relative group pl-6 border-l-2 border-gray-100 pb-2 last:pb-0">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 border-4 border-white shadow-sm"></div>
                      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button onClick={() => { setCurrentExp(exp); setShowExpModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => deleteExp(exp._id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                      <h3 className="font-bold text-secondary text-lg">{exp.title}</h3>
                      <p className="text-primary font-medium">{exp.company} <span className="text-muted font-normal">• {exp.location}</span></p>
                      <p className="text-xs text-muted mt-1 uppercase tracking-wider font-semibold">
                        {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year:'numeric'})} - {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year:'numeric'}) : ''}
                      </p>
                      {exp.description && <p className="mt-3 text-secondary text-sm leading-relaxed whitespace-pre-wrap">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-muted text-sm">No experience added yet.</p>
                </div>
              )}
            </div>

            {/* ─── Education ─── */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-secondary">Education</h2>
                <button 
                  onClick={() => { setCurrentEdu({ degree: '', institution: '', fieldOfStudy: '', startDate: '', endDate: '', grade: '' }); setShowEduModal(true); }}
                  className="text-primary hover:bg-primary/10 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                >
                  <span>+ Add Education</span>
                </button>
              </div>

              {profile?.education && profile.education.length > 0 ? (
                <div className="space-y-6">
                  {profile.education.map((edu) => (
                    <div key={edu._id} className="relative group p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button onClick={() => { setCurrentEdu(edu); setShowEduModal(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                        <button onClick={() => deleteEdu(edu._id!)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                      <h3 className="font-bold text-secondary text-lg">{edu.institution}</h3>
                      <p className="text-secondary">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                      <div className="flex gap-4 mt-2">
                        <p className="text-xs text-muted uppercase tracking-wider font-semibold">
                          {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                        </p>
                        {edu.grade && <p className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">Grade: {edu.grade}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-muted text-sm">No education added yet.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (Sidebar setup) */}
          <div className="space-y-8">
            
            {/* ─── Skills ─── */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-secondary">Skills</h2>
                {!isEditingSkills && (
                  <button onClick={startEditingSkills} className="text-primary hover:bg-primary/10 p-2 rounded-lg text-sm font-semibold transition-colors">
                    Edit
                  </button>
                )}
              </div>

              {isEditingSkills ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {editedSkills.map(s => (
                      <span key={s} className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full flex items-center gap-1">
                        {s} <button onClick={() => removeSkill(s)} className="hover:text-red-300 ml-1">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newSkillInput} 
                      onChange={e => setNewSkillInput(e.target.value)} 
                      onKeyDown={addSkill}
                      placeholder="Type a skill & hit Enter" 
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary outline-none"
                    />
                    <button onClick={() => addSkill()} className="bg-gray-100 text-secondary px-3 rounded-lg text-sm font-bold hover:bg-gray-200">Add</button>
                  </div>
                  <div className="flex gap-2 justify-end mt-4">
                    <button onClick={() => setIsEditingSkills(false)} className="px-3 py-1.5 border border-border text-xs text-secondary font-semibold hover:bg-gray-50 rounded-lg">Cancel</button>
                    <button onClick={saveSkills} disabled={savingField === 'Skills'} className="px-3 py-1.5 bg-primary text-white text-xs font-semibold hover:bg-primary-hover rounded-lg">Save</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile?.skills && profile.skills.length > 0 ? profile.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-primary text-sm font-semibold rounded-full border border-blue-100">
                      {skill}
                    </span>
                  )) : (
                    <p className="text-muted text-sm italic w-full text-center py-4">No skills added.</p>
                  )}
                </div>
              )}
            </div>

            {/* ─── Portfolio/Links ─── */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-secondary">Websites & Social</h2>
                {!isEditingPortfolio && (
                  <button onClick={() => { setEditedPortfolio(profile?.portfolio || {}); setIsEditingPortfolio(true); }} className="text-primary hover:bg-primary/10 p-2 rounded-lg text-sm font-semibold transition-colors">
                    Edit
                  </button>
                )}
              </div>

              {isEditingPortfolio ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-wider">LinkedIn</label>
                    <input type="url" value={editedPortfolio.linkedin || ''} onChange={e => setEditedPortfolio({...editedPortfolio, linkedin: e.target.value})} className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1" placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-wider">GitHub</label>
                    <input type="url" value={editedPortfolio.github || ''} onChange={e => setEditedPortfolio({...editedPortfolio, github: e.target.value})} className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1" placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted uppercase tracking-wider">Personal Website</label>
                    <input type="url" value={editedPortfolio.website || ''} onChange={e => setEditedPortfolio({...editedPortfolio, website: e.target.value})} className="w-full text-sm border border-border rounded-lg px-3 py-2 mt-1" placeholder="https://..." />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setIsEditingPortfolio(false)} className="px-3 py-1.5 border border-border text-xs text-secondary font-semibold hover:bg-gray-50 rounded-lg">Cancel</button>
                    <button onClick={savePortfolio} disabled={savingField === 'Portfolio'} className="px-3 py-1.5 bg-primary text-white text-xs font-semibold hover:bg-primary-hover rounded-lg">Save</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {!profile?.portfolio?.linkedin && !profile?.portfolio?.github && !profile?.portfolio?.website && (
                    <p className="text-muted text-sm italic w-full text-center py-4">No links added.</p>
                  )}
                  {profile?.portfolio?.linkedin && (
                    <a href={profile.portfolio.linkedin} target="_blank" className="flex items-center gap-3 text-secondary hover:text-[#0077b5] group transition-colors">
                      <div className="w-8 h-8 rounded bg-[#0077b5]/10 flex items-center justify-center group-hover:bg-[#0077b5]/20 font-bold text-[#0077b5]">in</div>
                      <span className="text-sm font-medium truncate">{profile.portfolio.linkedin.replace(/https?:\/\/(www\.)?/, '')}</span>
                    </a>
                  )}
                  {profile?.portfolio?.github && (
                    <a href={profile.portfolio.github} target="_blank" className="flex items-center gap-3 text-secondary hover:text-gray-800 group transition-colors">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 font-bold text-gray-800">GH</div>
                      <span className="text-sm font-medium truncate">{profile.portfolio.github.replace(/https?:\/\/(www\.)?/, '')}</span>
                    </a>
                  )}
                  {profile?.portfolio?.website && (
                    <a href={profile.portfolio.website} target="_blank" className="flex items-center gap-3 text-secondary hover:text-purple-600 group transition-colors">
                      <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 font-bold text-purple-700">W</div>
                      <span className="text-sm font-medium truncate">{profile.portfolio.website.replace(/https?:\/\/(www\.)?/, '')}</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* ─── Resume ─── */}
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <h2 className="text-lg font-bold text-secondary mb-4">Resume Document</h2>
              
              {profile?.resumeURL ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center font-black text-green-700 text-xs">
                      {profile.resumeURL.split('.').pop()?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-secondary text-sm">Resume Uploaded</p>
                      <a href={getFullUrl(profile.resumeURL)} target="_blank" className="text-xs text-primary font-bold hover:underline">View File &rarr;</a>
                    </div>
                  </div>
                  <button onClick={handleDeleteResume} disabled={deletingResume} className="w-full py-2 text-red-600 bg-white border border-red-200 hover:bg-red-50 text-sm font-bold rounded-lg transition-colors">
                    {deletingResume ? 'Deleting...' : 'Delete Resume'}
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary hover:bg-blue-50/50 transition-colors cursor-pointer" onClick={() => resumeRef.current?.click()}>
                  <input type="file" ref={resumeRef} accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeSelect} />
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 text-primary font-bold text-xl">+</div>
                  <p className="font-semibold text-secondary text-sm">Upload Resume</p>
                  <p className="text-xs text-muted mt-1">PDF or Word</p>
                </div>
              )}
              {resumeUploadMsg && <p className="text-green-600 text-xs mt-3 font-semibold">{resumeUploadMsg}</p>}
              {resumeError && <p className="text-red-600 text-xs mt-3 font-semibold">{resumeError}</p>}
              {uploadingResume && <p className="text-primary text-xs mt-3 font-semibold animate-pulse">Uploading...</p>}
            </div>

          </div>
        </div>

      </div>

      {/* ─── Experience Modal Overlay ─── */}
      {showExpModal && currentExp && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-secondary">{currentExp._id ? 'Edit Experience' : 'Add Experience'}</h3>
              <button onClick={() => setShowExpModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleExpSave} className="p-6 overflow-y-auto space-y-4">
              <div><label className="block text-sm font-bold text-secondary mb-1">Job Title *</label><input required value={currentExp.title} onChange={e=>setCurrentExp({...currentExp, title: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              <div><label className="block text-sm font-bold text-secondary mb-1">Company *</label><input required value={currentExp.company} onChange={e=>setCurrentExp({...currentExp, company: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              <div><label className="block text-sm font-bold text-secondary mb-1">Location</label><input value={currentExp.location} onChange={e=>setCurrentExp({...currentExp, location: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              
              <div className="flex gap-4">
                <div className="flex-1"><label className="block text-sm font-bold text-secondary mb-1">Start Date *</label><input type="date" required value={currentExp.startDate ? new Date(currentExp.startDate).toISOString().split('T')[0] : ''} onChange={e=>setCurrentExp({...currentExp, startDate: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm" /></div>
                <div className="flex-1"><label className="block text-sm font-bold text-secondary mb-1">End Date</label><input type="date" disabled={currentExp.isCurrent} value={currentExp.endDate ? new Date(currentExp.endDate).toISOString().split('T')[0] : ''} onChange={e=>setCurrentExp({...currentExp, endDate: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm disabled:bg-gray-100" /></div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isCurrent" checked={currentExp.isCurrent} onChange={e=>setCurrentExp({...currentExp, isCurrent: e.target.checked, endDate: e.target.checked ? null : currentExp.endDate})} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                <label htmlFor="isCurrent" className="text-sm font-semibold text-secondary cursor-pointer">I currently work here</label>
              </div>

              <div><label className="block text-sm font-bold text-secondary mb-1">Description</label><textarea value={currentExp.description} onChange={e=>setCurrentExp({...currentExp, description: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px] resize-none" placeholder="Describe your responsibilities and achievements..." /></div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowExpModal(false)} className="px-5 py-2.5 rounded-lg border font-bold text-secondary hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={savingField === 'Experience'} className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover disabled:opacity-70">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Education Modal Overlay ─── */}
      {showEduModal && currentEdu && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-secondary">{currentEdu._id ? 'Edit Education' : 'Add Education'}</h3>
              <button onClick={() => setShowEduModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleEduSave} className="p-6 overflow-y-auto space-y-4">
              <div><label className="block text-sm font-bold text-secondary mb-1">School / Institution *</label><input required value={currentEdu.institution} onChange={e=>setCurrentEdu({...currentEdu, institution: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              <div><label className="block text-sm font-bold text-secondary mb-1">Degree *</label><input required value={currentEdu.degree} onChange={e=>setCurrentEdu({...currentEdu, degree: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Bachelor's, Master's" /></div>
              <div><label className="block text-sm font-bold text-secondary mb-1">Field of Study</label><input value={currentEdu.fieldOfStudy} onChange={e=>setCurrentEdu({...currentEdu, fieldOfStudy: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Computer Science" /></div>
              
              <div className="flex gap-4">
                <div className="flex-1"><label className="block text-sm font-bold text-secondary mb-1">Start Date *</label><input type="date" required value={currentEdu.startDate ? new Date(currentEdu.startDate).toISOString().split('T')[0] : ''} onChange={e=>setCurrentEdu({...currentEdu, startDate: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm" /></div>
                <div className="flex-1"><label className="block text-sm font-bold text-secondary mb-1">End Date (or expected)</label><input type="date" value={currentEdu.endDate ? new Date(currentEdu.endDate).toISOString().split('T')[0] : ''} onChange={e=>setCurrentEdu({...currentEdu, endDate: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm" /></div>
              </div>

              <div><label className="block text-sm font-bold text-secondary mb-1">Grade / GPA</label><input value={currentEdu.grade} onChange={e=>setCurrentEdu({...currentEdu, grade: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" /></div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowEduModal(false)} className="px-5 py-2.5 rounded-lg border font-bold text-secondary hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={savingField === 'Education'} className="px-5 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-hover disabled:opacity-70">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </ProtectedRoute>
  );
}
