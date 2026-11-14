import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { careersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CareerExplorerPage = () => {
  const { profile, refreshProfile } = useAuth();
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
        setTargetMessage(`Target career successfully updated to ${res.data.career.title}. Directives and gap audits recalculated.`);
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
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="gov-seal-badge mb-1">
            <i className="bi bi-card-checklist"></i>
            <span>National Classification Standard</span>
          </div>
          <h3 className="fw-bold text-dark mb-0">National Career Classification Register</h3>
          <p className="text-secondary small mb-0">
            Official benchmark profiles, occupational requirements, and competency standards
          </p>
        </div>

        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
          data-bs-toggle="modal"
          data-bs-target="#compareModal"
        >
          <i className="bi bi-intersect"></i> Comparative Occupational Analysis
        </button>
      </div>

      {targetMessage && (
        <div className="alert alert-success py-2.5 px-3 small mb-3 border-0 rounded-2 shadow-sm d-flex align-items-center gap-2">
          <i className="bi bi-check-circle-fill"></i>
          <span>{targetMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card p-3 border mb-4 bg-white shadow-sm">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                className="form-control form-control-sm ps-5 bg-light"
                placeholder="Search by title, tool, or national occupation code..."
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
                    className={`btn btn-sm ${
                      isSelected ? 'btn-primary' : 'btn-light border text-secondary'
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
                  className={`card p-3.5 border cursor-pointer ${
                    isActive ? 'border-primary bg-light shadow-sm' : 'bg-white'
                  }`}
                  onClick={() => setActiveCareer(c)}
                >
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-2 rounded-1 bg-light text-primary flex-shrink-0 border">
                        <i className={`bi ${c.icon || 'bi-laptop'}`}></i>
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-0">{c.title}</h6>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{c.category}</span>
                      </div>
                    </div>
                    {isTarget && (
                      <span className="badge bg-primary text-white" style={{ fontSize: '0.68rem' }}>
                        Active Target
                      </span>
                    )}
                  </div>

                  <p className="small text-secondary mb-2 mt-2" style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
                    {c.description}
                  </p>

                  <div className="d-flex align-items-center justify-content-between text-muted small border-top pt-2 mt-1" style={{ fontSize: '0.75rem' }}>
                    <span><i className="bi bi-cash me-1"></i> Remuneration: {c.averageSalaryRange}</span>
                    <span className="text-success fw-bold"><i className="bi bi-graph-up-arrow me-1"></i> {c.jobGrowthOutlook}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Career Deep-Dive */}
        <div className="col-lg-7">
          {activeCareer ? (
            <div className="card border bg-white shadow-sm overflow-hidden">
              <div className="card-header-gov">
                <div>
                  <span className="badge bg-warning text-dark me-2 small">NCO-2026-IT</span>
                  <span className="text-white fw-bold">{activeCareer.title}</span>
                </div>
                {profile?.targetCareerName === activeCareer.title ? (
                  <span className="gov-verified-pill bg-white text-dark">
                    <i className="bi bi-check-circle-fill text-success"></i> Registered Target
                  </span>
                ) : (
                  <button
                    className="btn btn-sm btn-warning text-dark fw-bold px-3"
                    onClick={() => handleSetTargetCareer(activeCareer.slug)}
                    disabled={settingTarget}
                  >
                    {settingTarget ? 'Updating Directives...' : 'Designate as My Target Career'}
                  </button>
                )}
              </div>

              <div className="p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-3 border-bottom mb-3 text-secondary small">
                  <div>
                    <i className="bi bi-building me-1"></i> Sector: <strong>{activeCareer.category}</strong>
                  </div>
                  <div>
                    <i className="bi bi-cash me-1"></i> National Band: <strong>{activeCareer.averageSalaryRange}</strong>
                  </div>
                  <div>
                    <i className="bi bi-graph-up me-1"></i> Growth Outlook: <strong>{activeCareer.jobGrowthOutlook}</strong>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark small text-uppercase">Statutory Occupational Overview</h6>
                  <p className="text-secondary small mb-0" style={{ lineHeight: 1.55 }}>{activeCareer.description}</p>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark small text-uppercase mb-2">
                    Prescribed National Competency Standards
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
                        <div key={idx} className="p-2.5 px-3 border rounded-2 bg-light d-flex align-items-center justify-content-between">
                          <div>
                            <span className="fw-bold text-dark small">{reqSkill.name}</span>
                            <span className="text-muted ms-2 small" style={{ fontSize: '0.74rem' }}>
                              Statutory Benchmark: {reqSkill.requiredLevel} ({req}%)
                            </span>
                          </div>
                          <div>
                            {isMet ? (
                              <span className="badge bg-success-subtle text-success">
                                <i className="bi bi-check-circle me-1"></i> Benchmark Cleared ({curr}%)
                              </span>
                            ) : curr > 0 ? (
                              <span className="badge bg-warning-subtle text-warning">
                                In Development ({curr}%)
                              </span>
                            ) : (
                              <span className="badge bg-danger-subtle text-danger">Skill Gap Identified</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark small text-uppercase mb-2">Core Occupational Responsibilities</h6>
                  <ul className="small text-secondary mb-0 ps-3">
                    {activeCareer.responsibilities?.map((resp, i) => (
                      <li key={i} className="mb-1">{resp}</li>
                    ))}
                  </ul>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-2 border h-100">
                      <h6 className="fw-bold text-dark small text-uppercase mb-2">Standard Tools & Stacks</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {activeCareer.toolsAndTechnologies?.map((tool, i) => (
                          <span key={i} className="badge bg-white text-dark border small">{tool}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-2 border h-100">
                      <h6 className="fw-bold text-dark small text-uppercase mb-2">Recognized Credentials</h6>
                      <ul className="small text-secondary mb-0 ps-3">
                        {activeCareer.suggestedCertifications?.map((cert, i) => (
                          <li key={i}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-5 text-center text-muted">Select an occupational profile to inspect details.</div>
          )}
        </div>
      </div>

      {/* COMPARISON MODAL */}
      <div className="modal fade" id="compareModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border shadow rounded-3">
            <div className="modal-header bg-light border-bottom">
              <h5 className="modal-title fw-bold text-dark">Comparative Occupational Benchmarking</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Occupation Profile 1</label>
                  <select
                    className="form-select"
                    value={compareCareer1 || ''}
                    onChange={(e) => setCompareCareer1(e.target.value)}
                  >
                    <option value="">Select first occupation...</option>
                    {careers.map((c) => (
                      <option key={c._id} value={c.slug}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Occupation Profile 2</label>
                  <select
                    className="form-select"
                    value={compareCareer2 || ''}
                    onChange={(e) => setCompareCareer2(e.target.value)}
                  >
                    <option value="">Select second occupation...</option>
                    {careers.map((c) => (
                      <option key={c._id} value={c.slug}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-center mb-3">
                <button
                  className="btn btn-primary px-4 fw-bold"
                  onClick={handleRunComparison}
                  disabled={!compareCareer1 || !compareCareer2 || comparing}
                >
                  {comparing ? 'Analyzing Competency Commonalities...' : 'Execute Comparative Audit'}
                </button>
              </div>

              {comparisonResult && (
                <div className="p-3 bg-light rounded-2 border">
                  <h6 className="fw-bold text-dark mb-2">Comparative Diagnostic Analysis</h6>
                  <p className="small text-secondary mb-3">{comparisonResult.recommendation}</p>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <div className="p-2.5 bg-white rounded-2 border">
                        <strong className="small text-primary d-block mb-1">Common Core Competencies:</strong>
                        <div className="d-flex flex-wrap gap-1">
                          {comparisonResult.commonSkills?.map((s, i) => (
                            <span key={i} className="badge bg-primary text-white small">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-2.5 bg-white rounded-2 border">
                        <strong className="small text-dark d-block mb-1">Specialized Divergences:</strong>
                        <div className="small text-secondary">
                          Distinct architectural and language prerequisites apply.
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
