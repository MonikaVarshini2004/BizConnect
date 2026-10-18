import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  Lightbulb, 
  Search, 
  Plus, 
  Edit3, 
  Archive, 
  Send, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Tag,
  DollarSign
} from 'lucide-react';

const initialForm = {
  name: '',
  categoryId: '',
  shortDescription: '',
  detailedDescription: '',
  investmentRange: '',
  expectedRoi: '',
  targetMarket: '',
  resourceRequirements: '',
  checklist: '',
  feasibilityStudy: '',
  status: 'DRAFT',
};

const BusinessIdeasManagement = () => {
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState(null);

  // Form Modal (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Archive Confirm Modal
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  useEffect(() => {
    fetchIdeas();
    fetchCategories();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/ideas');
      setIdeas(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load business ideas: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Idea name is required';
    if (!formData.categoryId) errors.categoryId = 'Category selection is required';
    if (!formData.shortDescription.trim()) errors.shortDescription = 'Short description is required';
    if (!formData.investmentRange.trim()) errors.investmentRange = 'Investment range is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...initialForm,
      categoryId: categories.length > 0 ? categories[0].id : '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (idea) => {
    setEditingId(idea.id);
    setFormData({
      name: idea.name || '',
      categoryId: idea.categoryId || (categories.find(c => c.name === idea.categoryName)?.id) || '',
      shortDescription: idea.shortDescription || '',
      detailedDescription: idea.detailedDescription || '',
      investmentRange: idea.investmentRange || '',
      expectedRoi: idea.expectedRoi || '',
      targetMarket: idea.targetMarket || '',
      resourceRequirements: idea.resourceRequirements || '',
      checklist: idea.checklist || '',
      feasibilityStudy: idea.feasibilityStudy || '',
      status: idea.status || 'DRAFT',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormSubmitting(true);
    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
      };

      if (editingId) {
        await api.put(`/admin/ideas/${editingId}`, payload);
        setAlert({ type: 'success', message: 'Business idea updated successfully!' });
      } else {
        await api.post('/admin/ideas', payload);
        setAlert({ type: 'success', message: 'New business idea created successfully!' });
      }
      setIsFormOpen(false);
      fetchIdeas();
    } catch (err) {
      setAlert({ type: 'error', message: 'Save failed: ' + (err.response?.data?.message || err.message) });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handlePublish = async (idea) => {
    try {
      await api.put(`/admin/ideas/${idea.id}/publish`);
      setAlert({ type: 'success', message: `Idea "${idea.name}" published to marketplace!` });
      fetchIdeas();
    } catch (err) {
      setAlert({ type: 'error', message: 'Publish failed: ' + (err.response?.data?.message || err.message) });
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    setArchiveLoading(true);
    try {
      await api.put(`/admin/ideas/${archiveTarget.id}/archive`);
      setAlert({ type: 'success', message: `Idea "${archiveTarget.name}" archived successfully.` });
      setArchiveTarget(null);
      fetchIdeas();
    } catch (err) {
      setAlert({ type: 'error', message: 'Archive failed: ' + (err.response?.data?.message || err.message) });
    } finally {
      setArchiveLoading(false);
    }
  };

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.name?.toLowerCase().includes(search.toLowerCase()) ||
      idea.categoryName?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || String(idea.categoryId) === String(categoryFilter) || idea.categoryName === categoryFilter;
    const matchesStatus = !statusFilter || idea.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="badge badge-published">Published</span>;
      case 'DRAFT':
        return <span className="badge badge-draft">Draft</span>;
      case 'ARCHIVED':
        return <span className="badge badge-archived">Archived</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Lightbulb size={22} style={{ color: '#10b981' }} />
          Business Ideas Management
        </h2>
        <div className="panel-actions">
          <button className="btn btn-outline btn-sm" onClick={fetchIdeas} disabled={loading}>
            Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Idea</span>
          </button>
        </div>
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
            placeholder="Search ideas by name..."
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={32} />
          <span>Loading business ideas...</span>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="empty-state">
          <Lightbulb size={48} className="empty-state-icon" />
          <h3>No business ideas found</h3>
          <p>Get started by clicking "Add New Idea" above.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Idea ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Investment Range</th>
                <th>Expected ROI</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIdeas.map((idea) => (
                <tr key={idea.id}>
                  <td><strong>#{idea.id}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{idea.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--gray-500)', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {idea.shortDescription}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--gray-700)' }}>
                      <Tag size={13} />
                      {idea.categoryName || 'Unassigned'}
                    </span>
                  </td>
                  <td><strong>{idea.investmentRange}</strong></td>
                  <td>{idea.expectedRoi || 'N/A'}</td>
                  <td>{getStatusBadge(idea.status)}</td>
                  <td>{new Date(idea.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEdit(idea)}
                        title="Edit Idea"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>

                      {idea.status !== 'PUBLISHED' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handlePublish(idea)}
                          title="Publish to Marketplace"
                        >
                          <Send size={14} />
                          <span>Publish</span>
                        </button>
                      )}

                      {idea.status !== 'ARCHIVED' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setArchiveTarget(idea)}
                          title="Archive Idea"
                        >
                          <Archive size={14} />
                          <span>Archive</span>
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

      {/* Add / Edit Idea Modal Form */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? `Edit Idea #${editingId}` : 'Add New Business Idea'}
        size="large"
      >
        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label required">Idea Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Smart EV Charging Station"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label required">Category</label>
              <select
                className="form-select"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {formErrors.categoryId && <div className="form-error">{formErrors.categoryId}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Short Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="A brief summary for cards and search results..."
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />
            {formErrors.shortDescription && <div className="form-error">{formErrors.shortDescription}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Comprehensive details of the business concept..."
              value={formData.detailedDescription}
              onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label required">Investment Range</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. $10,000 - $25,000"
                value={formData.investmentRange}
                onChange={(e) => setFormData({ ...formData, investmentRange: e.target.value })}
              />
              {formErrors.investmentRange && <div className="form-error">{formErrors.investmentRange}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Expected ROI</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 25-35% in 18 months"
                value={formData.expectedRoi}
                onChange={(e) => setFormData({ ...formData, expectedRoi: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Market</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Commercial parking operators, residential complexes"
              value={formData.targetMarket}
              onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Resource Requirements</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Hardware hardware kits, licensed software, 2 technical staff"
              value={formData.resourceRequirements}
              onChange={(e) => setFormData({ ...formData, resourceRequirements: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Execution Checklist</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. 1. Site survey, 2. Grid permit, 3. Hardware installation"
              value={formData.checklist}
              onChange={(e) => setFormData({ ...formData, checklist: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)} disabled={formSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Saving...' : editingId ? 'Update Business Idea' : 'Create Business Idea'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive Business Idea"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? It will no longer be visible in public marketplace search.`}
        confirmText="Archive Idea"
        confirmVariant="danger"
        loading={archiveLoading}
      />
    </div>
  );
};

export default BusinessIdeasManagement;
