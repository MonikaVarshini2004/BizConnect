import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { 
  MessageSquare, 
  Search, 
  Eye, 
  Loader2, 
  AlertCircle, 
  Building, 
  Lightbulb, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Truck
} from 'lucide-react';

const MyInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState(null);

  // Detail Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inquiries/user');
      setInquiries(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load inquiries: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailOpen(true);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inq.vendorCompanyName?.toLowerCase().includes(q) ||
      inq.businessIdeaName?.toLowerCase().includes(q) ||
      inq.message?.toLowerCase().includes(q) ||
      inq.vendorResponse?.toLowerCase().includes(q);

    const matchesStatus = !statusFilter || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESPONDED':
        return <span className="badge badge-active">Responded</span>;
      case 'PENDING':
        return <span className="badge badge-pending">Pending Response</span>;
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
          <MessageSquare size={22} style={{ color: 'var(--primary)' }} />
          My Vendor Inquiries ({inquiries.length})
        </h2>
        <button className="btn btn-outline btn-sm" onClick={fetchInquiries} disabled={loading}>
          Refresh Inquiries
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.25rem' }}>
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
            placeholder="Search inquiries by vendor, business idea or message content..."
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
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={36} />
          <span>Loading your inquiries...</span>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="empty-state">
          <MessageSquare size={48} className="empty-state-icon" />
          <h3>No inquiries found</h3>
          <p>Browse Business Ideas or Verified Vendors and click "Contact Vendor" to initiate an inquiry.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Inquiry ID</th>
                <th>Target Vendor</th>
                <th>Business Idea</th>
                <th>My Message</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Vendor Response</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inq) => (
                <tr key={inq.id}>
                  <td><strong>#{inq.id}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                      <Building size={14} style={{ color: 'var(--purple)' }} />
                      {inq.vendorCompanyName || 'Verified Vendor'}
                    </div>
                  </td>
                  <td>
                    {inq.businessIdeaName ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem' }}>
                        <Lightbulb size={13} style={{ color: 'var(--success)' }} />
                        {inq.businessIdeaName}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.825rem' }}>Direct Vendor Inquiry</span>
                    )}
                  </td>
                  <td>
                    <div style={{ maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>
                      {inq.message}
                    </div>
                  </td>
                  <td>{getStatusBadge(inq.status)}</td>
                  <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                  <td>
                    {inq.vendorResponse ? (
                      <div style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#047857', fontWeight: 600, fontSize: '0.85rem' }}>
                        {inq.vendorResponse}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        Awaiting reply...
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenDetail(inq)}
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

      {/* Inquiry Detail Conversation Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedInquiry ? `Inquiry Thread #${selectedInquiry.id}` : 'Inquiry Details'}
        size="large"
      >
        {selectedInquiry && (
          <div>
            <div className="detail-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="detail-item">
                <div className="detail-label">Target Vendor</div>
                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building size={15} style={{ color: 'var(--purple)' }} />
                  {selectedInquiry.vendorCompanyName}
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value">{getStatusBadge(selectedInquiry.status)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Sent Date</div>
                <div className="detail-value">{new Date(selectedInquiry.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {selectedInquiry.businessIdeaName && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Lightbulb size={16} style={{ color: 'var(--success)' }} />
                <span>Associated Business Opportunity: <strong>{selectedInquiry.businessIdeaName}</strong></span>
              </div>
            )}

            {/* Conversation Thread */}
            <div style={{ margin: '1rem 0' }}>
              <div className="detail-label" style={{ marginBottom: '0.5rem' }}>Inquiry Message (You)</div>
              <div className="inquiry-bubble inquiry-bubble-user">
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.9rem' }}>
                  {selectedInquiry.message}
                </p>
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={12} />
                  Sent {new Date(selectedInquiry.createdAt).toLocaleString()}
                </div>
              </div>

              {selectedInquiry.vendorResponse ? (
                <div>
                  <div className="detail-label" style={{ marginTop: '1.25rem', marginBottom: '0.5rem', color: '#047857' }}>
                    Vendor Official Response ({selectedInquiry.vendorCompanyName})
                  </div>
                  <div className="inquiry-bubble inquiry-bubble-vendor">
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.9rem' }}>
                      {selectedInquiry.vendorResponse}
                    </p>

                    {(selectedInquiry.quotedPrice || selectedInquiry.deliveryInformation) && (
                      <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed #a7f3d0', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        {selectedInquiry.quotedPrice && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                            <DollarSign size={15} /> Quoted Estimate: ${selectedInquiry.quotedPrice}
                          </div>
                        )}
                        {selectedInquiry.deliveryInformation && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Truck size={15} /> Delivery Scope: {selectedInquiry.deliveryInformation}
                          </div>
                        )}
                      </div>
                    )}

                    {selectedInquiry.respondedAt && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={12} />
                        Responded {new Date(selectedInquiry.respondedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1rem', backgroundColor: '#fffbeb', borderRadius: 'var(--radius)', border: '1px solid #fde68a', color: '#b45309', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <Clock size={16} />
                  <span>The vendor has received your inquiry and is preparing a proposal. You will see their reply right here once submitted.</span>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsDetailOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyInquiries;
