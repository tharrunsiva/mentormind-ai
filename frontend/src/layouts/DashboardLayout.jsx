import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

const DashboardLayout = () => {
  const { user, profile, logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Overview', color: '#6366F1', bg: '#EEF2FF' },
    { to: '/profile', icon: 'bi-person-badge-fill', label: 'My Profile', color: '#3B82F6', bg: '#EFF6FF' },
    { to: '/assessment', icon: 'bi-patch-check-fill', label: 'Skill Assessment', color: '#10B981', bg: '#ECFDF5' },
    { to: '/careers', icon: 'bi-compass-fill', label: 'Career Explorer', color: '#F59E0B', bg: '#FFFBEB' },
    { to: '/skill-gap', icon: 'bi-bar-chart-steps', label: 'Skill Gap Analysis', color: '#EC4899', bg: '#FDF2F8' },
    { to: '/roadmap', icon: 'bi-map-fill', label: 'Learning Roadmap', color: '#06B6D4', bg: '#ECFEFF' },
    { to: '/resources', icon: 'bi-collection-play-fill', label: 'Learning Resources', color: '#8B5CF6', bg: '#F5F3FF' },
    { to: '/mentor', icon: 'bi-robot', label: 'AI Mentor Chat', color: '#D946EF', bg: '#FDF4FF' },
    { to: '/peers', icon: 'bi-people-fill', label: 'Peer Connect', color: '#14B8A6', bg: '#F0FDFA' },
    { to: '/interviews', icon: 'bi-mic-fill', label: 'Mock Interview', color: '#F97316', bg: '#FFF7ED' },
    { to: '/analytics', icon: 'bi-graph-up-arrow', label: 'Progress Analytics', color: '#84CC16', bg: '#F7FEE7' },
    { to: '/notifications', icon: 'bi-bell-fill', label: 'Notifications', color: '#EF4444', bg: '#FEF2F2', count: unreadCount },
    { to: '/settings', icon: 'bi-gear-fill', label: 'Settings', color: '#64748B', bg: '#F8FAFC' },
  ];

  if (isAdmin || user?.email === 'admin@mentormind.ai') {
    navItems.push({ to: '/admin', icon: 'bi-shield-lock-fill', label: 'Admin Dashboard', color: '#F59E0B', bg: '#FFFBEB' });
  }

  return (
    <div className="app-container">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(15, 23, 42, 0.5)', zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Vibrant Colorful Sidebar */}
      <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'show-mobile' : ''}`}>
        <div className="sidebar-header">
          <div className="d-flex align-items-center gap-2.5 overflow-hidden text-truncate">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-3 flex-shrink-0"
              style={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #4F46E5 0%, #D946EF 100%)',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
              }}
            >
              <i className="bi bi-cpu-fill fs-5"></i>
            </div>
            {!collapsed && (
              <div className="sidebar-text">
                <span className="fw-extrabold fs-5 text-dark" style={{ letterSpacing: '-0.03em' }}>MentorMind</span>
                <span
                  className="badge ms-1 px-2 py-0.5 rounded-pill text-white"
                  style={{
                    fontSize: '0.65rem',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    fontWeight: 700,
                  }}
                >
                  AI
                </span>
              </div>
            )}
          </div>

          <button
            className="btn btn-sm text-secondary d-none d-lg-block border-0 p-1"
            onClick={() => setCollapsed(!collapsed)}
            title="Toggle Sidebar"
            aria-label="Toggle Navigation"
          >
            <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'} fs-6`}></i>
          </button>
        </div>

        {/* Navigation Items with Jewel-Tone Icons */}
        <div className="sidebar-nav">
          {!collapsed && <div className="nav-section-title">Platform Modules</div>}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span
                className="sidebar-icon-pill"
                style={{
                  background: item.bg,
                  color: item.color,
                }}
              >
                <i className={`bi ${item.icon}`}></i>
              </span>
              <span className="sidebar-text flex-grow-1">{item.label}</span>
              {item.count > 0 && (
                <span
                  className="badge rounded-pill text-white"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #F43F5E 100%)',
                    fontSize: '0.68rem',
                    padding: '0.2rem 0.5rem',
                  }}
                >
                  {item.count}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Card in Footer with Multi-Color Accent */}
        {!collapsed && (
          <div className="p-3 border-top mt-auto" style={{ borderColor: '#F1F5F9' }}>
            <div
              className="d-flex align-items-center gap-2.5 p-2 rounded-3"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(236, 72, 153, 0.06) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
              }}
            >
              <div
                className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                style={{
                  width: 36,
                  height: 36,
                  fontSize: '0.9rem',
                  background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                  boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)',
                }}
              >
                {user?.name?.charAt(0) || 'L'}
              </div>
              <div className="overflow-hidden text-truncate flex-grow-1" style={{ fontSize: '0.82rem' }}>
                <div className="fw-bold text-dark text-truncate">{user?.name || 'Learner'}</div>
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
              className="btn btn-sm d-lg-none d-flex align-items-center justify-content-center p-2 rounded-3 border"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ background: '#FFFFFF' }}
            >
              <i className="bi bi-list fs-5"></i>
            </button>

            {/* Global Search */}
            <form onSubmit={handleSearchSubmit} className="d-none d-md-flex position-relative" style={{ width: 340 }}>
              <i
                className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3"
                style={{ color: '#818CF8' }}
              ></i>
              <input
                ref={searchInputRef}
                type="text"
                className="form-control rounded-pill ps-5 pe-5 py-2 border"
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  borderColor: 'rgba(226, 232, 240, 0.8)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  fontSize: '0.88rem',
                  boxShadow: '0 2px 6px rgba(99, 102, 241, 0.05)',
                }}
                placeholder="Search careers, skills, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-2 badge rounded-pill bg-white text-secondary border small shadow-sm"
                style={{ fontSize: '0.68rem' }}
              >
                ⌘K
              </span>
            </form>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* AI Agents Active Status Pill */}
            <div
              className="badge-glow d-none d-sm-flex"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
                color: '#4F46E5',
                border: '1px solid rgba(79, 70, 229, 0.25)',
              }}
            >
              <span className="spinner-grow spinner-grow-sm text-primary" style={{ width: 8, height: 8 }} role="status"></span>
              <span>10 AI Agents Active</span>
            </div>

            {/* Notifications Icon with Radiant Badge */}
            <NavLink
              to="/notifications"
              className="btn btn-light position-relative p-2 rounded-circle border"
              style={{ background: '#FFFFFF' }}
            >
              <i className="bi bi-bell-fill fs-5 text-secondary"></i>
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-white"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #F43F5E 100%)',
                    fontSize: '0.65rem',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </NavLink>

            {/* Profile Dropdown */}
            <div className="dropdown">
              <button
                className="btn d-flex align-items-center gap-2 p-1.5 pe-3 rounded-pill border bg-white shadow-sm"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div
                  className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                  style={{
                    width: 32,
                    height: 32,
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
                  }}
                >
                  {user?.name?.charAt(0) || 'L'}
                </div>
                <span className="fw-bold text-dark d-none d-sm-inline" style={{ fontSize: '0.85rem' }}>
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <i className="bi bi-chevron-down text-secondary" style={{ fontSize: '0.72rem' }}></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 p-2" style={{ minWidth: 220 }}>
                <li className="px-3 py-2 border-bottom mb-1">
                  <div className="fw-bold text-dark">{user?.name}</div>
                  <div className="text-secondary small text-truncate">{user?.email}</div>
                </li>
                <li>
                  <NavLink to="/profile" className="dropdown-item py-2 rounded-3 d-flex align-items-center gap-2">
                    <i className="bi bi-person-fill text-primary"></i> My Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings" className="dropdown-item py-2 rounded-3 d-flex align-items-center gap-2">
                    <i className="bi bi-gear-fill text-secondary"></i> Settings
                  </NavLink>
                </li>
                <li><hr className="dropdown-divider my-1" /></li>
                <li>
                  <button onClick={logout} className="dropdown-item py-2 rounded-3 text-danger d-flex align-items-center gap-2">
                    <i className="bi bi-box-arrow-right"></i> Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
