import React, { useState } from 'react';
import Modal from './Modal';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger', // 'danger' | 'warning' | 'primary' | 'success'
  requireReason = false,
  reasonPlaceholder = 'Please specify the reason...',
  loading = false,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setError('A reason is required to proceed.');
      return;
    }
    setError('');
    onConfirm(reason.trim());
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  const getVariantBtnClass = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'btn-danger';
      case 'warning':
        return 'btn-warning';
      case 'success':
        return 'btn-success';
      default:
        return 'btn-primary';
    }
  };

  const getVariantIcon = () => {
    switch (confirmVariant) {
      case 'danger':
        return <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />;
      case 'warning':
        return <AlertCircle size={24} style={{ color: 'var(--warning)' }} />;
      default:
        return <Info size={24} style={{ color: 'var(--primary)' }} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        {getVariantIcon()}
        <div>
          <p style={{ color: 'var(--gray-700)', fontSize: '0.925rem' }}>{message}</p>
        </div>
      </div>

      {requireReason && (
        <div className="form-group">
          <label className="form-label required">Reason / Notes</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder={reasonPlaceholder}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
          />
          {error && <div className="form-error">{error}</div>}
        </div>
      )}

      <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
        <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${getVariantBtnClass()}`}
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
