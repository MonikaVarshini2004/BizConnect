import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import InquiryModal from './InquiryModal';
import { 
  Building, 
  Search, 
  CheckCircle2, 
  Send, 
  Tag, 
  Mail, 
  Phone, 
  Loader2, 
  AlertCircle,
  Package
} from 'lucide-react';

const VerifiedVendorsExplorer = ({ onInquirySent }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState(null);

  // Inquiry Modal State
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendors');
      // Keep only verified & active vendors
      const verified = response.data.filter(
        (v) => v.verificationStatus === 'VERIFIED' && v.vendorStatus === 'ACTIVE'
      );
      setVendors(verified);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load vendors: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInquiry = (vendor) => {
    setSelectedVendor(vendor);
    setIsInquiryOpen(true);
  };

  const handleInquirySuccess = (msg) => {
    setAlert({ type: 'success', message: msg });
    if (onInquirySent) onInquirySent();
  };

  const filteredVendors = vendors.filter((v) => {
    const q = search.toLowerCase();
    return (
      !search ||
      v.companyName?.toLowerCase().includes(q) ||
      v.contactPerson?.toLowerCase().includes(q) ||
      v.categoryName?.toLowerCase().includes(q) ||
      v.businessDescription?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="filters-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search verified vendors by company name, category or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-outline btn-sm" onClick={fetchVendors} disabled={loading}>
          Refresh Suppliers
        </button>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={36} />
          <span>Finding verified vendor partners...</span>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="empty-state content-panel">
          <Building size={48} className="empty-state-icon" />
          <h3>No verified vendors found</h3>
          <p>Try clearing your search or checking back later.</p>
        </div>
      ) : (
        <div className="vendors-grid">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="vendor-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                    {vendor.companyName}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    Contact: {vendor.contactPerson}
                  </span>
                </div>
                <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>

              {vendor.categoryName && (
                <div>
                  <span className="badge" style={{ backgroundColor: 'var(--purple-light)', color: 'var(--purple-dark)', border: '1px solid #ddd6fe' }}>
                    <Tag size={12} /> {vendor.categoryName}
                  </span>
                </div>
              )}

              <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 1.5, flex: 1 }}>
                {vendor.businessDescription || 'Verified enterprise supplier ready for commercial partnerships.'}
              </p>

              {vendor.services && vendor.services.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Package size={12} /> Listed Services:
                  </div>
                  <div className="tag-list">
                    {vendor.services.map((s) => (
                      <span key={s.id} className="tag-pill" style={{ fontSize: '0.725rem' }}>
                        {s.name} {s.priceRange ? `(${s.priceRange})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => handleOpenInquiry(vendor)}
                >
                  <Send size={15} />
                  <span>Contact Vendor</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        targetVendor={selectedVendor}
        onSuccess={handleInquirySuccess}
      />
    </div>
  );
};

export default VerifiedVendorsExplorer;
