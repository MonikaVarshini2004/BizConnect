import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import InquiryModal from './InquiryModal';
import { 
  Lightbulb, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Building, 
  Send, 
  Tag, 
  TrendingUp, 
  Shield, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

const BusinessIdeasExplorer = ({ onInquirySent }) => {
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Search, Filters & Sorting
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [investmentFilter, setInvestmentFilter] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  // Detail Modal & Related Vendors
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [ideaVendors, setIdeaVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Inquiry Modal
  const [inquiryVendor, setInquiryVendor] = useState(null);
  const [inquiryIdea, setInquiryIdea] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useEffect(() => {
    fetchIdeas();
    fetchCategories();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ideas');
      setIdeas(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load business ideas: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/public/categories');
      setCategories(response.data);
    } catch (err) {
      // Fallback
    }
  };

  const handleOpenIdeaDetails = async (idea) => {
    setSelectedIdea(idea);
    setIsDetailOpen(true);
    setVendorsLoading(true);
    try {
      const response = await api.get(`/vendors/by-idea/${idea.id}`);
      // Ensure only verified and active vendors are displayed
      const verified = response.data.filter(
        (v) => v.verificationStatus === 'VERIFIED' && v.vendorStatus === 'ACTIVE'
      );
      setIdeaVendors(verified);
    } catch (err) {
      setIdeaVendors([]);
    } finally {
      setVendorsLoading(false);
    }
  };

  const handleContactVendor = (vendor, idea) => {
    setInquiryVendor(vendor);
    setInquiryIdea(idea || selectedIdea);
    setIsInquiryOpen(true);
  };

  const handleInquirySuccess = (msg) => {
    setAlert({ type: 'success', message: msg });
    if (onInquirySent) onInquirySent();
  };

  // Filter & Sort Pipeline
  const filteredAndSortedIdeas = ideas
    .filter((idea) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        idea.name?.toLowerCase().includes(q) ||
        idea.shortDescription?.toLowerCase().includes(q) ||
        idea.categoryName?.toLowerCase().includes(q) ||
        idea.tags?.toLowerCase().includes(q);

      const matchesCat = !categoryFilter || idea.categoryName === categoryFilter;
      const matchesRisk = !riskFilter || idea.riskLevel?.toLowerCase() === riskFilter.toLowerCase();
      const matchesTag = !tagFilter || idea.tags?.toLowerCase().includes(tagFilter.toLowerCase());
      const matchesInvestment = !investmentFilter || idea.investmentRange?.toLowerCase().includes(investmentFilter.toLowerCase());

      return matchesSearch && matchesCat && matchesRisk && matchesTag && matchesInvestment;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'investment') return (a.investmentRange || '').localeCompare(b.investmentRange || '');
      if (sortBy === 'profit') return (b.expectedProfit || '').localeCompare(a.expectedProfit || '');
      return 0;
    });

  const getRiskClass = (risk) => {
    if (!risk) return '';
    const r = risk.toLowerCase();
    if (r.includes('low')) return 'risk-low';
    if (r.includes('high')) return 'risk-high';
    return 'risk-medium';
  };

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Search, Filter & Sort Controls */}
      <div className="filters-bar" style={{ marginBottom: '1.5rem' }}>
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search business ideas by name, concept, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          <option value="">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Moderate">Moderate Risk</option>
          <option value="High">High Risk</option>
        </select>

        <input
          type="text"
          className="search-input"
          style={{ maxWidth: '160px', padding: '0.5rem 0.75rem' }}
          placeholder="Filter by Tag..."
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        />

        <input
          type="text"
          className="search-input"
          style={{ maxWidth: '160px', padding: '0.5rem 0.75rem' }}
          placeholder="Investment Filter..."
          value={investmentFilter}
          onChange={(e) => setInvestmentFilter(e.target.value)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowUpDown size={15} style={{ color: 'var(--gray-500)' }} />
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="name_desc">Sort: Name (Z-A)</option>
            <option value="investment">Sort: Investment Range</option>
            <option value="profit">Sort: Expected Profit</option>
          </select>
        </div>
      </div>

      {/* Ideas Cards Grid */}
      {loading ? (
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={36} />
          <span>Discovering business opportunities...</span>
        </div>
      ) : filteredAndSortedIdeas.length === 0 ? (
        <div className="empty-state content-panel">
          <Lightbulb size={48} className="empty-state-icon" />
          <h3>No matching business ideas found</h3>
          <p>Try adjusting your search keywords or clearing your filters.</p>
        </div>
      ) : (
        <div className="ideas-grid">
          {filteredAndSortedIdeas.map((idea) => (
            <div key={idea.id} className="idea-card">
              <div className="idea-card-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', border: '1px solid #bfdbfe' }}>
                    <Tag size={12} />
                    {idea.categoryName || 'General'}
                  </span>
                  {idea.riskLevel && (
                    <span className={`tag-pill ${getRiskClass(idea.riskLevel)}`}>
                      <Shield size={11} style={{ display: 'inline', marginRight: '3px' }} />
                      {idea.riskLevel} Risk
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                  {idea.name}
                </h3>
              </div>

              <div className="idea-card-body">
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', lineHeight: 1.5, flex: 1 }}>
                  {idea.shortDescription}
                </p>

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Investment</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--gray-900)' }}>{idea.investmentRange || 'Flexible'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Expected Profit</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#047857' }}>{idea.expectedProfit || 'High Return'}</div>
                  </div>
                </div>

                {/* Required Skills & Tags */}
                {idea.requiredSkills && (
                  <div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.25rem' }}>Required Skills:</div>
                    <div className="tag-list">
                      {idea.requiredSkills.split(',').map((skill, idx) => (
                        <span key={idx} className="tag-pill">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                {idea.tags && (
                  <div className="tag-list">
                    {idea.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="tag-pill" style={{ fontSize: '0.7rem' }}>#{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="idea-card-footer">
                <button
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleOpenIdeaDetails(idea)}
                >
                  <Eye size={14} />
                  <span>View Details</span>
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleOpenIdeaDetails(idea)}
                >
                  <Building size={14} />
                  <span>Find Vendors</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Idea Full Details & Verified Vendors Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedIdea ? selectedIdea.name : 'Business Idea Details'}
        size="large"
      >
        {selectedIdea && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-dark)', border: '1px solid #bfdbfe' }}>
                <Tag size={12} /> {selectedIdea.categoryName}
              </span>
              {selectedIdea.riskLevel && (
                <span className={`tag-pill ${getRiskClass(selectedIdea.riskLevel)}`}>
                  <Shield size={11} style={{ display: 'inline', marginRight: '3px' }} />
                  {selectedIdea.riskLevel} Risk
                </span>
              )}
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Investment Range</div>
                <div className="detail-value">{selectedIdea.investmentRange || 'Flexible'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Expected Profit / ROI</div>
                <div className="detail-value" style={{ color: '#047857' }}>{selectedIdea.expectedProfit || 'High Return'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Target Market</div>
                <div className="detail-value">{selectedIdea.targetMarket || 'General Market'}</div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
              <div className="detail-label" style={{ marginBottom: '0.4rem' }}>Complete Business Description</div>
              <p style={{ color: 'var(--gray-800)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedIdea.detailedDescription || selectedIdea.shortDescription}
              </p>
            </div>

            {selectedIdea.requiredSkills && (
              <div style={{ marginTop: '1rem' }}>
                <div className="detail-label" style={{ marginBottom: '0.4rem' }}>Required Skills & Expertise</div>
                <div className="tag-list">
                  {selectedIdea.requiredSkills.split(',').map((skill, idx) => (
                    <span key={idx} className="tag-pill" style={{ padding: '0.3rem 0.7rem' }}>{skill.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Vendors Section */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={18} style={{ color: 'var(--purple)' }} />
                  Verified Vendors for this Idea ({ideaVendors.length})
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                  Only showing verified & active suppliers
                </span>
              </div>

              {vendorsLoading ? (
                <div className="loading-spinner" style={{ padding: '2rem' }}>
                  <Loader2 className="spinner-icon" size={28} />
                  <span>Loading verified vendors...</span>
                </div>
              ) : ideaVendors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                  <Building size={36} style={{ color: 'var(--gray-400)', margin: '0 auto 0.5rem' }} />
                  <p style={{ fontWeight: 600, color: 'var(--gray-700)' }}>No verified vendors matching this category yet.</p>
                  <p style={{ fontSize: '0.825rem', color: 'var(--gray-500)' }}>New suppliers are verified daily by the platform team.</p>
                </div>
              ) : (
                <div className="vendors-grid">
                  {ideaVendors.map((vendor) => (
                    <div key={vendor.id} className="vendor-card">
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div>
                          <h5 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>
                            {vendor.companyName}
                          </h5>
                          <span style={{ fontSize: '0.775rem', color: 'var(--gray-500)' }}>
                            Contact: {vendor.contactPerson}
                          </span>
                        </div>
                        <span className="badge badge-verified" style={{ fontSize: '0.7rem' }}>
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      </div>

                      {vendor.businessDescription && (
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.825rem', lineHeight: 1.4 }}>
                          {vendor.businessDescription}
                        </p>
                      )}

                      {vendor.services && vendor.services.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            Products & Services:
                          </div>
                          <div className="tag-list">
                            {vendor.services.map((s) => (
                              <span key={s.id} className="tag-pill" style={{ fontSize: '0.7rem' }}>{s.name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ width: '100%' }}
                          onClick={() => handleContactVendor(vendor, selectedIdea)}
                        >
                          <Send size={14} />
                          <span>Contact Vendor</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsDetailOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Send Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        targetVendor={inquiryVendor}
        targetIdea={inquiryIdea}
        onSuccess={handleInquirySuccess}
      />
    </div>
  );
};

export default BusinessIdeasExplorer;
