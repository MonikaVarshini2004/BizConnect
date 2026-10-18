import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  DollarSign, 
  Clock, 
  Tag, 
  Filter,
  CheckCircle,
  Archive
} from 'lucide-react';

const VendorServices = ({ onServicesUpdated }) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    priceRange: '',
    availability: 'In Stock / Ready to Deploy'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchServicesAndCategories();
  }, []);

  const fetchServicesAndCategories = async () => {
    setLoading(true);
    try {
      const [srvRes, catRes] = await Promise.all([
        api.get('/vendor/services'),
        api.get('/categories')
      ]);
      setServices(srvRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Failed to load services', err);
      setErrorMsg('Failed to load your products/services list.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      description: '',
      price: '',
      priceRange: '',
      availability: 'In Stock / Ready to Deploy'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      categoryId: item.categoryId || (categories.length > 0 ? categories[0].id : ''),
      description: item.description || '',
      price: item.price ? item.price.toString() : '',
      priceRange: item.priceRange || '',
      availability: item.availability || 'In Stock / Ready to Deploy'
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
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

    try {
      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        description: formData.description.trim(),
        price: formData.price ? parseFloat(formData.price) : null,
        priceRange: formData.priceRange.trim() || null,
        availability: formData.availability.trim() || null
      };

      if (editingItem) {
        await api.put(`/vendor/services/${editingItem.id}`, payload);
        setSuccessMsg(`Service "${formData.name}" updated successfully.`);
      } else {
        await api.post('/vendor/services', payload);
        setSuccessMsg(`Service "${formData.name}" submitted for approval (Status: PENDING).`);
      }

      setIsModalOpen(false);
      fetchServicesAndCategories();
      if (onServicesUpdated) onServicesUpdated();
    } catch (err) {
      console.error('Failed to save service', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save product/service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/vendor/services/${deletingId}`);
      setSuccessMsg('Product/service deleted successfully.');
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
      fetchServicesAndCategories();
      if (onServicesUpdated) onServicesUpdated();
    } catch (err) {
      console.error('Failed to delete service', err);
      setErrorMsg('Failed to delete service.');
    }
  };

  const filteredServices = services.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Products & Services Catalog</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            List your specialized equipment, supplies, franchise packages, or B2B commercial solutions.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleOpenCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '1rem' }}>
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search services by title, category, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--gray-500)' }} />
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="APPROVED">APPROVED / ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Content */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
          <Loader2 size={32} className="spinner-icon" style={{ margin: '0 auto 1rem' }} />
          <p>Loading your products and services catalog...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Package size={48} style={{ color: 'var(--gray-400)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.5rem' }}>
            No Products or Services Found
          </h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {searchTerm || statusFilter !== 'ALL'
              ? 'No catalog items match your filter criteria.'
              : 'You have not added any product or service offerings yet. Click below to add your first offering.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreateModal}>
            <Plus size={14} style={{ marginRight: '0.3rem' }} /> Add Service Offering
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service / Product Name</th>
                <th>Category</th>
                <th>Price / Range</th>
                <th>Availability</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', maxWidth: '320px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.description || 'No description provided'}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{item.categoryName || 'General'}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#047857' }}>
                      {item.price ? `$${Number(item.price).toLocaleString()}` : item.priceRange || 'Custom Quote'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} style={{ color: 'var(--gray-400)' }} />
                      <span>{item.availability || 'Available'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      item.status === 'APPROVED' || item.status === 'ACTIVE' ? 'badge-success' :
                      item.status === 'PENDING' ? 'badge-warning' :
                      item.status === 'REJECTED' ? 'badge-danger' :
                      'badge-secondary'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenEditModal(item)}
                        title="Edit Service"
                        style={{ padding: '0.35rem 0.6rem' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setDeletingId(item.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        title="Delete Service"
                        style={{ padding: '0.35rem 0.6rem', color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Product / Service Offering' : 'Add New Product or Service Offering'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Service / Product Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleFormChange}
              required
              placeholder="e.g. 50kW Commercial Solar Inverters & Installation"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Industry Category *</label>
            <select
              name="categoryId"
              className="form-control"
              value={formData.categoryId}
              onChange={handleFormChange}
              required
            >
              <option value="">Select Category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Fixed Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="price"
                className="form-control"
                value={formData.price}
                onChange={handleFormChange}
                placeholder="e.g. 18500.00"
              />
              <small style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>Leave blank if estimated via range</small>
            </div>

            <div className="form-group">
              <label className="form-label">Price Range / Model</label>
              <input
                type="text"
                name="priceRange"
                className="form-control"
                value={formData.priceRange}
                onChange={handleFormChange}
                placeholder="e.g. $15,000 - $25,000"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Availability & Lead Time</label>
            <input
              type="text"
              name="availability"
              className="form-control"
              value={formData.availability}
              onChange={handleFormChange}
              placeholder="e.g. 2 weeks lead time / In stock in Austin warehouse"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Description & Specifications</label>
            <textarea
              name="description"
              className="form-control"
              rows={4}
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Detail technical specifications, warranty terms, inclusions, capacity, and commercial delivery scope..."
            />
          </div>

          {!editingItem && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.825rem', color: '#475569' }}>
              <strong>Note on Approval Workflow:</strong> Newly added offerings are initially registered with status <code>PENDING</code>. Admin moderation ensures listing quality across the marketplace directory.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '120px', justifyContent: 'center' }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spinner-icon" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingItem ? 'Update Service' : 'Submit Service'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Service Offering"
        message="Are you sure you want to delete this product/service offering? This action cannot be undone."
        confirmText="Delete Service"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeletingId(null);
        }}
      />
    </div>
  );
};

export default VendorServices;
