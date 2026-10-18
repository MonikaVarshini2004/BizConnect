import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FolderTree, 
  FileText, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Clock
} from 'lucide-react';

const VendorProfile = ({ onProfileUpdated }) => {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    categoryId: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchProfileAndCategories();
  }, []);

  const fetchProfileAndCategories = async () => {
    setLoading(true);
    try {
      const [profileRes, catsRes] = await Promise.all([
        api.get('/vendor/profile'),
        api.get('/categories')
      ]);

      const data = profileRes.data;
      setProfile(data);
      setCategories(catsRes.data || []);
      setFormData({
        businessName: data.businessName || '',
        ownerName: data.ownerName || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        description: data.description || '',
        categoryId: data.categoryId || ''
      });
    } catch (err) {
      console.error('Failed to load profile details', err);
      setErrorMsg('Failed to load profile details. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
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
    setSuccessMsg('');

    try {
      const payload = {
        ...formData,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null
      };
      const res = await api.put('/vendor/profile', payload);
      setProfile(res.data);
      setSuccessMsg('Vendor profile information updated successfully.');
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      console.error('Failed to update vendor profile', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update vendor profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
        <Loader2 size={32} className="spinner-icon" style={{ margin: '0 auto 1rem' }} />
        <p>Loading vendor profile...</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="card-header" style={{ borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Company Profile & Contact Details</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            Manage public vendor credentials, commercial category, and contact information.
          </p>
        </div>
      </div>

      {/* Status Badges Header */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
            Verification Status
          </span>
          <span className={`badge ${
            profile?.verificationStatus === 'VERIFIED' ? 'badge-success' :
            profile?.verificationStatus === 'REJECTED' ? 'badge-danger' :
            'badge-warning'
          }`} style={{ marginTop: '0.2rem' }}>
            {profile?.verificationStatus || 'PENDING'}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
            Vendor Status
          </span>
          <span className={`badge ${
            profile?.vendorStatus === 'ACTIVE' ? 'badge-success' :
            profile?.vendorStatus === 'SUSPENDED' ? 'badge-danger' :
            'badge-secondary'
          }`} style={{ marginTop: '0.2rem' }}>
            {profile?.vendorStatus || 'ACTIVE'}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
            Current Category
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)', marginTop: '0.2rem', display: 'inline-block' }}>
            {profile?.categoryName || 'Unassigned'}
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {/* Business Name */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={15} /> Business / Company Name *
            </label>
            <input
              type="text"
              name="businessName"
              className="form-control"
              value={formData.businessName}
              onChange={handleChange}
              required
              placeholder="e.g. Apex Industrial Solutions LLC"
            />
          </div>

          {/* Owner Name */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={15} /> Owner / Representative Name *
            </label>
            <input
              type="text"
              name="ownerName"
              className="form-control"
              value={formData.ownerName}
              onChange={handleChange}
              required
              placeholder="e.g. Sarah Jenkins"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={15} /> Registered Email
            </label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              disabled
              title="Registered account email"
              style={{ background: 'var(--gray-100)', cursor: 'not-allowed' }}
            />
            <small style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>Managed via account credentials</small>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={15} /> Business Phone
            </label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1-555-0199"
            />
          </div>

          {/* Category */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FolderTree size={15} /> Industry Category *
            </label>
            <select
              name="categoryId"
              className="form-control"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Select industry category...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={15} /> Physical Headquarters / Address
            </label>
            <input
              type="text"
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              placeholder="100 Innovation Parkway, Suite 400, Austin, TX"
            />
          </div>

          {/* Description */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={15} /> Business Overview & Capabilities
            </label>
            <textarea
              name="description"
              className="form-control"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your manufacturing, supply chain, or service competencies, certifications, and target business sectors..."
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--gray-200)', paddingTop: '1.25rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px', justifyContent: 'center' }}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="spinner-icon" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorProfile;
