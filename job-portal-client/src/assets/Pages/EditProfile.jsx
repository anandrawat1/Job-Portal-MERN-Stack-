import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, updateProfile } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import app from '../../firebase/firebase.config';
import { FiUser, FiMail, FiPhone, FiLinkedin, FiFileText, FiSave, FiArrowLeft, FiBriefcase } from 'react-icons/fi';
import Swal from 'sweetalert2';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const EditProfile = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const auth = getAuth(app);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    displayName: '',
    phone: '',
    headline: '',
    bio: '',
    linkedinUrl: '',
    resumeLink: '',
  });

  // Pre-fill from Firebase + DB profile on load
  useEffect(() => {
    setForm({
      displayName: userProfile?.displayName || user?.displayName || '',
      phone: userProfile?.phone || '',
      headline: userProfile?.headline || '',
      bio: userProfile?.bio || '',
      linkedinUrl: userProfile?.linkedinUrl || '',
      resumeLink: userProfile?.resumeLink || '',
    });
  }, [user, userProfile]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) return;
    setIsSaving(true);

    try {
      // 1. Update Firebase display name
      if (form.displayName && form.displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName: form.displayName });
      }

      // 2. Save full profile to MongoDB
      await fetch(`${API_BASE_URL}/user-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          photoURL: user.photoURL,
          ...form,
        }),
      });

      refreshProfile();
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your changes have been saved.',
        confirmButtonColor: '#3575E2',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not save your profile. Please try again.', confirmButtonColor: '#3575E2' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">You must be logged in to edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3575E2 100%)' }} className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <FiArrowLeft /> Back
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          <p className="text-blue-200 text-sm mt-1">Keep your profile up-to-date to get noticed by top companies</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left: Avatar Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center sticky top-6">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" referrerPolicy="no-referrer" className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-blue-50 mb-4"/>
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <FiUser className="w-10 h-10 text-blue-600"/>
                </div>
              )}
              <p className="font-bold text-gray-900">{form.displayName || user.displayName || 'Your Name'}</p>
              <p className="text-sm text-gray-500 mt-1">{form.headline || 'Your Headline'}</p>
              <p className="text-xs text-gray-400 mt-2 break-all">{user.email}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 text-left space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FiMail className="text-gray-400" /> {user.email}
                </div>
                {form.phone && <div className="flex items-center gap-2 text-xs text-gray-500"><FiPhone className="text-gray-400" /> {form.phone}</div>}
                {form.linkedinUrl && <a href={form.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-600"><FiLinkedin /> LinkedIn</a>}
              </div>
            </div>
          </div>

          {/* Right: Edit Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <FiUser className="text-blue-600"/> Personal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                    <input name="displayName" value={form.displayName} onChange={handleChange}
                      placeholder="John Doe" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+91 98765 43210" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                  </div>
                </div>
              </div>

              {/* Professional Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <FiBriefcase className="text-blue-600"/> Professional Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Professional Headline</label>
                    <input name="headline" value={form.headline} onChange={handleChange}
                      placeholder="e.g. Senior Frontend Engineer at Acme" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio / About</label>
                    <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
                      placeholder="Tell companies a little about yourself..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"/>
                  </div>
                </div>
              </div>

              {/* Links Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <FiFileText className="text-blue-600"/> Links
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">LinkedIn URL</label>
                    <input name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} type="url"
                      placeholder="https://linkedin.com/in/yourprofile" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Resume / Portfolio Link</label>
                    <input name="resumeLink" value={form.resumeLink} onChange={handleChange} type="url"
                      placeholder="https://drive.google.com/..." className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#3575E2] hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70">
                {isSaving ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Saving...</>
                ) : (
                  <><FiSave /> Save Changes</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
