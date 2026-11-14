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
  const [fontSizeLevel, setFontSizeLevel] = useState(100);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Font size accessibility adjustments
  const adjustFontSize = (delta) => {
    setFontSizeLevel((prev) => {
      const next = Math.max(90, Math.min(120, prev + delta));
      document.documentElement.style.fontSize = `${next}%`;
      return next;
    });
  };

  const resetFontSize = () => {
    setFontSizeLevel(100);
    document.documentElement.style.fontSize = '100%';
  };

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

  const candidateId = `MM-IN-2026-${(user?._id || '90412').slice(-5).toUpperCase()}`;

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* 1. National Tricolor Sovereign Ribbon */}
      <div className="gov-top-tricolor"></div>

      {/* 2. Official Government Portal Top Bar */}
      <div className="gov-portal-banner">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-bold">🇮🇳 National Career & Skill Intelligence Portal</span>
          <span className="text-secondary d-none d-md-inline">|</span>
          <span className="text-secondary d-none d-md-inline">Ministry of Skill Development & Higher Education</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Accessibility Font Size Switcher */}
          <div className="d-none d-sm-flex align-items-center gap-1.5" title="Font Size Adjustment">
            <span className="text-secondary me-1" style={{ fontSize: '0.7rem' }}>Text Size:</span>
            <button
              className="btn btn-sm text-light p-0 px-1 border border-secondary"
              style={{ fontSize: '0.7rem' }}
              onClick={() => adjustFontSize(-5)}
            >
              A-
            </button>
            <button
              className="btn btn-sm text-light p-0 px-1 border border-secondary"
              style={{ fontSize: '0.7rem' }}
              onClick={resetFontSize}
            >
              A
            </button>
            <button
              className="btn btn-sm text-light p-0 px-1 border border-secondary"
              style={{ fontSize: '0.7rem' }}
              onClick={() => adjustFontSize(5)}
            >
              A+
            </button>
          </div>

          <span className="badge bg-success text-white px-2 py-0.5 rounded-1" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
            OFFICIAL SECURE PORTAL
          </span>
        </div>
      </div>

      <div className="app-container flex-grow-1">
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
            style={{ zIndex: 99 }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Official Deep Navy Sidebar */}
        <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'show-mobile' : ''}`}>
          <div className="sidebar-header">
            <div className="d-flex align-items-center gap-2.5 overflow-hidden text-truncate">
              {/* National Emblem Crest */}
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-1 flex-shrink-0"
                style={{
                  width: 38,
                  height: 38,
                  background: 'linear-gradient(135deg, #C59B27 0%, #D97706 100%)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                }}
              >
                <i className="bi bi-shield-fill-check fs-5"></i>
              </div>

              {!collapsed && (
                <div className="sidebar-text">
                  <div className="fw-bold text-white fs-6" style={{ letterSpacing: '0.01em', lineHeight: 1.2 }}>
                    MentorMind AI
                  </div>
                  <div className="gov-official-tag text-uppercase fw-semibold" style={{ fontSize: '0.62rem', color: 'var(--gov-gold)' }}>
                    National Skill Registry
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn btn-sm text-secondary d-none d-lg-block border-0"
              onClick={() => setCollapsed(!collapsed)}
              title="Toggle Navigation"
              style={{ color: '#94A3B8' }}
              aria-label="Toggle Sidebar"
            >
              <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'} fs-6`}></i>
            </button>
          </div>

          {/* Official Candidate Registration ID Badge */}
          {!collapsed && (
            <div className="p-2.5 px-3 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.08)', background: '#091526' }}>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary small" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>CANDIDATE REG NO.</span>
                <span className="badge bg-success-subtle text-success py-0 px-1" style={{ fontSize: '0.62rem' }}>VERIFIED</span>
              </div>
              <div className="fw-bold text-white small font-monospace mt-0.5">{candidateId}</div>
            </div>
          )}

          {/* Sidebar Navigation */}
          <div className="sidebar-nav">
            {!collapsed && <div className="nav-section-title">Candidate Intelligence</div>}

            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-house-door-fill"></i>
              <span className="sidebar-text flex-grow-1">Official Dossier</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-person-lines-fill"></i>
              <span className="sidebar-text flex-grow-1">Candidate Profile</span>
            </NavLink>

            <NavLink to="/careers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-compass-fill"></i>
              <span className="sidebar-text flex-grow-1">Career Classifications</span>
            </NavLink>

            {!collapsed && <div className="nav-section-title mt-2">Competency & Assessment</div>}

            <NavLink to="/assessment" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-patch-check-fill"></i>
              <span className="sidebar-text flex-grow-1">Skill Assessment</span>
            </NavLink>

            <NavLink to="/skill-gap" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-bar-chart-steps"></i>
              <span className="sidebar-text flex-grow-1">Skill Gap Analysis</span>
            </NavLink>

            <NavLink to="/roadmap" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-signpost-split-fill"></i>
              <span className="sidebar-text flex-grow-1">Learning Directives</span>
            </NavLink>

            <NavLink to="/resources" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-journal-bookmark-fill"></i>
              <span className="sidebar-text flex-grow-1">National Curricula</span>
            </NavLink>

            {!collapsed && <div className="nav-section-title mt-2">National AI Initiatives</div>}

            <NavLink to="/mentor" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-robot"></i>
              <span className="sidebar-text flex-grow-1">AI Career Advisor</span>
            </NavLink>

            <NavLink to="/peers" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-people-fill"></i>
              <span className="sidebar-text flex-grow-1">Peer Skill Exchange</span>
            </NavLink>

            <NavLink to="/interviews" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-mic-fill"></i>
              <span className="sidebar-text flex-grow-1">Examination Chamber</span>
            </NavLink>

            <NavLink to="/analytics" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-graph-up-arrow"></i>
              <span className="sidebar-text flex-grow-1">Performance Index</span>
            </NavLink>

            <NavLink to="/notifications" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-bell-fill"></i>
              <span className="sidebar-text flex-grow-1">Gazette & Alerts</span>
              {unreadCount > 0 && (
                <span className="badge rounded-pill bg-danger badge-count" style={{ fontSize: '0.68rem' }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>

            <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-gear-fill"></i>
              <span className="sidebar-text flex-grow-1">Security & Settings</span>
            </NavLink>

            {(isAdmin || user?.email === 'admin@mentormind.ai') && (
              <>
                {!collapsed && <div className="nav-section-title mt-2 text-warning">Administration</div>}
                <NavLink to="/admin" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <i className="bi bi-shield-lock-fill text-warning"></i>
                  <span className="sidebar-text flex-grow-1 text-warning fw-bold">Ministry Control</span>
                </NavLink>
              </>
            )}
          </div>

          {/* Footer User Info */}
          {!collapsed && (
            <div className="p-3 border-top mt-auto" style={{ borderColor: 'rgba(255, 255, 255, 0.08)', background: '#061120' }}>
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-1 d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                  style={{ width: 34, height: 34, background: '#1E3A8A', fontSize: '0.85rem' }}
                >
                  {user?.name?.charAt(0) || 'L'}
                </div>
                <div className="overflow-hidden text-truncate flex-grow-1">
                  <div className="fw-bold text-white text-truncate small">{user?.name}</div>
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
                className="btn btn-light d-lg-none border"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle Menu"
              >
                <i className="bi bi-list fs-5"></i>
              </button>

              {/* Official Search */}
              <form onSubmit={handleSearchSubmit} className="d-none d-md-flex position-relative" style={{ width: 340 }}>
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="form-control form-control-sm ps-5 border rounded-2"
                  style={{ background: '#F8FAFC', fontSize: '0.86rem', borderColor: '#CBD5E1' }}
                  placeholder="Search National Skill Standards, Careers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* National Verification Badge */}
              <div className="gov-seal-badge d-none d-sm-flex">
                <i className="bi bi-award-fill text-warning"></i>
                <span>National Standards Compliant</span>
              </div>

              {/* Notifications Icon */}
              <NavLink to="/notifications" className="btn btn-light border position-relative p-2 rounded-2">
                <i className="bi bi-bell fs-5 text-dark"></i>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                    {unreadCount}
                  </span>
                )}
              </NavLink>

              {/* Profile Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-light border d-flex align-items-center gap-2 p-1.5 pe-3 rounded-2"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div
                    className="rounded-1 d-flex align-items-center justify-content-center fw-bold text-white"
                    style={{ width: 30, height: 30, background: '#0F2C59', fontSize: '0.82rem' }}
                  >
                    {user?.name?.charAt(0) || 'L'}
                  </div>
                  <span className="fw-bold d-none d-sm-inline" style={{ fontSize: '0.85rem' }}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <i className="bi bi-chevron-down text-muted" style={{ fontSize: '0.72rem' }}></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border rounded-2 p-2" style={{ minWidth: 220 }}>
                  <li className="px-3 py-2 border-bottom mb-1">
                    <div className="fw-bold text-dark">{user?.name}</div>
                    <div className="text-muted small font-monospace">{candidateId}</div>
                  </li>
                  <li>
                    <NavLink to="/profile" className="dropdown-item py-2 d-flex align-items-center gap-2">
                      <i className="bi bi-person text-primary"></i> Candidate Profile
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/settings" className="dropdown-item py-2 d-flex align-items-center gap-2">
                      <i className="bi bi-gear text-secondary"></i> Security & Password
                    </NavLink>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button onClick={logout} className="dropdown-item py-2 text-danger d-flex align-items-center gap-2">
                      <i className="bi bi-box-arrow-right"></i> Sign Out of Portal
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </header>

          {/* Official Gazette Announcement Ticker */}
          <div className="gov-announcement-ticker">
            <span className="gov-ticker-badge">OFFICIAL GAZETTE</span>
            <div className="text-truncate">
              National Technical Competency Framework v4.2 in effect. Registered Candidate: <strong>{user?.name}</strong> ({candidateId}). Directives synced.
            </div>
          </div>

          {/* Page Body */}
          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
