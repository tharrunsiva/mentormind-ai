import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { careersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const CareerExplorerPage = () => {
  const { profile, refreshProfile } = useAuth();
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeCareer, setActiveCareer] = useState(null);
  const [compareCareer1, setCompareCareer1] = useState(null);
  const [compareCareer2, setCompareCareer2] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [settingTarget, setSettingTarget] = useState(false);
  const [targetMessage, setTargetMessage] = useState('');

  useEffect(() => {
    fetchCareers();
  }, [search, selectedCategory]);

  const fetchCareers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await careersAPI.getAllCareers(params);
      if (res.data && res.data.success) {
        setCareers(res.data.careers);
        if (res.data.careers.length > 0 && !activeCareer) {
          setActiveCareer(res.data.careers[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSetTargetCareer = async (careerSlug) => {
    try {
      setSettingTarget(true);
      const res = await careersAPI.setTargetCareer(careerSlug);
      if (res.data && res.data.success) {
        await refreshProfile();
        setTargetMessage(`Target career updated to ${res.data.career.title}! Skill gaps recalculated.`);
        setTimeout(() => setTargetMessage(''), 4000);
      }
    } catch (err) {
      alert('Failed to set target career: ' + err.message);
    } finally {
      setSettingTarget(false);
    }
  };

  const handleRunComparison = async () => {
    if (!compareCareer1 || !compareCareer2) return;
    setComparing(true);
    try {
      const res = await careersAPI.compareCareers(compareCareer1, compareCareer2);
      if (res.data && res.data.success) {
        setComparisonResult(res.data.comparison);
      }
    } catch (err) {
      alert('Comparison failed: ' + err.message);
    } finally {
      setComparing(false);
    }
  };

  const categories = ['All', 'Software Engineering', 'Web Development', 'Artificial Intelligence', 'Data Science', 'Data & Analytics', 'Cloud & Infrastructure', 'Security', 'Design & Product', 'Mobile Development'];

  return (
    <div className="fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.025em' }}>Career Intelligence Explorer</h3>
          <p className="text-secondary small mb-0">
            Explore industry career paths, benchmark required skills, and run side-by-side comparative readiness analyses
          </p>
        </div>

        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 rounded-pill px-3"
          data-bs-toggle="modal"
          data-bs-target="#compareModal"
        >
          <i className="bi bi-intersect"></i> Compare Two Careers
        </button>
      </div>

      {targetMessage && (
        <div className="alert alert-success py-2.5 px-3 small mb-3 rounded-3 shadow-sm border-0 d-flex align-items-center gap-2">
          <i className="bi bi-check-circle-fill fs-6"></i>
          <span>{targetMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar - macOS Spotlight Capsule Style */}
      <div className="card mac-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="mac-search-capsule w-100">
              <i
                className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3"
                style={{ color: 'var(--mac-text-secondary)', fontSize: '0.85rem' }}
              ></i>
              <input
                type="text"
                className="mac-search-input"
                placeholder="Search title, tech stack, tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-7">
            <div className="d-flex flex-wrap gap-1.5 overflow-x-auto pb-1">
              {categories.slice(0, 6).map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    className={`btn btn-sm rounded-pill text-nowrap px-3 ${
                      isSelected ? 'btn-primary' : 'mac-btn-secondary text-secondary'
                    }`}
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left List + Right Detail View */}
      <div className="row g-4">
        {/* Left Column: Careers List */}
        <div className="col-lg-5">
          <div className="d-flex flex-column gap-3" style={{ maxHeight: 720, overflowY: 'auto' }}>
            {careers.map((c) => {
              const isActive = activeCareer?.slug === c.slug;
              const isTarget = profile?.targetCareerName === c.title;

              return (
                <div
                  key={c._id}
                  className={`card mac-card p-3.5 cursor-pointer card-hover ${
                    isActive ? 'border-primary shadow-md' : ''
                  }`}
                  style={{
                    background: isActive ? 'rgba(0, 113, 227, 0.08)' : 'var(--mac-surface)',
                    borderColor: isActive ? 'var(--mac-blue)' : 'var(--mac-border)',
                  }}
                  onClick={() => setActiveCareer(c)}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          background: isActive ? 'var(--mac-blue)' : 'rgba(140, 140, 150, 0.12)',
                          color: isActive ? '#FFFFFF' : 'var(--mac-blue)',
                        }}
                      >
                        <i className={`bi ${c.icon || 'bi-laptop'} fs-6`}></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0" style={{ fontSize: '0.92rem' }}>{c.title}</h6>
                        <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{c.category}</span>
                      </div>
                    </div>
                    {isTarget && (
                      <span className="badge rounded-pill bg-primary text-white" style={{ fontSize: '0.68rem' }}>
                        Your Target
                      </span>
                    )}
                  </div>

                  <p className="small text-secondary mb-2 mt-2" style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
                    {c.description}
                  </p>

                  <div
                    className="d-flex align-items-center justify-content-between text-secondary small border-top pt-2 mt-1"
                    style={{ fontSize: '0.75rem', borderColor: 'var(--mac-border)' }}
                  >
                    <span><i className="bi bi-cash me-1"></i> {c.averageSalaryRange}</span>
                    <span className="text-success fw-medium"><i className="bi bi-graph-up-arrow me-1"></i> {c.jobGrowthOutlook}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Career Deep-Dive */}
        <div className="col-lg-7">
          {activeCareer ? (
            <div className="card mac-card p-4 shadow-lg">
              {/* macOS Preview Header */}
              <div
                className="d-flex flex-wrap justify-content-between align-items-start gap-3 pb-3 border-bottom mb-3"
                style={{ borderColor: 'var(--mac-border)' }}
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div className="mac-traffic-lights me-1">
                      <span className="mac-traffic-dot mac-traffic-close"></span>
                      <span className="mac-traffic-dot mac-traffic-minimize"></span>
                      <span className="mac-traffic-dot mac-traffic-zoom"></span>
                    </div>
                    <span className="badge rounded-pill bg-light text-secondary border small">{activeCareer.category}</span>
                  </div>
                  <h4 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>{activeCareer.title}</h4>
                  <div className="small text-secondary">
                    <i className="bi bi-cash me-1"></i> {activeCareer.averageSalaryRange} • {activeCareer.jobGrowthOutlook}
                  </div>
                </div>

                <div>
                  {profile?.targetCareerName === activeCareer.title ? (
                    <span className="badge rounded-pill bg-success-subtle text-success fs-6 px-3 py-2">
                      <i className="bi bi-check-circle-fill me-1"></i> Current Target Career
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary px-3 py-2 fw-semibold rounded-pill"
                      onClick={() => handleSetTargetCareer(activeCareer.slug)}
                      disabled={settingTarget}
                    >
                      {settingTarget ? 'Updating Roadmap...' : 'Set as My Target Career'}
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h6 className="fw-bold small text-uppercase text-secondary" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>Role Overview</h6>
                <p className="text-secondary small mb-0" style={{ lineHeight: 1.55 }}>{activeCareer.description}</p>
              </div>

              {/* Required Technical Skills */}
              <div className="mb-4">
                <h6 className="fw-bold small text-uppercase text-secondary mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                  Required Technical Competencies
                </h6>
                <div className="d-flex flex-column gap-2">
                  {activeCareer.requiredTechnicalSkills?.map((reqSkill, idx) => {
                    const userSkill = profile?.existingTechnicalSkills?.find(
                      (s) => s.name.toLowerCase() === reqSkill.name.toLowerCase()
                    );
                    const curr = userSkill?.score || 0;
                    const req = reqSkill.minProficiencyValue || 75;
                    const isMet = curr >= req;

                    return (
                      <div
                        key={idx}
                        className="p-2.5 px-3 rounded-3 d-flex align-items-center justify-content-between"
                        style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
                      >
                        <div>
                          <span className="fw-semibold small">{reqSkill.name}</span>
                          <span className="text-secondary ms-2 small" style={{ fontSize: '0.74rem' }}>
                            Required: {reqSkill.requiredLevel} ({req}%)
                          </span>
                        </div>
                        <div>
                          {isMet ? (
                            <span className="badge rounded-pill bg-success-subtle text-success">
                              <i className="bi bi-check-circle me-1"></i> Ready ({curr}%)
                            </span>
                          ) : curr > 0 ? (
                            <span className="badge rounded-pill bg-warning-subtle text-warning">
                              Developing ({curr}%)
                            </span>
                          ) : (
                            <span className="badge rounded-pill bg-danger-subtle text-danger">Missing</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Responsibilities */}
              <div className="mb-4">
                <h6 className="fw-bold small text-uppercase text-secondary mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                  Core Responsibilities
                </h6>
                <ul className="small text-secondary mb-0 ps-3">
                  {activeCareer.responsibilities?.map((resp, i) => (
                    <li key={i} className="mb-1">{resp}</li>
                  ))}
                </ul>
              </div>

              {/* Tools & Example Projects */}
              <div className="row g-3">
                <div className="col-md-6">
                  <div
                    className="p-3 rounded-3 h-100"
                    style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
                  >
                    <h6 className="fw-bold small text-uppercase text-secondary mb-2" style={{ fontSize: '0.7rem' }}>Industry Tools</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {activeCareer.toolsAndTechnologies?.map((tool, i) => (
                        <span key={i} className="badge rounded-pill bg-light text-secondary border small">{tool}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div
                    className="p-3 rounded-3 h-100"
                    style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
                  >
                    <h6 className="fw-bold small text-uppercase text-secondary mb-2" style={{ fontSize: '0.7rem' }}>Recommended Certs</h6>
                    <ul className="small text-secondary mb-0 ps-3">
                      {activeCareer.suggestedCertifications?.map((cert, i) => (
                        <li key={i}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card mac-card p-5 text-center text-secondary">Select a career to view details.</div>
          )}
        </div>
      </div>

      {/* COMPARISON MODAL */}
      <div className="modal fade" id="compareModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content rounded-4 p-3 shadow-lg"
            style={{
              background: 'var(--mac-surface-elevated)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--mac-border)',
              color: 'var(--mac-text-primary)',
            }}
          >
            <div className="modal-header border-0 pb-0">
              <div className="d-flex align-items-center gap-2">
                <div className="mac-traffic-lights">
                  <span className="mac-traffic-dot mac-traffic-close" data-bs-dismiss="modal"></span>
                  <span className="mac-traffic-dot mac-traffic-minimize"></span>
                  <span className="mac-traffic-dot mac-traffic-zoom"></span>
                </div>
                <h5 className="modal-title fw-bold ms-2">Career Comparison Suite</h5>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body py-3">
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Career 1</label>
                  <select
                    className="form-select rounded-3"
                    style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)', color: 'var(--mac-text-primary)' }}
                    value={compareCareer1 || ''}
                    onChange={(e) => setCompareCareer1(e.target.value)}
                  >
                    <option value="">Select first career...</option>
                    {careers.map((c) => (
                      <option key={c._id} value={c.slug}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Career 2</label>
                  <select
                    className="form-select rounded-3"
                    style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)', color: 'var(--mac-text-primary)' }}
                    value={compareCareer2 || ''}
                    onChange={(e) => setCompareCareer2(e.target.value)}
                  >
                    <option value="">Select second career...</option>
                    {careers.map((c) => (
                      <option key={c._id} value={c.slug}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-center mb-3">
                <button
                  className="btn btn-primary px-4 rounded-pill fw-semibold"
                  onClick={handleRunComparison}
                  disabled={!compareCareer1 || !compareCareer2 || comparing}
                >
                  {comparing ? 'Analyzing Commonalities & Gaps...' : 'Run Comparative Analysis'}
                </button>
              </div>

              {comparisonResult && (
                <div
                  className="p-3 rounded-3"
                  style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
                >
                  <h6 className="fw-bold mb-2">Comparison Diagnostic</h6>
                  <p className="small text-secondary mb-3">{comparisonResult.recommendation}</p>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <div
                        className="p-2.5 rounded-3"
                        style={{ background: 'rgba(0, 113, 227, 0.06)', border: '1px solid rgba(0, 113, 227, 0.15)' }}
                      >
                        <strong className="small text-primary d-block mb-1">Common Core Skills:</strong>
                        <div className="d-flex flex-wrap gap-1">
                          {comparisonResult.commonSkills?.map((s, i) => (
                            <span key={i} className="badge rounded-pill bg-primary text-white small">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div
                        className="p-2.5 rounded-3"
                        style={{ background: 'rgba(140, 140, 150, 0.08)', border: '1px solid var(--mac-border)' }}
                      >
                        <strong className="small text-secondary d-block mb-1">Diverging Specializations:</strong>
                        <div className="small text-secondary">
                          Differentiation across architecture, languages, and tooling.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerExplorerPage;
