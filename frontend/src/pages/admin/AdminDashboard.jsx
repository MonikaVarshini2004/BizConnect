import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import UsersManagement from './UsersManagement';
import BusinessIdeasManagement from './BusinessIdeasManagement';
import VerifiedVendorsManagement from './VerifiedVendorsManagement';
import PendingVerificationManagement from './PendingVerificationManagement';
import CategoriesManagement from './CategoriesManagement';
import AdminInquiries from './AdminInquiries';
import AdminAuditLogs from './AdminAuditLogs';
import { 
  Users, 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  FolderTree, 
  MessageSquare, 
  ShieldAlert, 
  Loader2,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'ideas' | 'vendors' | 'pending' | 'categories' | 'inquiries' | 'logs'
  const [summary, setSummary] = useState({
    totalUsers: 0,
    businessIdeas: 0,
    verifiedVendors: 0,
    pendingVerification: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/summary');
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to load admin summary counts', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
            Admin Management Console
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.925rem', marginTop: '0.2rem' }}>
            Governance, marketplace management, vendor verification & audit control
          </p>
        </div>

        <button 
          className="btn btn-outline btn-sm" 
          onClick={fetchSummary} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spinner-icon' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 4 Primary Summary Cards Grid */}
      <div className="summary-cards-grid">
        {/* Card 1: TOTAL USERS */}
        <div
          className={`summary-card card-users ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">Total Users</span>
            <span className="card-value">{loading ? '...' : summary.totalUsers}</span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Manage accounts <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <Users size={26} />
          </div>
        </div>

        {/* Card 2: BUSINESS IDEAS */}
        <div
          className={`summary-card card-ideas ${activeTab === 'ideas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ideas')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">Business Ideas</span>
            <span className="card-value">{loading ? '...' : summary.businessIdeas}</span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Marketplace concepts <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <Lightbulb size={26} />
          </div>
        </div>

        {/* Card 3: VERIFIED VENDORS */}
        <div
          className={`summary-card card-vendors ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">Verified Vendors</span>
            <span className="card-value">{loading ? '...' : summary.verifiedVendors}</span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Active suppliers <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <CheckCircle size={26} />
          </div>
        </div>

        {/* Card 4: PENDING VERIFICATION */}
        <div
          className={`summary-card card-pending ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">Pending Verification</span>
            <span className="card-value" style={{ color: summary.pendingVerification > 0 ? '#b45309' : 'inherit' }}>
              {loading ? '...' : summary.pendingVerification}
            </span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Requires review <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <Clock size={26} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation for Additional Sections */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>Users</span>
          <span className="tab-badge">{summary.totalUsers}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ideas')}
        >
          <Lightbulb size={16} />
          <span>Business Ideas</span>
          <span className="tab-badge">{summary.businessIdeas}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          <CheckCircle size={16} />
          <span>Verified Vendors</span>
          <span className="tab-badge">{summary.verifiedVendors}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={16} />
          <span>Pending Applications</span>
          {summary.pendingVerification > 0 && (
            <span className="tab-badge" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
              {summary.pendingVerification}
            </span>
          )}
        </button>

        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FolderTree size={16} />
          <span>Categories</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          <MessageSquare size={16} />
          <span>Inquiries Monitor</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <ShieldAlert size={16} />
          <span>Audit Logs</span>
        </button>
      </div>

      {/* View Switcher */}
      {activeTab === 'users' && <UsersManagement />}
      {activeTab === 'ideas' && <BusinessIdeasManagement />}
      {activeTab === 'vendors' && <VerifiedVendorsManagement />}
      {activeTab === 'pending' && <PendingVerificationManagement onVerificationDone={fetchSummary} />}
      {activeTab === 'categories' && <CategoriesManagement />}
      {activeTab === 'inquiries' && <AdminInquiries />}
      {activeTab === 'logs' && <AdminAuditLogs />}
    </div>
  );
};

export default AdminDashboard;
