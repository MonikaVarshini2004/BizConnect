import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  Power, 
  Loader2, 
  AlertCircle, 
  Lightbulb, 
  Building,
  CheckCircle,
  XCircle
} from 'lucide-react';

const initialForm = {
  name: '',
  description: '',
  status: 'ACTIVE',
};

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Form Modal (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load categories: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Category name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      status: cat.status || 'ACTIVE',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, formData);
        setAlert({ type: 'success', message: `Category "${formData.name}" updated successfully!` });
      } else {
        await api.post('/admin/categories', formData);
        setAlert({ type: 'success', message: `New category "${formData.name}" created successfully!` });
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (err) {
      setAlert({ type: 'error', message: 'Save failed: ' + (err.response?.data?.message || err.message) });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    const nextStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/admin/categories/${cat.id}/status?status=${nextStatus}`);
      setAlert({ type: 'success', message: `Category "${cat.name}" marked as ${nextStatus}.` });
      fetchCategories();
    } catch (err) {
      setAlert({ type: 'error', message: 'Status change failed: ' + (err.response?.data?.message || err.message) });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      setAlert({ type: 'success', message: `Category "${deleteTarget.name}" deleted successfully.` });
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Cannot delete category in use.' });
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <FolderTree size={22} style={{ color: '#0ea5e9' }} />
          Marketplace Categories
        </h2>
        <div className="panel-actions">
          <button className="btn btn-outline btn-sm" onClick={fetchCategories} disabled={loading}>
            Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <AlertCircle size={18} />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={32} />
          <span>Loading categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <FolderTree size={48} className="empty-state-icon" />
          <h3>No categories found</h3>
          <p>Create industry categories to organize business ideas and vendors.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Business Ideas Count</th>
                <th>Vendors Count</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const ideasCount = cat.businessIdeasCount || 0;
                const vendorsCount = cat.vendorsCount || 0;
                const inUse = ideasCount > 0 || vendorsCount > 0;

                return (
                  <tr key={cat.id}>
                    <td><strong>#{cat.id}</strong></td>
                    <td><strong style={{ color: 'var(--gray-900)' }}>{cat.name}</strong></td>
                    <td>
                      <span style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>
                        {cat.description || 'No description'}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Lightbulb size={14} style={{ color: '#10b981' }} />
                        {ideasCount}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Building size={14} style={{ color: '#8b5cf6' }} />
                        {vendorsCount}
                      </span>
                    </td>
                    <td>
                      {cat.status === 'ACTIVE' ? (
                        <span className="badge badge-active">Active</span>
                      ) : (
                        <span className="badge badge-inactive">Inactive</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(cat)}
                          title="Edit Category"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>

                        <button
                          className={`btn ${cat.status === 'ACTIVE' ? 'btn-outline' : 'btn-success'} btn-sm`}
                          onClick={() => handleToggleStatus(cat)}
                          title={cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={14} />
                          <span>{cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteTarget(cat)}
                          disabled={inUse}
                          title={inUse ? 'Cannot delete: Category is assigned to ideas or vendors' : 'Delete Category'}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? `Edit Category #${editingId}` : 'Add New Category'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label required">Category Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Clean Energy & Utilities"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formErrors.name && <div className="form-error">{formErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Brief description of this industry category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)} disabled={formSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
              {formSubmitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to permanently delete the "${deleteTarget?.name}" category? This action cannot be undone.`}
        confirmText="Delete Category"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default CategoriesManagement;
