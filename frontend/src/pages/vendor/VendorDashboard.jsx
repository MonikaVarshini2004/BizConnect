import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import VerificationBanner from './VerificationBanner';
import VendorProfile from './VendorProfile';
import VendorServices from './VendorServices';
import VendorInquiries from './VendorInquiries';
import VendorJobs from './VendorJobs';
import VendorApplications from './VendorApplications';
import { 
  Building2, 
  Package, 
  MessageSquare, 
  Briefcase, 
  Users, 
  User, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'inquiries' | 'jobs' | 'applications' | 'profile'
  const [selectedJobIdForApps, setSelectedJobIdForApps] = useState(null);

  const [summary, setSummary] = useState({
    businessName: '',
    ownerName: '',
    verificationStatus: 'PENDING',
    vendorStatus: 'ACTIVE',
    rejectionReason: null,
    categoryName: null,
    totalServices: 0,
    activeServices: 0,
    pendingServices: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    respondedInquiries: 0,
    totalJobs: 0,
    openJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorSummary();
  }, []);

  const fetchVendorSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load vendor summary', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToApplications = (jobId) => {
    setSelectedJobIdForApps(jobId);
    setActiveTab('applications');
  };

  return (
    <div className="main-content">
      {/* Vendor Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em', margin: 0 }}>
              {summary.businessName || 'Vendor Portal'}
            </h1>
            <span className={`badge ${
              summary.verificationStatus === 'VERIFIED' ? 'badge-success' :
              summary.verificationStatus === 'REJECTED' ? 'badge-danger' :
              'badge-warning'
            }`} style={{ fontSize: '0.8rem' }}>
              {summary.verificationStatus || 'PENDING'}
            </span>
            <span className={`badge ${
              summary.vendorStatus === 'ACTIVE' ? 'badge-success' :
              summary.vendorStatus === 'SUSPENDED' ? 'badge-danger' :
              'badge-secondary'
            }`} style={{ fontSize: '0.8rem' }}>
              {summary.vendorStatus || 'ACTIVE'}
            </span>
          </div>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            Owner: <strong>{summary.ownerName || user?.username}</strong> {summary.categoryName && `• Sector: ${summary.categoryName}`}
          </p>
        </div>

        <button 
          className="btn btn-outline btn-sm" 
          onClick={fetchVendorSummary} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spinner-icon' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Verification State Banner */}
      <VerificationBanner profile={summary} />

      {/* 4 Summary Metrics Cards */}
      <div className="summary-cards-grid">
        {/* Card 1: Services */}
        <div
          className={`summary-card card-ideas ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">Commercial Services</span>
            <span className="card-value">{loading ? '...' : summary.totalServices}</span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Manage catalog <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <Package size={26} />
          </div>
        </div>

        {/* Card 2: Pending Inquiries */}
        <div
          className={`summary-card card-pending ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">Pending Inquiries</span>
            <span className="card-value" style={{ color: summary.pendingInquiries > 0 ? '#b45309' : 'inherit' }}>
              {loading ? '...' : summary.pendingInquiries}
            </span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Review proposals <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <MessageSquare size={26} />
          </div>
        </div>

        {/* Card 3: Open Jobs */}
        <div
          className={`summary-card card-vendors ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">Open Jobs</span>
            <span className="card-value">{loading ? '...' : summary.openJobs}</span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Active postings <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <Briefcase size={26} />
          </div>
        </div>

        {/* Card 4: Applications */}
        <div
          className={`summary-card card-users ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
          role="button"
          tabIndex={0}
        >
          <div className="card-content">
            <span className="card-title">Job Applications</span>
            <span className="card-value">{loading ? '...' : summary.totalApplications}</span>
            <span className="card-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Candidate pipeline <ArrowRight size={12} />
            </span>
          </div>
          <div className="icon-box">
            <Users size={26} />
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Package size={16} />
          <span>Services & Offerings</span>
          <span className="tab-badge">{summary.totalServices}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          <MessageSquare size={16} />
          <span>Incoming Inquiries</span>
          <span className="tab-badge" style={{ background: summary.pendingInquiries > 0 ? '#fef3c7' : undefined, color: summary.pendingInquiries > 0 ? '#92400e' : undefined }}>
            {summary.pendingInquiries > 0 ? `${summary.pendingInquiries} New` : summary.totalInquiries}
          </span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <Briefcase size={16} />
          <span>Job Openings</span>
          <span className="tab-badge">{summary.openJobs}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <Users size={16} />
          <span>Applications (ATS)</span>
          <span className="tab-badge">{summary.totalApplications}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} />
          <span>Company Profile</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'services' && <VendorServices onServicesUpdated={fetchVendorSummary} />}
      {activeTab === 'inquiries' && <VendorInquiries onInquiryResponded={fetchVendorSummary} />}
      {activeTab === 'jobs' && (
        <VendorJobs 
          onJobsUpdated={fetchVendorSummary} 
          onSelectJobForApplications={handleNavigateToApplications}
        />
      )}
      {activeTab === 'applications' && (
        <VendorApplications 
          selectedJobId={selectedJobIdForApps}
          onApplicationsUpdated={fetchVendorSummary}
        />
      )}
      {activeTab === 'profile' && <VendorProfile onProfileUpdated={fetchVendorSummary} />}
    </div>
  );
};

export default VendorDashboard;
