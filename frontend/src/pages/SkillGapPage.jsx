import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillGapAPI } from '../services/api';

const SkillGapPage = () => {
  const [report, setReport] = useState(null);
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await skillGapAPI.getSkillGapReport();
        if (res.data && res.data.success) {
          setReport(res.data.report);
          setCareer(res.data.career);
        }
      } catch (err) {
        console.error('Failed to load gap report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted small mt-2">Computing Skill Gap Analysis...</div>
      </div>
    );
  }

  const readiness = report?.overallReadinessPercentage || 45;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">AI Skill Gap Analysis</h3>
          <p className="text-secondary small mb-0">
            Target Role: <strong className="text-primary">{report?.careerTitle || 'Full Stack Developer'}</strong>
          </p>
        </div>

        <Link to="/roadmap" className="btn btn-primary d-flex align-items-center gap-2">
          <i className="bi bi-map"></i> View Adaptive Roadmap
        </Link>
      </div>

      {/* Top Readiness Summary Card */}
      <div className="card p-4 border-0 shadow-sm bg-white mb-4">
        <div className="row align-items-center g-4">
          <div className="col-md-3 text-center border-end-md">
            <div
              className="rounded-circle d-inline-flex flex-column align-items-center justify-content-center shadow-sm"
              style={{
                width: 130,
                height: 130,
                background: `conic-gradient(var(--primary) ${readiness * 3.6}deg, #E2E8F0 0deg)`,
                padding: 8,
              }}
            >
              <div className="bg-white w-100 h-100 rounded-circle d-flex flex-column align-items-center justify-content-center">
                <span className="fs-2 fw-extrabold text-primary">{readiness}%</span>
                <span className="text-muted" style={{ fontSize: '0.65rem' }}>READINESS</span>
              </div>
            </div>
            <div className="fw-bold text-dark mt-2">Overall Role Readiness</div>
          </div>

          <div className="col-md-9">
            <h5 className="fw-bold text-dark mb-2">Diagnostic Summary</h5>
            <p className="text-secondary small mb-3">
              Skill gap is evaluated deterministically using: <br />
              <code className="bg-light px-2 py-1 rounded text-primary">Skill Gap = Required Score - Current Score</code>.
              Missing skills are initialized at 0% proficiency with prioritized learning weights.
            </p>

            <div className="row g-2">
              <div className="col-sm-4">
                <div className="p-2.5 bg-success-subtle rounded-3 text-center">
                  <div className="fs-4 fw-bold text-success">{report?.strongSkills?.length || 0}</div>
                  <div className="small fw-semibold text-success">Strong Skills</div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="p-2.5 bg-warning-subtle rounded-3 text-center">
                  <div className="fs-4 fw-bold text-warning">{report?.partialSkills?.length || 0}</div>
                  <div className="small fw-semibold text-warning">Developing Skills</div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="p-2.5 bg-danger-subtle rounded-3 text-center">
                  <div className="fs-4 fw-bold text-danger">{report?.missingSkills?.length || 0}</div>
                  <div className="small fw-semibold text-danger">Missing Skills</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Skills Section */}
      <div className="card p-4 border-0 shadow-sm bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-danger mb-0">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> Missing Skills Requiring Initial Study ({report?.missingSkills?.length || 0})
          </h5>
          <span className="text-muted small">Current Score: 0%</span>
        </div>

        <div className="d-flex flex-column gap-3">
          {report?.missingSkills?.map((ms, idx) => (
            <div key={idx} className="p-3 border rounded-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <span className="fw-bold text-dark">{ms.skillName}</span>
                  <span className={`badge ms-2 ${ms.priority === 'High' ? 'bg-danger' : 'bg-secondary'}`}>
                    {ms.priority} Priority
                  </span>
                </div>
                <span className="small text-muted fw-semibold">Required: {ms.requiredScore}%</span>
              </div>
              <div className="progress mb-2" style={{ height: 8 }}>
                <div className="progress-bar bg-danger" style={{ width: '0%' }}></div>
              </div>
              <div className="d-flex justify-content-between small text-muted">
                <span>Current: 0%</span>
                <span className="text-danger fw-semibold">Gap: -{ms.gap}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partially Developed Skills */}
      <div className="card p-4 border-0 shadow-sm bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-warning mb-0">
            <i className="bi bi-clock-history me-2"></i> Developing Skills ({report?.partialSkills?.length || 0})
          </h5>
          <span className="text-muted small">Close Gaps to Reach Mastery</span>
        </div>

        <div className="d-flex flex-column gap-3">
          {report?.partialSkills?.map((ps, idx) => (
            <div key={idx} className="p-3 border rounded-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold text-dark">{ps.skillName}</span>
                <span className="small text-muted fw-semibold">
                  Current: {ps.currentScore}% / Required: {ps.requiredScore}%
                </span>
              </div>
              <div className="progress mb-2" style={{ height: 8 }}>
                <div
                  className="progress-bar bg-warning"
                  style={{ width: `${(ps.currentScore / ps.requiredScore) * 100}%` }}
                ></div>
              </div>
              <div className="d-flex justify-content-between small text-muted">
                <span className="text-success fw-medium">{ps.currentScore}% Completed</span>
                <span className="text-warning fw-semibold">Remaining Gap: {ps.gap}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strong Skills */}
      <div className="card p-4 border-0 shadow-sm bg-white mb-4">
        <h5 className="fw-bold text-success mb-3">
          <i className="bi bi-patch-check-fill me-2"></i> Strong & Verified Skills ({report?.strongSkills?.length || 0})
        </h5>
        <div className="row g-2">
          {report?.strongSkills?.map((ss, idx) => (
            <div key={idx} className="col-md-6">
              <div className="p-3 border rounded-3 bg-success-subtle d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">{ss.skillName}</span>
                <span className="badge bg-success text-white">Score: {ss.currentScore}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Next Actions */}
      <div className="card p-4 border-0 shadow-sm bg-white">
        <h5 className="fw-bold text-dark mb-3">Actionable Next Steps</h5>
        <div className="d-flex flex-column gap-2">
          {report?.recommendedNextActions?.map((act, i) => (
            <div key={i} className="p-2.5 px-3 rounded-2 bg-light border d-flex align-items-center gap-2 small">
              <i className="bi bi-arrow-right-circle text-primary"></i>
              <span className="text-dark fw-medium">{act}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillGapPage;
