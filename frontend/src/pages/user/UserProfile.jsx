import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, CheckCircle, Loader2, AlertCircle, Save, Calendar, Clock } from 'lucide-react';

const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data);
      setEmail(response.data.email || '');
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load profile: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setAlert({ type: 'error', message: 'Email address cannot be empty.' });
      return;
    }

    setSaving(true);
    setAlert(null);
    try {
      const response = await api.put('/user/profile', { email: email.trim() });
      setProfile(response.data);
      setAlert({ type: 'success', message: 'Profile details updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update profile: ' + (err.response?.data?.message || err.message) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner content-panel">
        <Loader2 className="spinner-icon" size={36} />
        <span>Loading your profile details...</span>
      </div>
    );
  }

  return (
    <div className="content-panel" style={{ maxWidth: '750px', margin: '0 auto' }}>
      <div className="panel-header">
        <h2 className="panel-title">
          <User size={22} style={{ color: 'var(--primary)' }} />
          My User Account Profile
        </h2>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{alert.message}</span>
        </div>
      )}

      {profile && (
        <div>
          <div className="detail-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="detail-item">
              <div className="detail-label">Username</div>
              <div className="detail-value">@{profile.username}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Platform Role</div>
              <div className="detail-value">
                <span className="role-pill user">USER</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Account Status</div>
              <div className="detail-value">
                <span className="badge badge-active">{profile.accountStatus}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Member Since</div>
              <div className="detail-value">{new Date(profile.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--gray-900)' }}>
              Edit Account Information
            </h3>

            <div className="form-group">
              <label className="form-label required">Registered Email Address</label>
              <div className="search-input-wrap">
                <Mail size={16} className="search-icon" />
                <input
                  type="email"
                  className="search-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.35rem', display: 'block' }}>
                Used for platform communications, inquiry alerts, and vendor correspondence.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile Changes'}
                {!saving && <Save size={15} />}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
