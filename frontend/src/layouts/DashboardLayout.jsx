import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../services/api';

const DashboardLayout = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for Cmd+K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const res = await notificationAPI.getNotifications();
        if (res.data && res.data.success) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (e) {
        // Silently handle
      }
    };
    loadNotifs();
  }, [location.pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/careers?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navItems = [
    { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Overview' },
    { to: '/profile', icon: 'bi-person-badge', label: 'My Profile' },
    { to: '/assessment', icon: 'bi-patch-check', label: 'Skill Assessment' },
    { to: '/careers', icon: 'bi-compass', label: 'Career Explorer' },
    { to: '/skill-gap', icon: 'bi-bar-chart-steps', label: 'Skill Gap Analysis' },
    { to: '/roadmap', icon: 'bi-map', label: 'Learning Roadmap' },
    { to: '/resources', icon: 'bi-collection-play', label: 'Learning Resources' },
    { to: '/mentor', icon: 'bi-robot', label: 'AI Mentor Chat' },
    { to: '/peers', icon: 'bi-people', label: 'Peer Connect' },
    { to: '/interviews', icon: 'bi-mic', label: 'Mock Interview' },
    { to: '/analytics', icon: 'bi-graph-up', label: 'Progress Analytics' },
    { to: '/notifications', icon: 'bi-bell', label: 'Notifications', count: unreadCount },
    { to: '/settings', icon: 'bi-gear', label: 'Settings' },
  ];

  if (isAdmin || user?.email === 'admin@mentormind.ai') {
    navItems.push({ to: '/admin', icon: 'bi-shield-lock', label: 'Admin Dashboard' });
  }

  return (
    <div className="app-container">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{
            zIndex: 99,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* macOS Frosted Glass Sidebar */}
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'show-mobile' : ''}`}>
        <div className="sidebar-header">
          {/* macOS Window Controls (Traffic Lights) */}
          <div className="d-flex align-items-center justify-content-between w-100 mb-2">
            <div className="mac-traffic-lights" title="macOS Window Controls">
              <span className="mac-traffic-dot mac-traffic-close"></span>
              <span className="mac-traffic-dot mac-traffic-minimize"></span>
              <span className="mac-traffic-dot mac-traffic-zoom"></span>
            </div>

            <button
              className="btn btn-sm text-secondary d-none d-lg-flex align-items-center justify-content-center p-1 rounded-circle"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              style={{ width: 26, height: 26, background: 'transparent', border: 'none' }}
              aria-label="Toggle Sidebar"
            >
              <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'} fs-6`}></i>
            </button>
          </div>

          {/* App Branding */}
          <div className="d-flex align-items-center gap-2 overflow-hidden text-truncate">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-3 flex-shrink-0"
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #0071E3 0%, #5856D6 100%)',
                boxShadow: '0 2px 8px rgba(0, 113, 227, 0.35)',
              }}
            >
              <i className="bi bi-cpu-fill fs-6"></i>
            </div>
            {!collapsed && (
              <div className="sidebar-text">
                <span className="fw-bold fs-6" style={{ letterSpacing: '-0.02em' }}>MentorMind</span>
                <span
                  className="badge ms-1 px-1.5 py-0.5 rounded-pill"
                  style={{
                    fontSize: '0.65rem',
                    background: 'rgba(0, 113, 227, 0.15)',
                    color: 'var(--mac-blue)',
                    fontWeight: 700,
                  }}
                >
                  AI
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="sidebar-nav">
          {!collapsed && <div className="nav-section-title">Navigation</div>}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <i className={`bi ${item.icon}`}></i>
              <span className="sidebar-text flex-grow-1">{item.label}</span>
              {item.count > 0 && (
                <span
                  className="badge rounded-pill badge-count"
                  style={{
                    fontSize: '0.68rem',
                    background: 'var(--mac-red)',
                    color: '#fff',
                    padding: '0.2rem 0.5rem',
                  }}
                >
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Card in Sidebar Footer */}
        {!collapsed && (
          <div className="p-3 border-top mt-auto" style={{ borderColor: 'var(--mac-border)' }}>
            <div
              className="d-flex align-items-center gap-2 p-2 rounded-3"
              style={{
                background: 'var(--mac-surface)',
                border: '1px solid var(--mac-border)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{
                  width: 34,
                  height: 34,
                  fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #0071E3 0%, #5856D6 100%)',
                }}
              >
                {user?.name?.charAt(0) || 'L'}
              </div>
              <div className="overflow-hidden text-truncate flex-grow-1" style={{ fontSize: '0.82rem' }}>
                <div className="fw-semibold text-truncate">{user?.name || 'Learner'}</div>
                <div className="text-secondary text-truncate" style={{ fontSize: '0.72rem' }}>
                  {profile?.targetCareerName || 'Full Stack Dev'}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className={`main-content-wrapper ${collapsed ? 'expanded' : ''}`}>
        {/* Top Navbar */}
        <header className="app-topbar">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-sm d-lg-none d-flex align-items-center justify-content-center p-2 rounded-circle"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
              aria-label="Open Navigation Menu"
            >
              <i className="bi bi-list fs-5"></i>
            </button>

            {/* macOS Spotlight-style Search Input */}
            <form onSubmit={handleSearchSubmit} className="d-none d-md-flex mac-search-capsule">
              <i
                className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3"
                style={{ color: 'var(--mac-text-secondary)', fontSize: '0.85rem' }}
              ></i>
              <input
                ref={searchInputRef}
                type="text"
                className="mac-search-input"
                placeholder="Search careers, skills, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Global Search"
              />
              <span className="position-absolute top-50 end-0 translate-middle-y me-2 mac-kbd-shortcut">
                ⌘K
              </span>
            </form>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* AI Agents Active Status Pill */}
            <div className="ai-badge d-none d-sm-flex">
              <span className="ai-pulse-dot"></span>
              <span>AI Agents Active</span>
            </div>

            {/* macOS Theme Switcher (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="mac-theme-toggle"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode (macOS Tahoe)`}
              aria-label="Toggle Theme"
            >
              <i className={`bi ${isDark ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-primary'} fs-5`}></i>
            </button>

            {/* Notifications Icon */}
            <NavLink
              to="/notifications"
              className="mac-theme-toggle position-relative text-decoration-none"
              title="Notifications"
              aria-label="View Notifications"
            >
              <i className="bi bi-bell fs-5"></i>
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light"
                  style={{ fontSize: '0.65rem' }}
                >
                  {unreadCount}
                </span>
              )}
            </NavLink>

            {/* Profile Dropdown */}
            <div className="dropdown">
              <button
                className="btn d-flex align-items-center gap-2 p-1.5 pe-3 rounded-pill"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  background: 'var(--mac-surface)',
                  border: '1px solid var(--mac-border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: 30,
                    height: 30,
                    fontSize: '0.82rem',
                    background: 'linear-gradient(135deg, #0071E3 0%, #5856D6 100%)',
                  }}
                >
                  {user?.name?.charAt(0) || 'L'}
                </div>
                <span className="fw-semibold d-none d-sm-inline" style={{ fontSize: '0.85rem' }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <i className="bi bi-chevron-down" style={{ fontSize: '0.72rem', color: 'var(--mac-text-secondary)' }}></i>
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-2"
                style={{
                  background: 'var(--mac-surface-elevated)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--mac-border)',
                  minWidth: 200,
                }}
              >
                <li>
                  <div className="px-3 py-2 border-bottom mb-1" style={{ borderColor: 'var(--mac-border)' }}>
                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{user?.name}</div>
                    <div className="text-secondary small text-truncate">{user?.email}</div>
                  </div>
                </li>
                <li>
                  <NavLink to="/profile" className="dropdown-item py-2 rounded-3 d-flex align-items-center gap-2">
                    <i className="bi bi-person text-primary"></i> My Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings" className="dropdown-item py-2 rounded-3 d-flex align-items-center gap-2">
                    <i className="bi bi-gear text-secondary"></i> Settings
                  </NavLink>
                </li>
                <li>
                  <hr className="dropdown-divider my-1" style={{ borderColor: 'var(--mac-border)' }} />
                </li>
                <li>
                  <button onClick={logout} className="dropdown-item py-2 rounded-3 text-danger d-flex align-items-center gap-2">
                    <i className="bi bi-box-arrow-right"></i> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
