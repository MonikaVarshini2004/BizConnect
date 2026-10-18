import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { 
  MessageSquare, 
  Search, 
  Eye, 
  Loader2, 
  AlertCircle,
  User,
  Building,
  Lightbulb,
  Calendar,
  Clock
} from 'lucide-react';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState(null);

  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/inquiries');
      setInquiries(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load inquiries: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch = 
      inq.subject?.toLowerCase().includes(search.toLowerCase()) ||
      inq.userName?.toLowerCase().includes(search.toLowerCase()) ||
      inq.vendorCompanyName?.toLowerCase().includes(search.toLowerCase()) ||
      inq.businessIdeaName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESPONDED':
        return <span className="badge badge-active">Responded</span>;
      case 'PENDING':
        return <span className="badge badge-pending">Pending</span>;
      case 'CLOSED':
        return <span className="badge badge-inactive">Closed</span>;
      case 'CANCELLED':
        return <span className="badge badge-blocked">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <MessageSquare size={22} style={{ color: '#6366f1' }} />
          Platform Inquiries Monitor
        </h2>
        <button className="btn btn-outline btn-sm" onClick={fetchInquiries} disabled={loading}>
          Refresh
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <AlertCircle size={18} />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search inquiries by user, vendor, idea or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="RESPONDED">RESPONDED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={32} />
          <span>Loading inquiries...</span>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={48} className="empty-state-icon" />
          <h3>No inquiries recorded</h3>
          <p>User-to-vendor marketplace inquiries will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Inquiry ID</th>
                <th>Sender (User)</th>
                <th>Recipient (Vendor / Idea)</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inq) => (
                <tr key={inq.id}>
                  <td><strong>#{inq.id}</strong></td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                      <User size={13} style={{ color: 'var(--gray-500)' }} />
                      {inq.userName || 'Unknown User'}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      {inq.vendorCompanyName ? (
                        <>
                          <Building size={13} style={{ color: '#8b5cf6' }} />
                          <strong>{inq.vendorCompanyName}</strong>
                        </>
                      ) : inq.businessIdeaName ? (
                        <>
                          <Lightbulb size={13} style={{ color: '#10b981' }} />
                          <span>{inq.businessIdeaName}</span>
                        </>
                      ) : (
                        'Platform'
                      )}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {inq.subject}
                    </div>
                  </td>
                  <td>{getStatusBadge(inq.status)}</td>
                  <td>{new Date(inq.createdAt).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedInquiry(inq)}
                        title="View Conversation"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Conversation Modal */}
      <Modal
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title={selectedInquiry ? `Inquiry #${selectedInquiry.id} – ${selectedInquiry.subject}` : 'Inquiry'}
      >
        {selectedInquiry && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Sender</div>
                <div className="detail-value">{selectedInquiry.userName} ({selectedInquiry.userEmail})</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Recipient</div>
                <div className="detail-value">{selectedInquiry.vendorCompanyName || selectedInquiry.businessIdeaName || 'Platform'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value">{getStatusBadge(selectedInquiry.status)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Submitted Date</div>
                <div className="detail-value">{new Date(selectedInquiry.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
              <div className="detail-label" style={{ marginBottom: '0.4rem' }}>Initial Inquiry Message</div>
              <p style={{ color: 'var(--gray-800)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                {selectedInquiry.message}
              </p>
            </div>

            {selectedInquiry.responseMessage ? (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius)', border: '1px solid #a7f3d0' }}>
                <div className="detail-label" style={{ color: '#047857', marginBottom: '0.4rem' }}>
                  Vendor Response (at {new Date(selectedInquiry.respondedAt).toLocaleString()})
                </div>
                <p style={{ color: '#065f46', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                  {selectedInquiry.responseMessage}
                </p>
              </div>
            ) : (
              <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#fffbeb', borderRadius: 'var(--radius)', border: '1px solid #fde68a', color: '#b45309', fontSize: '0.85rem' }}>
                No vendor response has been recorded yet.
              </div>
            )}

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedInquiry(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminInquiries;
