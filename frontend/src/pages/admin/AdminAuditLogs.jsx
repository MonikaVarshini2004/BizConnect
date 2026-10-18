import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  ShieldAlert, 
  Search, 
  Loader2, 
  AlertCircle,
  Calendar,
  Clock,
  UserCheck,
  Activity
} from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/audit-logs');
      setLogs(response.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load audit logs: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    return (
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.adminUsername?.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(search.toLowerCase()) ||
      log.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getActionBadge = (action) => {
    if (action.includes('BLOCK') || action.includes('REJECT') || action.includes('SUSPEND') || action.includes('ARCHIVE') || action.includes('DELETE')) {
      return <span className="badge badge-blocked">{action}</span>;
    }
    if (action.includes('APPROVE') || action.includes('UNBLOCK') || action.includes('PUBLISH') || action.includes('REACTIVATE')) {
      return <span className="badge badge-active">{action}</span>;
    }
    return <span className="badge badge-pending">{action}</span>;
  };

  return (
    <div className="content-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <ShieldAlert size={22} style={{ color: '#dc2626' }} />
          Admin Activity & Security Audit Logs
        </h2>
        <button className="btn btn-outline btn-sm" onClick={fetchLogs} disabled={loading}>
          Refresh Logs
        </button>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <AlertCircle size={18} />
          <span>{alert.message}</span>
        </div>
      )}

      {/* Search */}
      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search audit trail by admin, action, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-spinner">
          <Loader2 className="spinner-icon" size={32} />
          <span>Loading audit trail...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state">
          <Activity size={48} className="empty-state-icon" />
          <h3>No audit logs found</h3>
          <p>Administrative actions such as approvals, blocks, and status updates will be logged here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Admin Username</th>
                <th>Action</th>
                <th>Target Entity</th>
                <th>Entity ID</th>
                <th>Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td><strong>#{log.id}</strong></td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                      @{log.adminUsername}
                    </span>
                  </td>
                  <td>{getActionBadge(log.action)}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>
                      {log.entityType}
                    </span>
                  </td>
                  <td>#{log.entityId}</td>
                  <td>
                    <span style={{ color: 'var(--gray-700)', fontSize: '0.85rem' }}>
                      {log.description}
                    </span>
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
