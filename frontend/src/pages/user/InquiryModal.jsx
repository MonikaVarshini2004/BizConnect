import React, { useState } from 'react';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { Send, Building, Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react';

const InquiryModal = ({ isOpen, onClose, targetVendor, targetIdea, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !targetVendor) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Inquiry message is required.');
      return;
    }

    if (targetVendor.verificationStatus !== 'VERIFIED' || targetVendor.vendorStatus !== 'ACTIVE') {
      setError('Cannot send inquiry to an unverified or inactive vendor.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      // Compose enriched message if budget or timeline are provided
      let fullMessage = message.trim();
      const extraDetails = [];
      if (budget.trim()) extraDetails.push(`Budget: ${budget.trim()}`);
      if (timeline.trim()) extraDetails.push(`Timeline: ${timeline.trim()}`);
      if (extraDetails.length > 0) {
        fullMessage += `\n\n[Project Scope: ${extraDetails.join(' | ')}]`;
      }

      const payload = {
        vendorId: targetVendor.id,
        businessIdeaId: targetIdea ? targetIdea.id : null,
        message: fullMessage,
      };

      await api.post('/inquiries', payload);
      if (onSuccess) {
        onSuccess(`Inquiry sent to ${targetVendor.companyName} successfully!`);
      }
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubject('');
    setMessage('');
    setBudget('');
    setTimeline('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Send Inquiry to ${targetVendor.companyName}`}
    >
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ backgroundColor: 'var(--gray-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              <Building size={16} style={{ color: 'var(--purple)' }} />
              {targetVendor.companyName}
            </div>
            <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
              <CheckCircle2 size={12} /> Verified Vendor
            </span>
          </div>

          {targetIdea && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--gray-600)' }}>
              <Lightbulb size={14} style={{ color: 'var(--success)' }} />
              <span>Regarding Business Idea: <strong>{targetIdea.name}</strong></span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label required">Inquiry Message</label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Describe your inquiry, requested services, questions about materials, supply capabilities, or partnership details..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (error) setError('');
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Estimated Budget (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. $5,000 - $10,000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Timeline (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 1-2 months"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Inquiry'}
            {!submitting && <Send size={15} />}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InquiryModal;
