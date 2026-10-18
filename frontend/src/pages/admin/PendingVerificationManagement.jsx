import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  Clock, 
  Search, 
  Eye, 
  CheckCheck, 
  XCircle, 
  FileEdit, 
  Loader2, 
  AlertCircle,
  Building,
  FileText,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

const PendingVerificationManagement = ({ onVerificationDone }) => {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState(null);

  // Review Application Modal
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Action Dialogs (APPROVE, REJECT, REQUEST_CHANGES)
  const [activeAction, setActiveAction] = useState(null); // { type: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES', vendor }
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/vendors/pending');
      setPendingVendors(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load pending queue: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (vendor) => {
    setSelectedVendor(vendor);
    setIsReviewOpen(true);
  };

  const handleExecuteAction = async (notes) => {
    if (!activeAction) return;
    setActionLoading(true);
    try {
      const { type, vendor } = activeAction;
      let endpoint = '';
      let body = {};

      if (type === 'APPROVE') {
        endpoint = `/admin/vendors/${vendor.id}/approve`;
        body = { notes };
      } else if (type === 'REJECT') {
        endpoint = `/admin/vendors/${vendor.id}/reject`;
        body = { reason: notes };
      } else if (type === 'REQUEST_CHANGES') {
        endpoint = `/admin/vendors/${vendor.id}/request-changes`;
        body = { notes };
      }

      await api.put(endpoint, body);
      setAlert({ 
        type: 'success', 
        message: `Action "${type}" processed successfully for ${vendor.companyName}.` 
      });

      setActiveAction(null);
      setIsReviewOpen(false);
      fetchPending();
      if (onVerificationDone) onVerificationDone();
    } catch (err) {
      setAlert({ type: 'error', message: 'Action failed: ' + (err.response?.data?.message || err.message) });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPending = pendingVendors.filter((v) => {
    return (
      v.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Clock size={22} style={{ color: '#f59e0b' }} />
          Vendor Verification Queue ({pendingVendors.length})
        </h2>
        <button className="btn btn-outline btn-sm" onClick={fetchPending} disabled={loading}>
          Refresh Queue
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <AlertCircle size={18} />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search pending applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={32} />
          <span>Loading pending verification queue...</span>
        </div>
      ) : filteredPending.length === 0 ? (
        <div className="empty-state">
          <Clock size={48} className="empty-state-icon" style={{ color: '#10b981' }} />
          <h3>All caught up!</h3>
          <p>There are currently no vendor verification requests awaiting review.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPending.map((v) => (
                <tr key={v.id}>
                  <td><strong>#{v.id}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{v.companyName}</div>
                  </td>
                  <td>{v.contactPerson}</td>
                  <td>{v.email}</td>
                  <td>
                    <span className="badge badge-pending">{v.verificationStatus}</span>
                  </td>
                  <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenReview(v)}
                        title="Review Application"
                      >
                        <Eye size={14} />
                        <span>Review</span>
                      </button>

                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => setActiveAction({ type: 'APPROVE', vendor: v })}
                        title="Approve Application"
                      >
                        <CheckCheck size={14} />
                        <span>Approve</span>
                      </button>

                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => setActiveAction({ type: 'REQUEST_CHANGES', vendor: v })}
                        title="Request Changes"
                      >
                        <FileEdit size={14} />
                        <span>Request Changes</span>
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setActiveAction({ type: 'REJECT', vendor: v })}
                        title="Reject Application"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Full Application Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title={selectedVendor ? `Application Review – ${selectedVendor.companyName}` : 'Application Review'}
        size="large"
      >
        {selectedVendor && (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Company Name</div>
                <div className="detail-value">{selectedVendor.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact Person</div>
                <div className="detail-value">{selectedVendor.contactPerson}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Verification Status</div>
                <div className="detail-value">
                  <span className="badge badge-pending">{selectedVendor.verificationStatus}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value" style={{ wordBreak: 'break-all' }}>{selectedVendor.email}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Phone</div>
                <div className="detail-value">{selectedVendor.phone || 'N/A'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Submitted Date</div>
                <div className="detail-value">{new Date(selectedVendor.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
              <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={14} />
                Business Description & Background
              </div>
              <p style={{ color: 'var(--gray-800)', fontSize: '0.9rem', marginTop: '0.4rem', whiteSpace: 'pre-wrap' }}>
                {selectedVendor.businessDescription || 'No detailed business description submitted.'}
              </p>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius)', border: '1px solid #bbf7d0' }}>
              <div className="detail-label" style={{ color: '#166534' }}>Verification Checklist</div>
              <ul style={{ fontSize: '0.85rem', color: '#15803d', marginTop: '0.35rem', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                <li>Confirm contact email matches registered company domain/person.</li>
                <li>Verify business description aligns with platform compliance standards.</li>
                <li>Ensure phone number and contact details are valid.</li>
              </ul>
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setActiveAction({ type: 'REJECT', vendor: selectedVendor })}
              >
                <XCircle size={15} />
                Reject
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={() => setActiveAction({ type: 'REQUEST_CHANGES', vendor: selectedVendor })}
              >
                <FileEdit size={15} />
                Request Changes
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => setActiveAction({ type: 'APPROVE', vendor: selectedVendor })}
              >
                <CheckCheck size={15} />
                Approve & Verify
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Actions Dialogs */}
      <ConfirmDialog
        isOpen={!!activeAction}
        onClose={() => setActiveAction(null)}
        onConfirm={handleExecuteAction}
        title={
          activeAction?.type === 'APPROVE'
            ? 'Approve Vendor Verification'
            : activeAction?.type === 'REJECT'
            ? 'Reject Vendor Application'
            : 'Request Changes from Vendor'
        }
        message={
          activeAction?.type === 'APPROVE'
            ? `Are you sure you want to approve and verify "${activeAction?.vendor?.companyName}"? They will gain full vendor capabilities on BizConnect.`
            : activeAction?.type === 'REJECT'
            ? `Are you sure you want to reject the application for "${activeAction?.vendor?.companyName}"? Please provide the rejection reason below.`
            : `Provide specific instructions and change requests for "${activeAction?.vendor?.companyName}". Their status will be set to UNDER_REVIEW.`
        }
        confirmText={
          activeAction?.type === 'APPROVE'
            ? 'Approve & Verify'
            : activeAction?.type === 'REJECT'
            ? 'Confirm Rejection'
            : 'Send Change Request'
        }
        confirmVariant={
          activeAction?.type === 'APPROVE'
            ? 'success'
            : activeAction?.type === 'REJECT'
            ? 'danger'
            : 'warning'
        }
        requireReason={activeAction?.type !== 'APPROVE'}
        reasonPlaceholder={
          activeAction?.type === 'REJECT'
            ? 'Reason for rejecting this application...'
            : 'Specify the required updates or missing documentation...'
        }
        loading={actionLoading}
      />
    </div>
  );
};

export default PendingVerificationManagement;
