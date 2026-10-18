import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert,
  Info
} from 'lucide-react';

const VerificationBanner = ({ profile }) => {
  if (!profile) return null;

  const status = profile.verificationStatus || 'PENDING';
  const reason = profile.rejectionReason;

  if (status === 'VERIFIED') {
    return (
      <div 
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          border: '1px solid #6ee7b7',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)'
        }}
      >
        <div style={{ color: '#059669', marginTop: '2px' }}>
          <ShieldCheck size={26} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#065f46', margin: 0 }}>
              Your vendor account is verified.
            </h3>
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>VERIFIED</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#047857', margin: 0 }}>
            Your business profile and active product/service offerings are publicly listed in the BizConnect marketplace directory. Entrepreneurs can discover your solutions and submit direct inquiries.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div 
        style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1px solid #fca5a5',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(239, 68, 68, 0.1)'
        }}
      >
        <div style={{ color: '#dc2626', marginTop: '2px' }}>
          <ShieldAlert size={26} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', margin: 0 }}>
              Vendor Account Verification Rejected
            </h3>
            <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>REJECTED</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#b91c1c', marginBottom: reason ? '0.5rem' : 0 }}>
            Your vendor profile application was reviewed and not approved for marketplace listing.
          </p>
          {reason && (
            <div style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem', fontSize: '0.85rem', color: '#7f1d1d' }}>
              <strong>Admin Reason:</strong> {reason}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === 'CHANGES_REQUIRED') {
    return (
      <div 
        style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1px solid #fcd34d',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(245, 158, 11, 0.1)'
        }}
      >
        <div style={{ color: '#d97706', marginTop: '2px' }}>
          <AlertTriangle size={26} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', margin: 0 }}>
              Action Required: Profile Revisions Requested
            </h3>
            <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>CHANGES REQUIRED</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#b45309', marginBottom: reason ? '0.5rem' : 0 }}>
            The admin team requested updates to your business information before completing verification.
          </p>
          {reason && (
            <div style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.9rem', fontSize: '0.85rem', color: '#78350f' }}>
              <strong>Admin Instructions:</strong> {reason}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: PENDING
  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '1px solid #bfdbfe',
        borderRadius: 'var(--radius-lg)',
        padding: '1.1rem 1.5rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)'
      }}
    >
      <div style={{ color: '#2563eb', marginTop: '2px' }}>
        <Clock size={26} />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e40af', margin: 0 }}>
            Your vendor account is currently waiting for admin verification.
          </h3>
          <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>PENDING</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#1d4ed8', margin: 0 }}>
          Public visibility on the marketplace directory is disabled until your company credentials and category registration are reviewed and approved by the administrators.
        </p>
      </div>
    </div>
  );
};

export default VerificationBanner;
