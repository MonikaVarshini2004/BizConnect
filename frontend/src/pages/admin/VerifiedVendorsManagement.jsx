import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  Building, 
  Search, 
  Eye, 
  PauseCircle, 
  PlayCircle, 
  Loader2, 
  AlertCircle,
  Package,
  MessageSquare,
  Briefcase,
  Users,
  CheckCircle2,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

const VerifiedVendorsManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState(null);

  // Detail Modal
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Suspend / Reactivate Modal
  const [actionTarget, setActionTarget] = useState(null); // { type: 'SUSPEND' | 'REACTIVATE', vendor }
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/vendors');
      setVendors(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load vendors: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (vendorId) => {
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const response = await api.get(`/admin/vendors/${vendorId}`);
      setSelectedVendor(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load vendor details: ' + (err.response?.data?.message || err.message) });
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleActionConfirm = async (reason) => {
    if (!actionTarget) return;
    setActionLoading(true);
    try {
      if (actionTarget.type === 'SUSPEND') {
        await api.put(`/admin/vendors/${actionTarget.vendor.id}/suspend`, { reason });
        setAlert({ type: 'success', message: `Vendor "${actionTarget.vendor.companyName}" has been suspended.` });
      } else {
        await api.put(`/admin/vendors/${actionTarget.vendor.id}/reactivate`);
        setAlert({ type: 'success', message: `Vendor "${actionTarget.vendor.companyName}" has been reactivated.` });
      }
      setActionTarget(null);
      fetchVendors();
    } catch (err) {
      setAlert({ type: 'error', message: 'Action failed: ' + (err.response?.data?.message || err.message) });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = 
      v.companyName?.toLowerCase().includes(search.toLowerCase()) || 
      v.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || v.vendorStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-active">Active</span>;
      case 'SUSPENDED':
        return <span className="badge badge-blocked">Suspended</span>;
      case 'UNDER_REVIEW':
        return <span className="badge badge-pending">Under Review</span>;
      case 'PENDING':
        return <span className="badge badge-pending">Pending</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Building size={22} style={{ color: '#8b5cf6' }} />
          Verified Vendors Directory
        </h2>
        <button className="btn btn-outline btn-sm" onClick={fetchVendors} disabled={loading}>
          Refresh Directory
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
            placeholder="Search vendors by company, contact person or email..."
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
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={32} />
          <span>Loading verified vendors...</span>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="empty-state">
          <Building size={48} className="empty-state-icon" />
          <h3>No verified vendors found</h3>
          <p>Vendors will appear here once approved from the Pending Verification queue.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Company Name</th>
                <th>Owner Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Verification Date</th>
                <th>Vendor Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((v) => (
                <tr key={v.id}>
                  <td><strong>#{v.id}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={15} style={{ color: '#8b5cf6' }} />
                      {v.companyName}
                    </div>
                  </td>
                  <td>{v.ownerName}</td>
                  <td>{v.email}</td>
                  <td>{v.phone || 'N/A'}</td>
                  <td>{formatDate(v.verifiedAt)}</td>
                  <td>{getStatusBadge(v.vendorStatus)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewDetails(v.id)}
                        title="View Vendor Profile"
                      >
                        <Eye size={14} />
                        <span>Profile</span>
                      </button>

                      {v.vendorStatus === 'SUSPENDED' ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => setActionTarget({ type: 'REACTIVATE', vendor: v })}
                          title="Reactivate Vendor"
                        >
                          <PlayCircle size={14} />
                          <span>Reactivate</span>
                        </button>
                      ) : (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => setActionTarget({ type: 'SUSPEND', vendor: v })}
                          title="Suspend Vendor"
                        >
                          <PauseCircle size={14} />
                          <span>Suspend</span>
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

      {/* Vendor Profile Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedVendor ? `Vendor Profile – ${selectedVendor.vendor.companyName}` : 'Vendor Profile'}
        size="large"
      >
        {detailLoading || !selectedVendor ? (
          <div className="loading-spinner">
            <Loader2 className="spinner-icon" size={32} />
            <span>Loading profile details...</span>
          </div>
        ) : (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Company</div>
                <div className="detail-value">{selectedVendor.vendor.companyName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Contact Person</div>
                <div className="detail-value">{selectedVendor.vendor.ownerName}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Vendor Status</div>
                <div className="detail-value">{getStatusBadge(selectedVendor.vendor.vendorStatus)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Verification Status</div>
                <div className="detail-value"><span className="badge badge-verified">{selectedVendor.vendor.verificationStatus}</span></div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value" style={{ wordBreak: 'break-all' }}>{selectedVendor.vendor.email}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Phone</div>
                <div className="detail-value">{selectedVendor.vendor.phone || 'N/A'}</div>
              </div>
            </div>

            {selectedVendor.vendor.Description && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                <div className="detail-label">Business Description</div>
                <p style={{ color: 'var(--gray-700)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{selectedVendor.vendor.Description}</p>
              </div>
            )}

            {/* Products & Services List */}
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={16} />
                Products & Services ({selectedVendor.productsAndServices?.length || 0})
              </h4>
              {selectedVendor.productsAndServices && selectedVendor.productsAndServices.length > 0 ? (
                <div className="table-container" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category Name</th>
                        <th>Price Range</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVendor.productsAndServices.map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.name}</strong></td>
                          <td>{s.categoryName || 'N/A'}</td>
                          <td>{s.priceRange || 'N/A'}</td>
                          <td><span className={`badge badge-${s.status?.toLowerCase()}`}>{s.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>No products or services listed yet.</p>
              )}
            </div>

            {/* Job Openings List */}
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={16} />
                Job Openings ({selectedVendor.jobOpenings?.length || 0})
              </h4>
              {selectedVendor.jobOpenings && selectedVendor.jobOpenings.length > 0 ? (
                <div className="table-container" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Openings</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Applications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVendor.jobOpenings.map((j) => (
                        <tr key={j.id}>
                          <td><strong>{j.title}</strong></td>
                          <td>{j.openings}</td>
                          <td>{j.location}</td>
                          <td><span className={`badge badge-${j.status?.toLowerCase()}`}>{j.status}</span></td>
                          <td><strong>{j.applicationsCount || 0}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>No active job openings.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Suspend / Reactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        onConfirm={handleActionConfirm}
        title={actionTarget?.type === 'SUSPEND' ? 'Suspend Vendor' : 'Reactivate Vendor'}
        message={
          actionTarget?.type === 'SUSPEND'
            ? `Are you sure you want to suspend "${actionTarget?.vendor?.companyName}"? Their listings will be hidden from the public marketplace.`
            : `Are you sure you want to reactivate "${actionTarget?.vendor?.companyName}"? Their marketplace presence will be restored.`
        }
        confirmText={actionTarget?.type === 'SUSPEND' ? 'Suspend Vendor' : 'Reactivate Vendor'}
        confirmVariant={actionTarget?.type === 'SUSPEND' ? 'warning' : 'success'}
        requireReason={actionTarget?.type === 'SUSPEND'}
        reasonPlaceholder="Specify reason for suspension..."
        loading={actionLoading}
      />
    </div>
  );
};

export default VerifiedVendorsManagement;
