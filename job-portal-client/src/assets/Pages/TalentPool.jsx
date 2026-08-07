import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiExternalLink, FiUser, FiMail, FiPhone, FiLinkedin, FiBriefcase } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const TalentPool = () => {
  const { user, isAdmin } = useAuth();
  const [talents, setTalents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin || !user?.email) return;
    
    setIsLoading(true);
    fetch(`${API_BASE_URL}/talent-pool?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        const talentList = Array.isArray(data) ? data : [];
        setTalents(talentList);
        setFiltered(talentList);
      })
      .catch(() => {
        setTalents([]);
        setFiltered([]);
      })
      .finally(() => setIsLoading(false));
  }, [isAdmin, user]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    if (!q.trim()) { setFiltered(talents); return; }
    
    const query = q.toLowerCase();
    setFiltered(talents.filter(t => 
      (t.displayName || '').toLowerCase().includes(query) ||
      (t.headline || '').toLowerCase().includes(query) ||
      (t.bio || '').toLowerCase().includes(query)
    ));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">You must be an admin to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3575E2 100%)' }} className="py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-1">Talent Pool</h1>
            <p className="text-blue-200 text-sm">Browse all candidates who have submitted their resumes.</p>
          </div>
          <div className="w-full md:w-96 bg-white rounded-xl flex items-center px-3 py-2 shadow-sm">
            <FiSearch className="text-gray-400 mr-2"/>
            <input 
              type="text" 
              placeholder="Search by name, headline, or skills..." 
              value={search}
              onChange={handleSearch}
              className="w-full focus:outline-none text-sm text-gray-700 bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-500 font-medium">No candidates found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((talent, idx) => (
              <div key={talent._id || idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  {talent.photoURL ? (
                    <img src={talent.photoURL} alt={talent.displayName} className="w-16 h-16 rounded-full object-cover border border-gray-100"/>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                      <FiUser className="w-8 h-8 text-blue-300"/>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{talent.displayName || 'Unknown Name'}</h3>
                    <p className="text-sm text-gray-500">{talent.headline || 'No headline provided'}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
                  {talent.bio || 'No bio provided.'}
                </p>

                <div className="space-y-2 mb-5">
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <FiMail className="text-gray-400"/> {talent.email}
                  </p>
                  {talent.phone && (
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <FiPhone className="text-gray-400"/> {talent.phone}
                    </p>
                  )}
                  {talent.linkedinUrl && (
                    <a href={talent.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-2 w-fit">
                      <FiLinkedin className="text-gray-400"/> LinkedIn Profile
                    </a>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50">
                  <a href={talent.resumeLink} target="_blank" rel="noopener noreferrer"
                     className="w-full py-2.5 bg-[#3575E2] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                    View Resume <FiExternalLink/>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentPool;
