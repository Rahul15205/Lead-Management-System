import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            Lead Management
          </Link>
          
          {user ? (
            <nav className="nav-links">
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/leads/new" 
                className={`nav-link ${isActive('/leads/new') ? 'active' : ''}`}
              >
                Add Lead
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                  <User size={16} />
                  {user.firstName} {user.lastName}
                </span>
                <button 
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px' }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </nav>
          ) : (
            <nav className="nav-links">
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link ${isActive('/register') ? 'active' : ''}`}
              >
                Register
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
