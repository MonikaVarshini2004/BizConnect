import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import BusinessIdeasExplorer from './BusinessIdeasExplorer';
import VerifiedVendorsExplorer from './VerifiedVendorsExplorer';
import MyInquiries from './MyInquiries';
import UserProfile from './UserProfile';
import { 
  Lightbulb, 
  Building, 
  MessageSquare, 
  Clock, 
  User, 
  RefreshCw, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ideas'); // 'ideas' | 'vendors' | 'inquiries' | 'profile'
  const [summary, setSummary] = useState({
    availableIdeas: 0,
    verifiedVendors: 0,
    myInquiries: 0,
    pendingResponses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserSummary();
  }, []);

  const fetchUserSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/summary');
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to load user summary metrics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      {/* Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👋</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.username || 'Entrepreneur'}!
            </h1>
          </div>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.925rem' }}>
            Discover commercial opportunities, explore business concepts, and connect directly with verified suppliers.
          </p>
        </div>

        <button 
          className="btn btn-outline btn-sm" 
          onClick={fetchUserSummary} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spinner-icon' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 4 Dynamic Metric Summary Cards */}
      <div className="summary-cards-grid">
        {/* Card 1: Available Business Ideas */}
        <div
          className={`summary-card card-ideas ${activeTab === 'ideas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ideas')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">Available Ideas</span>
            <span className="card-value">{loading ? '...' : summary.availableIdeas}</span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Explore concepts <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <Lightbulb size={26} />
          </div>
        </div>

        {/* Card 2: Verified Vendors */}
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
              Browse suppliers <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <Building size={26} />
          </div>
        </div>

        {/* Card 3: My Inquiries */}
        <div
          className={`summary-card card-users ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">My Inquiries</span>
            <span className="card-value">{loading ? '...' : summary.myInquiries}</span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Track discussions <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <MessageSquare size={26} />
          </div>
        </div>

        {/* Card 4: Pending Responses */}
        <div
          className={`summary-card card-pending ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">Pending Responses</span>
            <span className="card-value" style={{ color: summary.pendingResponses > 0 ? '#b45309' : 'inherit' }}>
              {loading ? '...' : summary.pendingResponses}
            </span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Awaiting replies <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <Clock size={26} />
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ideas')}
        >
          <Lightbulb size={16} />
          <span>Explore Business Ideas</span>
          <span className="tab-badge">{summary.availableIdeas}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendors')}
        >
          <Building size={16} />
          <span>Verified Vendors</span>
          <span className="tab-badge">{summary.verifiedVendors}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          <MessageSquare size={16} />
          <span>My Inquiries</span>
          <span className="tab-badge">{summary.myInquiries}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} />
          <span>My Profile</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'ideas' && <BusinessIdeasExplorer onInquirySent={fetchUserSummary} />}
      {activeTab === 'vendors' && <VerifiedVendorsExplorer onInquirySent={fetchUserSummary} />}
      {activeTab === 'inquiries' && <MyInquiries />}
      {activeTab === 'profile' && <UserProfile />}
    </div>
  );
};

export default UserDashboard;
