import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  ShieldAlert, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Mail,
  Calendar,
  Clock,
  Briefcase,
  MessageSquare
} from 'lucide-react';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState(null);

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Confirm Modal (Block / Unblock)
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'BLOCK' | 'UNBLOCK', user }
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load users: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (userId) => {
    setDetailLoading(true);
    setIsDetailOpen(true);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load user details: ' + (err.response?.data?.message || err.message) });
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmAction = async (reason) => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === 'BLOCK') {
        await api.put(`/admin/users/${confirmAction.user.id}/block`, { reason });
        setAlert({ type: 'success', message: `User @${confirmAction.user.username} has been blocked.` });
      } else {
        await api.put(`/admin/users/${confirmAction.user.id}/unblock`);
        setAlert({ type: 'success', message: `User @${confirmAction.user.username} has been unblocked.` });
      }
      setConfirmAction(null);
      fetchUsers();
    } catch (err) {
      setAlert({ type: 'error', message: 'Action failed: ' + (err.response?.data?.message || err.message) });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.username?.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = !statusFilter || u.accountStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-active">Active</span>;
      case 'BLOCKED':
        return <span className="badge badge-blocked">Blocked</span>;
      case 'INACTIVE':
        return <span className="badge badge-inactive">Inactive</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Users size={22} style={{ color: '#3b82f6' }} />
          Total Users Management
        </h2>
        <button className="btn btn-outline btn-sm" onClick={fetchUsers} disabled={loading}>
          Refresh List
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
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="USER">USER</option>
          <option value="VENDOR">VENDOR</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="BLOCKED">BLOCKED</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={32} />
          <span>Loading users...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <Users size={48} className="empty-state-icon" />
          <h3>No users found</h3>
          <p>Try clearing your filters or search terms.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Joined Date</th>
                <th>Last Login</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td><strong>#{u.id}</strong></td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{u.username}</span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-pill ${u.role?.toLowerCase().replace('role_', '')}`}>
                      {u.role?.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td>{getStatusBadge(u.accountStatus)}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>{formatDate(u.lastLogin)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleViewDetails(u.id)}
                        title="View User Details"
                      >
                        <Eye size={14} />
                        <span>Details</span>
                      </button>

                      {u.accountStatus === 'BLOCKED' ? (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => setConfirmAction({ type: 'UNBLOCK', user: u })}
                          title="Unblock User"
                        >
                          <ShieldCheck size={14} />
                          <span>Unblock</span>
                        </button>
                      ) : (
                        u.role !== 'ROLE_ADMIN' && u.role !== 'ADMIN' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setConfirmAction({ type: 'BLOCK', user: u })}
                            title="Block User"
                          >
                            <ShieldAlert size={14} />
                            <span>Block</span>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedUser ? `User Details – @${selectedUser.user.username}` : 'User Details'}
        size="large"
      >
        {detailLoading || !selectedUser ? (
          <div className="loading-spinner">
            <Loader2 className="spinner-icon" size={32} />
            <span>Loading user profile...</span>
          </div>
        ) : (
          <div>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">User ID</div>
                <div className="detail-value">#{selectedUser.user.id}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Role</div>
                <div className="detail-value">
                  <span className={`role-pill ${selectedUser.user.role?.toLowerCase().replace('role_', '')}`}>
                    {selectedUser.user.role?.replace('ROLE_', '')}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value">{getStatusBadge(selectedUser.user.accountStatus)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value" style={{ wordBreak: 'break-all' }}>{selectedUser.user.email}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Joined Date</div>
                <div className="detail-value">{formatDate(selectedUser.user.createdAt)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Last Login</div>
                <div className="detail-value">{formatDate(selectedUser.user.lastLogin)}</div>
              </div>
            </div>

            {/* Inquiries History */}
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={16} />
                Associated Inquiries ({selectedUser.inquiries?.length || 0})
              </h4>
              {selectedUser.inquiries && selectedUser.inquiries.length > 0 ? (
                <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Subject</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.inquiries.map((inq) => (
                        <tr key={inq.id}>
                          <td>#{inq.id}</td>
                          <td>{inq.subject}</td>
                          <td><span className={`badge badge-${inq.status?.toLowerCase()}`}>{inq.status}</span></td>
                          <td>{formatDate(inq.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>No inquiries submitted by this user.</p>
              )}
            </div>

            {/* Applications History */}
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={16} />
                Associated Job Applications ({selectedUser.applications?.length || 0})
              </h4>
              {selectedUser.applications && selectedUser.applications.length > 0 ? (
                <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Status</th>
                        <th>Applied On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.applications.map((app) => (
                        <tr key={app.id}>
                          <td>#{app.id}</td>
                          <td>{app.jobTitle}</td>
                          <td>{app.companyName}</td>
                          <td><span className={`badge badge-${app.status?.toLowerCase()}`}>{app.status}</span></td>
                          <td>{formatDate(app.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>No job applications submitted by this user.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={confirmAction?.type === 'BLOCK' ? 'Block User Account' : 'Unblock User Account'}
        message={
          confirmAction?.type === 'BLOCK'
            ? `Are you sure you want to block @${confirmAction?.user?.username}? They will no longer be able to log in or interact with the platform.`
            : `Are you sure you want to unblock @${confirmAction?.user?.username}? Their account status will be restored to ACTIVE.`
        }
        confirmText={confirmAction?.type === 'BLOCK' ? 'Confirm Block' : 'Confirm Unblock'}
        confirmVariant={confirmAction?.type === 'BLOCK' ? 'danger' : 'success'}
        requireReason={confirmAction?.type === 'BLOCK'}
        reasonPlaceholder="Specify reason for blocking this user..."
        loading={actionLoading}
      />
    </div>
  );
};

export default UsersManagement;
