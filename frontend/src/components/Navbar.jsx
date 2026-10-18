import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  Users, 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  FolderTree, 
  MessageSquare, 
  ShieldAlert 
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isVendor, isUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleClass = (role) => {
    if (role === 'ROLE_ADMIN' || role === 'ADMIN') return 'admin';
    if (role === 'ROLE_VENDOR' || role === 'VENDOR') return 'vendor';
    return 'user';
  };

  const getRoleLabel = (role) => {
    if (role === 'ROLE_ADMIN' || role === 'ADMIN') return 'ADMIN';
    if (role === 'ROLE_VENDOR' || role === 'VENDOR') return 'VENDOR';
    return 'USER';
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to={isAdmin ? '/admin' : isVendor ? '/vendor' : '/'} className="brand-logo">
          <div className="brand-icon">
            <Building2 size={22} />
          </div>
          <span>BizConnect</span>
        </NavLink>

        {isAuthenticated && (
          <nav className="nav-links">
            {isAdmin && (
              <NavLink 
                to="/admin" 
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={16} />
                <span>Admin Console</span>
              </NavLink>
            )}
            {isVendor && (
              <NavLink 
                to="/vendor" 
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={16} />
                <span>Vendor Portal</span>
              </NavLink>
            )}
            {isUser && (
              <NavLink 
                to="/dashboard" 
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={16} />
                <span>Marketplace Dashboard</span>
              </NavLink>
            )}
          </nav>
        )}

        <div className="nav-links">
          {isAuthenticated ? (
            <div className="user-badge-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserIcon size={16} style={{ color: 'var(--gray-500)' }} />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.username}</span>
                <span className={`role-pill ${getRoleClass(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm" title="Sign Out">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-sm">
              Sign In
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
