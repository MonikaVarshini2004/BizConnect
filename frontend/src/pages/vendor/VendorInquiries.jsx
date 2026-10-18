import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  Truck, 
  User, 
  Lightbulb, 
  Loader2, 
  AlertCircle, 
  Search, 
  Filter,
  Calendar,
  Building,
  CheckCircle
} from 'lucide-react';

const VendorInquiries = ({ onInquiryResponded }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Active Inquiry Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Response Form
  const [responseForm, setResponseForm] = useState({
    vendorResponse: '',
    quotedPrice: '',
    deliveryInformation: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inquiries/vendor');
      setInquiries(res.data || []);
    } catch (err) {
      console.error('Failed to load vendor inquiries', err);
      setErrorMsg('Failed to load incoming inquiries from prospective clients.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRespondModal = (inq) => {
    setSelectedInquiry(inq);
    setResponseForm({
      vendorResponse: inq.vendorResponse || '',
      quotedPrice: inq.quotedPrice ? inq.quotedPrice.toString() : '',
      deliveryInformation: inq.deliveryInformation || ''
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setResponseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;

    if (!responseForm.vendorResponse.trim()) {
      setErrorMsg('Please enter your response message / proposal details.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        inquiryId: selectedInquiry.id,
        vendorResponse: responseForm.vendorResponse.trim(),
        quotedPrice: responseForm.quotedPrice ? parseFloat(responseForm.quotedPrice) : null,
        deliveryInformation: responseForm.deliveryInformation.trim() || null
      };

      await api.post('/inquiries/respond', payload);
      setSuccessMsg(`Quotation & response sent to @${selectedInquiry.username || 'client'} successfully.`);
      setIsModalOpen(false);
      fetchInquiries();
      if (onInquiryResponded) onInquiryResponded();
    } catch (err) {
      console.error('Failed to send vendor response', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit response.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = !searchTerm ||
      inq.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.businessIdeaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Incoming Business Inquiries</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            Review inquiries submitted by entrepreneurs, send custom commercial quotations, and provide delivery terms.
          </p>
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

      {/* Filter Bar */}
      <div className="filter-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem' }}>
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by client username, business idea, or message keyword..."
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
              <option value="ALL">All Inquiries</option>
              <option value="PENDING">PENDING (Action Needed)</option>
              <option value="RESPONDED">RESPONDED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
          <Loader2 size={32} className="spinner-icon" style={{ margin: '0 auto 1rem' }} />
          <p>Loading incoming inquiries...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <MessageSquare size={48} style={{ color: 'var(--gray-400)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
            No Inquiries Found
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto' }}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'No inquiries match your filter criteria.'
              : 'You have not received any commercial inquiries yet. As users browse the marketplace, incoming inquiries will appear here.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Prospective Client</th>
                <th>Related Business Idea</th>
                <th>Inquiry Message</th>
                <th>Date Received</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map(inq => (
                <tr key={inq.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                        {inq.username ? inq.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>@{inq.username || 'client'}</span>
                    </div>
                  </td>
                  <td>
                    {inq.businessIdeaName ? (
                      <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Lightbulb size={12} /> {inq.businessIdeaName}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>Direct General Inquiry</span>
                    )}
                  </td>
                  <td>
                    <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--gray-700)', fontSize: '0.875rem' }}>
                      {inq.message}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.825rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} />
                      <span>{inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      inq.status === 'RESPONDED' ? 'badge-success' :
                      inq.status === 'PENDING' ? 'badge-warning' :
                      'badge-secondary'
                    }`}>
                      {inq.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className={`btn btn-sm ${inq.status === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleOpenRespondModal(inq)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        {inq.status === 'PENDING' ? (
                          <>
                            <Send size={13} />
                            <span>Respond</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={13} />
                            <span>View Response</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View / Respond Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInquiry?.status === 'RESPONDED' ? 'Inquiry Quotation Details' : 'Respond to Client Inquiry'}
      >
        {selectedInquiry && (
          <div>
            {/* Inquiry Context Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  <User size={16} style={{ color: 'var(--primary-600)' }} />
                  <span>Inquiry from @{selectedInquiry.username || 'client'}</span>
                </div>
                <span className={`badge ${selectedInquiry.status === 'RESPONDED' ? 'badge-success' : 'badge-warning'}`}>
                  {selectedInquiry.status}
                </span>
              </div>

              {selectedInquiry.businessIdeaName && (
                <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Lightbulb size={14} style={{ color: '#d97706' }} />
                  <span>Target Commercial Concept: <strong>{selectedInquiry.businessIdeaName}</strong></span>
                </div>
              )}

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.9rem', color: 'var(--gray-800)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                "{selectedInquiry.message}"
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.4rem', textAlign: 'right' }}>
                Received: {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : 'N/A'}
              </div>
            </div>

            {/* Vendor Response Form or Readonly View */}
            <form onSubmit={handleSendResponse}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={15} /> Your Response / Solution Proposal *
                </label>
                <textarea
                  name="vendorResponse"
                  className="form-control"
                  rows={4}
                  value={responseForm.vendorResponse}
                  onChange={handleFormChange}
                  required
                  placeholder="Outline your commercial proposition, equipment specifications, service guarantees, or terms of fulfillment..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <DollarSign size={15} /> Quoted Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="quotedPrice"
                    className="form-control"
                    value={responseForm.quotedPrice}
                    onChange={handleFormChange}
                    placeholder="e.g. 18500.00"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Truck size={15} /> Delivery / Fulfillment Terms
                  </label>
                  <input
                    type="text"
                    name="deliveryInformation"
                    className="form-control"
                    value={responseForm.deliveryInformation}
                    onChange={handleFormChange}
                    placeholder="e.g. 2 weeks lead time with on-site warranty"
                  />
                </div>
              </div>

              {selectedInquiry.status === 'RESPONDED' && selectedInquiry.respondedAt && (
                <div style={{ fontSize: '0.8rem', color: '#047857', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={14} />
                  <span>Last responded: {new Date(selectedInquiry.respondedAt).toLocaleString()}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '150px', justifyContent: 'center' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spinner-icon" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>{selectedInquiry.status === 'RESPONDED' ? 'Update Quotation' : 'Send Quotation'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorInquiries;
