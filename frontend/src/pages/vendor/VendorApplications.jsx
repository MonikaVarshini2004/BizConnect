import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Loader2, 
  AlertCircle, 
  Mail, 
  Briefcase, 
  Calendar, 
  FileText,
  Star,
  Check,
  X
} from 'lucide-react';

const VendorApplications = ({ selectedJobId, onApplicationsUpdated }) => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [jobFilter, setJobFilter] = useState(selectedJobId ? String(selectedJobId) : 'ALL');

  // View application details modal
  const [activeApp, setActiveApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchApplicationsAndJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      setJobFilter(String(selectedJobId));
    }
  }, [selectedJobId]);

  const fetchApplicationsAndJobs = async () => {
    setLoading(true);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/vendor/applications'),
        api.get('/vendor/jobs')
      ]);
      setApplications(appsRes.data || []);
      setJobs(jobsRes.data || []);
    } catch (err) {
      console.error('Failed to load applications', err);
      setErrorMsg('Failed to load applicant records.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, action) => {
    setActionLoadingId(appId);
    setErrorMsg('');
    try {
      let res;
      if (action === 'shortlist') {
        res = await api.put(`/vendor/applications/${appId}/shortlist`);
        setSuccessMsg('Candidate shortlisted successfully.');
      } else if (action === 'accept') {
        res = await api.put(`/vendor/applications/${appId}/accept`);
        setSuccessMsg('Application accepted.');
      } else if (action === 'reject') {
        res = await api.put(`/vendor/applications/${appId}/reject`);
        setSuccessMsg('Application rejected.');
      }

      if (res?.data) {
        setApplications(prev => prev.map(a => a.id === appId ? res.data : a));
        if (activeApp && activeApp.id === appId) {
          setActiveApp(res.data);
        }
      }

      if (onApplicationsUpdated) onApplicationsUpdated();
    } catch (err) {
      console.error(`Failed to ${action} application`, err);
      setErrorMsg(err.response?.data?.message || `Failed to ${action} candidate.`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics KPI calculations
  const totalCount = applications.length;
  const acceptedCount = applications.filter(a => a.status === 'ACCEPTED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;
  const shortlistedCount = applications.filter(a => a.status === 'SHORTLISTED').length;
  const pendingCount = applications.filter(a => a.status === 'APPLIED').length;

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm ||
      app.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationMessage?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesJob = jobFilter === 'ALL' || String(app.jobOpeningId) === jobFilter;

    return matchesSearch && matchesStatus && matchesJob;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Applicant Tracking System (ATS)</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          Evaluate candidate submissions, review cover notes, and manage hiring stages.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Total Applicants</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.2rem' }}>{totalCount}</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#b45309', textTransform: 'uppercase', fontWeight: 600 }}>Pending Review</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>{pendingCount}</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: 600 }}>Shortlisted</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', marginTop: '0.2rem' }}>{shortlistedCount}</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#047857', textTransform: 'uppercase', fontWeight: 600 }}>Accepted</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>{acceptedCount}</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#b91c1c', textTransform: 'uppercase', fontWeight: 600 }}>Rejected</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626', marginTop: '0.2rem' }}>{rejectedCount}</div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filters */}
      <div className="filter-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 180px', gap: '1rem' }}>
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search candidate name, email, job title, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={16} style={{ color: 'var(--gray-500)' }} />
            <select
              className="form-control"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
            >
              <option value="ALL">All Job Openings</option>
              {jobs.map(j => (
                <option key={j.id} value={String(j.id)}>{j.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--gray-500)' }} />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="APPLIED">APPLIED (Pending)</option>
              <option value="SHORTLISTED">SHORTLISTED</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
          <Loader2 size={32} className="spinner-icon" style={{ margin: '0 auto 1rem' }} />
          <p>Loading candidate applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Users size={48} style={{ color: 'var(--gray-400)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
            No Applications Found
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
            {searchTerm || statusFilter !== 'ALL' || jobFilter !== 'ALL'
              ? 'No applicants match your current filter settings.'
              : 'You have not received any job applications yet. Once applicants discover your open positions, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Target Position</th>
                <th>Cover Note / Pitch</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map(app => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>@{app.username || 'applicant'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Mail size={12} />
                      <span>{app.userEmail || 'Email on file'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--primary-700)', fontSize: '0.875rem' }}>
                      {app.jobTitle || 'General Position'}
                    </div>
                  </td>
                  <td>
                    <div 
                      style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--gray-700)', fontSize: '0.85rem', cursor: 'pointer' }}
                      onClick={() => {
                        setActiveApp(app);
                        setIsModalOpen(true);
                      }}
                      title="Click to view full cover note"
                    >
                      {app.applicationMessage || 'No cover note submitted'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.825rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} />
                      <span>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      app.status === 'ACCEPTED' ? 'badge-success' :
                      app.status === 'REJECTED' ? 'badge-danger' :
                      app.status === 'SHORTLISTED' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setActiveApp(app);
                          setIsModalOpen(true);
                        }}
                        title="View Application Details"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <FileText size={13} />
                      </button>

                      {app.status !== 'SHORTLISTED' && app.status !== 'ACCEPTED' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStatusChange(app.id, 'shortlist')}
                          disabled={actionLoadingId === app.id}
                          title="Shortlist Candidate"
                          style={{ padding: '0.3rem 0.5rem', color: '#2563eb', borderColor: '#bfdbfe' }}
                        >
                          <Star size={13} />
                        </button>
                      )}

                      {app.status !== 'ACCEPTED' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStatusChange(app.id, 'accept')}
                          disabled={actionLoadingId === app.id}
                          title="Accept Application"
                          style={{ padding: '0.3rem 0.5rem', color: '#059669', borderColor: '#a7f3d0' }}
                        >
                          <Check size={13} />
                        </button>
                      )}

                      {app.status !== 'REJECTED' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStatusChange(app.id, 'reject')}
                          disabled={actionLoadingId === app.id}
                          title="Reject Application"
                          style={{ padding: '0.3rem 0.5rem', color: '#dc2626', borderColor: '#fca5a5' }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Applicant Submission Details"
      >
        {activeApp && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                  @{activeApp.username || 'applicant'}
                </h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                  {activeApp.userEmail}
                </p>
              </div>
              <span className={`badge ${
                activeApp.status === 'ACCEPTED' ? 'badge-success' :
                activeApp.status === 'REJECTED' ? 'badge-danger' :
                activeApp.status === 'SHORTLISTED' ? 'badge-info' :
                'badge-warning'
              }`}>
                {activeApp.status}
              </span>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gray-500)', fontWeight: 600 }}>
                Applying for Position:
              </span>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-900)', marginTop: '0.2rem' }}>
                {activeApp.jobTitle}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gray-500)', fontWeight: 600 }}>
                Cover Letter & Pitch:
              </span>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '0.4rem', fontSize: '0.9rem', color: 'var(--gray-800)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {activeApp.applicationMessage || 'No additional statement provided.'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.3rem', textAlign: 'right' }}>
                Submitted on {activeApp.appliedAt ? new Date(activeApp.appliedAt).toLocaleString() : 'N/A'}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleStatusChange(activeApp.id, 'shortlist')}
                disabled={actionLoadingId === activeApp.id || activeApp.status === 'SHORTLISTED'}
                style={{ color: '#2563eb', borderColor: '#bfdbfe' }}
              >
                Shortlist
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleStatusChange(activeApp.id, 'reject')}
                disabled={actionLoadingId === activeApp.id || activeApp.status === 'REJECTED'}
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
              >
                Reject
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleStatusChange(activeApp.id, 'accept')}
                disabled={actionLoadingId === activeApp.id || activeApp.status === 'ACCEPTED'}
              >
                Accept Candidate
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorApplications;
