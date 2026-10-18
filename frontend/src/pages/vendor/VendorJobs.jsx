import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  Briefcase, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  MapPin, 
  Users, 
  Calendar, 
  Tag, 
  Filter,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

const VendorJobs = ({ onJobsUpdated, onSelectJobForApplications }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    location: '',
    openings: 1,
    closingDate: '',
    status: 'OPEN'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error('Failed to load jobs', err);
      setErrorMsg('Failed to load job openings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      description: '',
      requiredSkills: '',
      location: 'Austin, TX (Hybrid)',
      openings: 1,
      closingDate: '',
      status: 'OPEN'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      description: job.description || '',
      requiredSkills: job.requiredSkills || '',
      location: job.location || '',
      openings: job.openings || 1,
      closingDate: job.closingDate || '',
      status: job.status || 'OPEN'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        requiredSkills: formData.requiredSkills.trim(),
        location: formData.location.trim(),
        openings: parseInt(formData.openings, 10) || 1,
        closingDate: formData.closingDate || null,
        status: formData.status
      };

      if (editingJob) {
        await api.put(`/vendor/jobs/${editingJob.id}`, payload);
        setSuccessMsg(`Job opening "${formData.title}" updated successfully.`);
      } else {
        await api.post('/vendor/jobs', payload);
        setSuccessMsg(`Job opening "${formData.title}" posted successfully.`);
      }

      setIsModalOpen(false);
      fetchJobs();
      if (onJobsUpdated) onJobsUpdated();
    } catch (err) {
      console.error('Failed to save job opening', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save job opening.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/vendor/jobs/${deletingId}`);
      setSuccessMsg('Job opening deleted successfully.');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchJobs();
      if (onJobsUpdated) onJobsUpdated();
    } catch (err) {
      console.error('Failed to delete job opening', err);
      setErrorMsg('Failed to delete job opening.');
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await api.put(`/vendor/jobs/${job.id}`, {
        ...job,
        status: newStatus
      });
      setSuccessMsg(`Job "${job.title}" status changed to ${newStatus}.`);
      fetchJobs();
      if (onJobsUpdated) onJobsUpdated();
    } catch (err) {
      console.error('Failed to change status', err);
      setErrorMsg('Failed to update job status.');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Job Openings & Talent Recruitment</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            Publish positions to hire skilled talent, technicians, and managers for your commercial operations.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleOpenCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          <span>Post New Job Opening</span>
        </button>
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

      {/* Filter */}
      <div className="filter-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem' }}>
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search jobs by title, skills, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--gray-500)' }} />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Jobs</option>
              <option value="OPEN">OPEN (Visible to applicants)</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
          <Loader2 size={32} className="spinner-icon" style={{ margin: '0 auto 1rem' }} />
          <p>Loading job postings...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Briefcase size={48} style={{ color: 'var(--gray-400)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
            No Job Openings Found
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'No job postings match your filter.'
              : 'You have not created any job openings yet. Click below to create your first recruitment listing.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreateModal}>
            <Plus size={14} style={{ marginRight: '0.3rem' }} /> Post Job Opening
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Location</th>
                <th>Openings</th>
                <th>Required Skills</th>
                <th>Closing Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{job.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {job.description || 'No description provided'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                      <MapPin size={13} style={{ color: 'var(--gray-400)' }} />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      <Users size={13} style={{ color: 'var(--gray-400)' }} />
                      <span>{job.openings || 1}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '240px' }}>
                      {job.requiredSkills ? (
                        job.requiredSkills.split(',').map((skill, idx) => (
                          <span key={idx} className="badge badge-secondary" style={{ fontSize: '0.725rem' }}>
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>None specified</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.825rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} />
                      <span>{job.closingDate || 'Ongoing'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${job.status === 'OPEN' ? 'badge-success' : 'badge-danger'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleToggleStatus(job)}
                        title={job.status === 'OPEN' ? 'Close Job' : 'Reopen Job'}
                        style={{ padding: '0.35rem 0.55rem' }}
                      >
                        {job.status === 'OPEN' ? <XCircle size={14} style={{ color: '#d97706' }} /> : <CheckCircle size={14} style={{ color: '#059669' }} />}
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenEditModal(job)}
                        title="Edit Job"
                        style={{ padding: '0.35rem 0.55rem' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setDeletingId(job.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        title="Delete Job"
                        style={{ padding: '0.35rem 0.55rem', color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        <Trash2 size={14} />
                      </button>
                      {onSelectJobForApplications && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onSelectJobForApplications(job.id)}
                          title="View Applicants"
                          style={{ padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={13} />
                          <span>Applicants</span>
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJob ? 'Edit Job Opening' : 'Post New Job Opening'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Job Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleFormChange}
              required
              placeholder="e.g. Senior Solar Power Engineer & Commissioning Lead"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Job Location</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleFormChange}
                placeholder="e.g. Austin, TX / Remote"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Number of Openings</label>
              <input
                type="number"
                min="1"
                name="openings"
                className="form-control"
                value={formData.openings}
                onChange={handleFormChange}
                placeholder="1"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Closing Date</label>
              <input
                type="date"
                name="closingDate"
                className="form-control"
                value={formData.closingDate}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="OPEN">OPEN (Accepting Applications)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Required Skills (comma-separated)</label>
            <input
              type="text"
              name="requiredSkills"
              className="form-control"
              value={formData.requiredSkills}
              onChange={handleFormChange}
              placeholder="e.g. Electrical Engineering, Inverter Calibration, Battery Storage, NABCEP"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Role Description & Responsibilities</label>
            <textarea
              name="description"
              className="form-control"
              rows={4}
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Describe day-to-day responsibilities, experience qualifications, compensation perks, and company mission..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '120px', justifyContent: 'center' }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spinner-icon" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingJob ? 'Update Job' : 'Publish Job'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Job Opening"
        message="Are you sure you want to delete this job opening? Existing applicant records associated with this job may also be affected."
        confirmText="Delete Job"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
        }}
      />
    </div>
  );
};

export default VendorJobs;
