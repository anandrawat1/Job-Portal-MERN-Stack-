import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiEdit2, FiTrash2, FiPlus, FiBriefcase, FiMapPin, FiExternalLink, FiSearch, FiUsers, FiX, FiXCircle } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const MyJobs = () => {
  const { user, isAdmin } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'saved'
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State for Admin Applicants View
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);

  const fetchData = () => {
    if (!user?.email) return;
    setIsLoading(true);
    if (isAdmin) {
      fetch(`${API_BASE_URL}/myJobs/${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => { setJobs(Array.isArray(data) ? data : []); setIsLoading(false); })
        .catch(() => { setJobs([]); setIsLoading(false); });
    } else {
      fetch(`${API_BASE_URL}/my-applications/${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => { setApplications(Array.isArray(data) ? data : []); setIsLoading(false); })
        .catch(() => { setApplications([]); setIsLoading(false); });
        
      fetch(`${API_BASE_URL}/saved-jobs/${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => setSavedJobs(Array.isArray(data) ? data : []));
    }
  };

  useEffect(() => { fetchData(); }, [user, isAdmin]);

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/job/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.acknowledged) setJobs(prev => prev.filter(j => String(j._id) !== String(id)));
    } catch { alert('Failed to delete job. Please try again.'); }
  };

  const handleWithdrawOrReject = async (applicationId, isRejecting = false) => {
    const msg = isRejecting 
      ? 'Are you sure you want to reject this applicant? This cannot be undone.'
      : 'Are you sure you want to withdraw your application?';
    
    if (!window.confirm(msg)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/application/${applicationId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.acknowledged) {
        if (isAdmin) {
          setJobApplicants(prev => prev.filter(a => String(a._id) !== String(applicationId)));
        } else {
          setApplications(prev => prev.filter(a => String(a._id) !== String(applicationId)));
        }
      }
    } catch {
      alert('Failed to process request. Please try again.');
    }
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
    setIsLoadingApplicants(true);
    try {
      const res = await fetch(`${API_BASE_URL}/applications/${job._id}?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setJobApplicants(Array.isArray(data) ? data : []);
    } catch {
      setJobApplicants([]);
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const handleUpdateStatus = async (appId, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/application/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.acknowledged || data.modifiedCount > 0) {
        setJobApplicants(prev => prev.map(a => String(a._id) === String(appId) ? { ...a, ...updates } : a));
      }
    } catch (err) {
      alert('Failed to update application status.');
    }
  };

  const handleToggleJobStatus = async (job) => {
    const newStatus = job.status === 'closed' ? 'active' : 'closed';
    try {
      const res = await fetch(`${API_BASE_URL}/update-job/${job._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.acknowledged || data.modifiedCount > 0) {
        setJobs(prev => prev.map(j => String(j._id) === String(job._id) ? { ...j, status: newStatus } : j));
      }
    } catch {
      alert('Failed to change job status.');
    }
  };

  const handleToggleBadge = async (jobId, badgeField, currentValue) => {
    try {
      const res = await fetch(`${API_BASE_URL}/update-job/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [badgeField]: !currentValue }),
      });
      const data = await res.json();
      if (data.acknowledged || data.modifiedCount > 0) {
        setJobs(prev => prev.map(j => String(j._id) === String(jobId) ? { ...j, [badgeField]: !currentValue } : j));
      }
    } catch { alert('Failed to update badge.'); }
  };

  const safeItems = isAdmin ? jobs : (activeTab === 'saved' ? savedJobs : applications);
  const filtered = safeItems.filter(item => {
    const title = item.jobTitle || '';
    return title.toLowerCase().includes(searchText.toLowerCase());
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
  };

  return (
    <div className="min-h-screen relative" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3575E2 100%)' }} className="py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-1">{isAdmin ? 'My Job Postings' : 'My Applications'}</h1>
            <p className="text-blue-200 text-sm">
              {isAdmin ? 'Manage all jobs you have posted and review applicants' : 'Track all jobs you have applied to'}
            </p>
          </div>
          {isAdmin && (
            <Link to="/post-job"
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow hover:shadow-md transition-all hover:-translate-y-0.5 text-sm w-fit">
              <FiPlus className="w-4 h-4"/> Post New Job
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center gap-3">
          {!isAdmin && (
            <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
              <button 
                onClick={() => {setActiveTab('applications'); setCurrentPage(1);}}
                className={`flex-1 md:px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'applications' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >Applications</button>
              <button 
                onClick={() => {setActiveTab('saved'); setCurrentPage(1);}}
                className={`flex-1 md:px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'saved' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >Saved Jobs</button>
            </div>
          )}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
            <input
              type="text"
              placeholder={isAdmin ? "Search job titles…" : "Search applied jobs…"}
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <FiBriefcase className="w-10 h-10 text-blue-300"/>
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {isAdmin ? 'No jobs posted yet.' : 'No applications yet.'}
            </p>
            {isAdmin && (
              <Link to="/post-job" className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:underline font-medium text-sm">
                <FiPlus/> Post your first job
              </Link>
            )}
          </div>
        ) : isAdmin ? (
          /* Admin: Table View */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Badges</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicants</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {currentItems.map((job, index) => (
                    <tr key={job._id || index} className={`hover:bg-gray-50 transition-colors ${job.status === 'closed' ? 'opacity-70' : ''}`}>
                      <td className="px-6 py-4 text-sm text-gray-400">{indexOfFirst + index + 1}</td>
                      <td className="px-6 py-4">
                        <Link to={`/job/${job._id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm">
                          {job.jobTitle}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{job.companyName}</td>
                      <td className="px-6 py-4">
                        {job.status === 'closed' ? (
                           <span className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded-full font-semibold">Closed</span>
                        ) : (
                           <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-full font-semibold">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 w-max">
                          <button onClick={() => handleToggleBadge(job._id, 'featured', job.featured)} className={`text-[10px] px-2 py-1 rounded border text-left transition-colors ${job.featured ? 'bg-yellow-50 border-yellow-200 text-yellow-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>⭐ Featured</button>
                          <button onClick={() => handleToggleBadge(job._id, 'urgent', job.urgent)} className={`text-[10px] px-2 py-1 rounded border text-left transition-colors ${job.urgent ? 'bg-orange-50 border-orange-200 text-orange-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>⚡ Urgent</button>
                          <button onClick={() => handleToggleBadge(job._id, 'verified', job.verified)} className={`text-[10px] px-2 py-1 rounded border text-left transition-colors ${job.verified ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>✅ Verified</button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleViewApplicants(job)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100">
                          <FiUsers className="w-3.5 h-3.5"/> View
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleJobStatus(job)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${job.status === 'closed' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            {job.status === 'closed' ? 'Reopen' : 'Close'}
                          </button>
                          <Link to={`/edit-job/${job._id}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                            <FiEdit2 className="w-3 h-3"/> Edit
                          </Link>
                          <button onClick={() => handleDeleteJob(job._id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors">
                            <FiTrash2 className="w-3 h-3"/> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Regular User: Card View of Applications/Saved */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentItems.map((item, idx) => {
              if (activeTab === 'saved') {
                return (
                  <div key={item._id || idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <Link to={`/job/${item._id}`} className="font-semibold text-gray-900 text-base hover:text-blue-600 transition-colors">{item.jobTitle}</Link>
                        <p className="text-sm text-gray-500 mt-0.5">{item.companyName}</p>
                      </div>
                      <button onClick={async () => {
                         await fetch(`${API_BASE_URL}/saved-jobs/${item._id}?email=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
                         setSavedJobs(prev => prev.filter(j => String(j._id) !== String(item._id)));
                      }} className="text-gray-400 hover:text-red-500 p-1"><FiTrash2 className="w-4 h-4"/></button>
                    </div>
                    {item.jobLocation && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                        <FiMapPin className="w-3 h-3"/> {item.jobLocation}
                      </p>
                    )}
                    <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Posted: {formatDate(item.postingDate)}</span>
                      <Link to={`/job/${item._id}`} className="text-xs font-medium text-blue-600 hover:text-blue-700">View Job →</Link>
                    </div>
                  </div>
                )
              }
              const app = item;
              const statusColors = {
                pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                reviewing: 'bg-blue-50 text-blue-700 border-blue-100',
                shortlisted: 'bg-purple-50 text-purple-700 border-purple-100',
                hired: 'bg-green-50 text-green-700 border-green-100',
                rejected: 'bg-red-50 text-red-700 border-red-100',
              };
              const currentStatus = app.status || 'pending';
              const statusClass = statusColors[currentStatus] || statusColors.pending;

              return (
              <div key={app._id || idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-base">{app.jobTitle || 'Unknown Job'}</h3>
                    {app.companyName && (
                      <p className="text-sm text-gray-500 mt-0.5">{app.companyName}</p>
                    )}
                  </div>
                  <span className={`text-xs border px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-3 capitalize ${statusClass}`}>
                    {currentStatus}
                  </span>
                </div>
                {app.jobLocation && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                    <FiMapPin className="w-3 h-3"/> {app.jobLocation}
                  </p>
                )}
                <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDate(app.appliedAt)}</span>
                  
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleWithdrawOrReject(app._id, false)}
                      className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">
                      Withdraw
                    </button>
                    <a href={app.resumeLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                      View Resume <FiExternalLink className="w-3 h-3"/>
                    </a>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Admin Applicants Modal */}
      {showApplicantsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Applicants</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedJob?.jobTitle} • {jobApplicants.length} Total</p>
              </div>
              <button 
                onClick={() => setShowApplicantsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <FiX className="text-gray-600"/>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingApplicants ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : jobApplicants.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FiUsers className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p>No one has applied for this job yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobApplicants.map(applicant => (
                    <div key={applicant._id} className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">
                      {/* Header: Avatar + Name + Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                            {(applicant.applicantName || applicant.applicantEmail || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{applicant.applicantName}</p>
                            <p className="text-sm text-gray-500">{applicant.applicantEmail}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Applied: {formatDate(applicant.appliedAt)}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:flex-shrink-0">
                          <a href={applicant.resumeLink} target="_blank" rel="noopener noreferrer"
                             className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-blue-100 transition-colors">
                             Resume <FiExternalLink/>
                          </a>
                          <select
                            value={applicant.status || 'pending'}
                            onChange={(e) => handleUpdateStatus(applicant._id, { status: e.target.value })}
                            className="text-sm font-medium border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <button
                            onClick={() => handleWithdrawOrReject(applicant._id, true)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject applicant"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="pt-3 mt-3 border-t border-gray-100">
                        <textarea
                          placeholder="Add private notes about this candidate..."
                          defaultValue={applicant.notes || ''}
                          onBlur={(e) => {
                            if (e.target.value !== (applicant.notes || '')) {
                              handleUpdateStatus(applicant._id, { notes: e.target.value });
                            }
                          }}
                          className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                          rows="2"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Notes are auto-saved on click away. Only visible to you.</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
