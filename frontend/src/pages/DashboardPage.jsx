import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roadmapAPI, skillGapAPI, assessmentAPI, analyticsAPI } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState(null);
  const [gapReport, setGapReport] = useState(null);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [roadRes, gapRes, assessRes, analRes] = await Promise.allSettled([
          roadmapAPI.getRoadmap(),
          skillGapAPI.getSkillGapReport(),
          assessmentAPI.getMyResults(),
          analyticsAPI.getProgressAnalytics('30d'),
        ]);

        if (roadRes.status === 'fulfilled' && roadRes.value.data.success) {
          setRoadmap(roadRes.value.data.roadmap);
        }
        if (gapRes.status === 'fulfilled' && gapRes.value.data.success) {
          setGapReport(gapRes.value.data.report);
        }
        if (assessRes.status === 'fulfilled' && assessRes.value.data.success) {
          setRecentAssessments(assessRes.value.data.results || []);
        }
        if (analRes.status === 'fulfilled' && analRes.value.data.success) {
          setAnalyticsData(analRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const readinessScore = gapReport?.overallReadinessPercentage || profile?.careerReadinessScore || 48;
  const targetCareerTitle = profile?.targetCareerName || 'Full Stack Developer';
  const candidateId = `MM-IN-2026-${(user?._id || '90412').slice(-5).toUpperCase()}`;

  // Find active phase and next pending task
  let currentPhase = null;
  let nextTask = null;
  if (roadmap && roadmap.phases) {
    currentPhase = roadmap.phases.find(p => p.status === 'in_progress') || roadmap.phases[0];
    if (currentPhase && currentPhase.tasks) {
      nextTask = currentPhase.tasks.find(t => t.status === 'todo' || t.status === 'in_progress') || currentPhase.tasks[0];
    }
  }

  // Skills chart data
  const skillsChartData = profile?.existingTechnicalSkills?.length > 0
    ? profile.existingTechnicalSkills.slice(0, 6).map(s => ({
        name: s.name.length > 10 ? s.name.slice(0, 9) + '..' : s.name,
        score: s.score || 40,
        level: s.proficiencyLevel,
      }))
    : [
        { name: 'JavaScript', score: 65, level: 'Intermediate' },
        { name: 'HTML/CSS', score: 85, level: 'Advanced' },
        { name: 'React.js', score: 60, level: 'Intermediate' },
        { name: 'Git/GitHub', score: 70, level: 'Intermediate' },
        { name: 'Python', score: 40, level: 'Basic' },
      ];

  const masteredCount = profile?.existingTechnicalSkills?.filter(s => (s.score || 0) >= 75).length || 2;
  const totalSkillsCount = profile?.existingTechnicalSkills?.length || 5;

  return (
    <div>
      {/* Official Candidate Dossier Header */}
      <div className="card border mb-4 bg-white shadow-sm overflow-hidden">
        <div className="card-header-gov">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-person-vcard fs-5"></i>
            <h5 className="fw-bold mb-0">Candidate Official Dossier & Registration Card</h5>
          </div>
          <span className="gov-verified-pill">
            <i className="bi bi-shield-check"></i> IDENTITY VERIFIED
          </span>
        </div>

        <div className="card-body p-4">
          <div className="row g-4 align-items-center">
            <div className="col-md-8">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
                <h3 className="fw-bold text-dark mb-0">{user?.name}</h3>
                <span className="badge bg-secondary font-monospace" style={{ fontSize: '0.8rem' }}>
                  {candidateId}
                </span>
                <span className="gov-seal-badge">NCS Tier-1 Registered</span>
              </div>

              <div className="row g-2 small text-secondary mt-1">
                <div className="col-sm-6">
                  <span className="text-muted fw-semibold">Target Specialization:</span>{' '}
                  <strong className="text-primary">{targetCareerTitle}</strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted fw-semibold">Institution / Academy:</span>{' '}
                  <strong>{profile?.institution || 'State University of Technology'}</strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted fw-semibold">Educational Degree:</span>{' '}
                  <strong>{profile?.degree || 'B.S. Computer Science'}</strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted fw-semibold">National Percentile:</span>{' '}
                  <span className="text-success fw-bold">Top 16% Nationally</span>
                </div>
              </div>
            </div>

            <div className="col-md-4 text-md-end">
              <div className="d-inline-flex flex-column align-items-md-end gap-2">
                <Link to="/roadmap" className="btn btn-primary btn-sm px-3">
                  <i className="bi bi-signpost-split-fill"></i> View Official Directives
                </Link>
                <Link to="/assessment" className="btn btn-outline-primary btn-sm px-3">
                  <i className="bi bi-patch-check-fill"></i> Take Assessment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-2">
          <div className="card p-3 h-100 border bg-white">
            <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              Registered Skills
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-dark">{totalSkillsCount}</span>
              <span className="small text-muted">evaluated</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card p-3 h-100 border bg-white">
            <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              Ministry Certified
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-success">{masteredCount}</span>
              <span className="small text-success fw-semibold">Verified</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card p-3 h-100 border bg-white">
            <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              Directives Progress
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-primary">{roadmap?.overallProgress || 35}%</span>
              <span className="small text-muted">compliant</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card p-3 h-100 border bg-white">
            <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              Attendance Streak
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-warning">
                <i className="bi bi-award me-1"></i>{profile?.streakDays || 5}
              </span>
              <span className="small text-muted">days logged</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card p-3 h-100 border bg-white">
            <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              Curricula Units
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-dark">{analyticsData?.summary?.totalTasksCompleted || 3}</span>
              <span className="small text-muted">cleared</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card p-3 h-100 border bg-white">
            <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              Assessment Index
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-3 fw-bold text-dark">
                {recentAssessments.length > 0 ? recentAssessments[0].percentage : 82}%
              </span>
              <span className="small text-success fw-bold">Grade A</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: National Readiness Benchmark & Roadmap Preview */}
      <div className="row g-4 mb-4">
        {/* National Readiness Benchmark */}
        <div className="col-lg-5">
          <div className="card border bg-white h-100 shadow-sm">
            <div className="p-3 px-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-speedometer2 text-primary fs-5"></i>
                <h6 className="fw-bold mb-0 text-dark">National Career Readiness Index</h6>
              </div>
              <Link to="/skill-gap" className="small text-primary text-decoration-none fw-bold">
                View Gap Audit <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-4 py-2">
                <div
                  className="rounded-circle d-flex flex-column align-items-center justify-content-center text-center shadow-sm flex-shrink-0"
                  style={{
                    width: 120,
                    height: 120,
                    background: `conic-gradient(#0F2C59 ${readinessScore * 3.6}deg, #E2E8F0 0deg)`,
                    padding: 8,
                  }}
                >
                  <div className="bg-white w-100 h-100 rounded-circle d-flex flex-column align-items-center justify-content-center">
                    <span className="fs-2 fw-extrabold text-primary" style={{ lineHeight: 1 }}>{readinessScore}%</span>
                    <span className="text-muted fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.04em' }}>READINESS</span>
                  </div>
                </div>

                <div>
                  <h6 className="fw-bold text-dark mb-1">{targetCareerTitle}</h6>
                  <p className="text-muted small mb-2" style={{ lineHeight: 1.45 }}>
                    Evaluated against National Occupational Standards (NOS Code: IT-SWE-2026).
                  </p>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="badge bg-success-subtle text-success">
                      {gapReport?.strongSkills?.length || 2} Benchmark Cleared
                    </span>
                    <span className="badge bg-warning-subtle text-warning">
                      {gapReport?.partialSkills?.length || 2} In Development
                    </span>
                    <span className="badge bg-danger-subtle text-danger">
                      {gapReport?.missingSkills?.length || 3} Skill Gap
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-light rounded-2 border mt-3 small text-secondary">
                <i className="bi bi-shield-check text-success me-1"></i>
                <strong>Statutory Standard:</strong> Evaluation calculated from verified technical assessments and coursework completion ratios.
              </div>
            </div>
          </div>
        </div>

        {/* Learning Roadmap Directives Preview */}
        <div className="col-lg-7">
          <div className="card border bg-white h-100 shadow-sm">
            <div className="p-3 px-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <div>
                <span className="badge bg-primary text-white me-2">
                  Phase {currentPhase?.phaseNumber || 2}
                </span>
                <span className="fw-bold text-dark">
                  {currentPhase?.title || 'Phase 2: Core Engineering Specialization'}
                </span>
              </div>
              <Link to="/roadmap" className="btn btn-sm btn-primary px-3">
                Action Directives
              </Link>
            </div>

            <div className="card-body p-4 d-flex flex-column">
              <p className="text-secondary small mb-3">
                {currentPhase?.description || 'Deep-dive into component architecture, backend integration, and state.'}
              </p>

              {nextTask && (
                <div className="p-3 bg-light rounded-2 border mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                      IMMEDIATE PRIORITY DIRECTIVE
                    </span>
                    <span className="badge bg-warning-subtle text-warning">
                      Priority: {nextTask.priority || 'High'}
                    </span>
                  </div>
                  <h6 className="fw-bold text-dark mb-1">{nextTask.topic}</h6>
                  <p className="small text-muted mb-2">{nextTask.description}</p>
                  <div className="d-flex align-items-center gap-3 small text-muted">
                    <span><i className="bi bi-clock me-1"></i> Duration: {nextTask.estimatedHours || 4} hours</span>
                    <span><i className="bi bi-tag me-1"></i> Competency: {nextTask.skillName}</span>
                  </div>
                </div>
              )}

              <div className="mt-auto">
                <div className="d-flex justify-content-between small text-muted mb-1">
                  <span>Phase Compliance Completion</span>
                  <span className="fw-bold text-dark">50%</span>
                </div>
                <div className="progress" style={{ height: 8, background: '#E2E8F0' }}>
                  <div className="progress-bar bg-primary" style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Official Competency Matrix & Ministry Advisory */}
      <div className="row g-4 mb-4">
        {/* Skills Competency Matrix */}
        <div className="col-lg-7">
          <div className="card border bg-white h-100 shadow-sm">
            <div className="p-3 px-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark">National Technical Competency Matrix</h6>
              <Link to="/profile" className="small text-primary text-decoration-none fw-bold">
                Update Records <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="card-body p-4">
              <div style={{ height: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12 }}
                      formatter={(val) => [`${val}%`, 'Competency Score']}
                    />
                    <Bar dataKey="score" fill="#0F2C59" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Ministry Career Advisory & Directives */}
        <div className="col-lg-5">
          <div className="card border bg-white h-100 shadow-sm">
            <div className="p-3 px-4 border-bottom bg-light d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-robot text-primary fs-5"></i>
                <h6 className="fw-bold mb-0 text-dark">Ministry AI Career Advisory</h6>
              </div>
              <span className="badge bg-success text-white">Active</span>
            </div>

            <div className="card-body p-4">
              <div className="p-3 rounded-2 bg-light border mb-3">
                <p className="small text-secondary mb-0" style={{ lineHeight: 1.55 }}>
                  "Candidate has established verified proficiency in frontend state composing. In adherence to National Framework benchmarks for <strong>{targetCareerTitle}</strong>, priority recommendation is completion of <strong>Node.js Server Architecture Unit</strong>."
                </p>
              </div>

              <h6 className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '0.04em', fontSize: '0.72rem' }}>
                Prescribed Candidate Actions
              </h6>
              <div className="d-flex flex-column gap-2">
                <Link to="/assessment" className="d-flex align-items-center justify-content-between p-2.5 rounded-2 border bg-white text-decoration-none text-dark">
                  <div className="d-flex align-items-center gap-2 small">
                    <i className="bi bi-patch-check text-primary"></i>
                    <span>Take JavaScript Core Certification Exam</span>
                  </div>
                  <i className="bi bi-chevron-right text-muted small"></i>
                </Link>

                <Link to="/peers" className="d-flex align-items-center justify-content-between p-2.5 rounded-2 border bg-white text-decoration-none text-dark">
                  <div className="d-flex align-items-center gap-2 small">
                    <i className="bi bi-person-plus text-success"></i>
                    <span>Connect with Peer Maya Chen (94% Compatibility)</span>
                  </div>
                  <i className="bi bi-chevron-right text-muted small"></i>
                </Link>

                <Link to="/interviews" className="d-flex align-items-center justify-content-between p-2.5 rounded-2 border bg-white text-decoration-none text-dark">
                  <div className="d-flex align-items-center gap-2 small">
                    <i className="bi bi-mic text-warning"></i>
                    <span>Enter Examination Chamber (Technical Board)</span>
                  </div>
                  <i className="bi bi-chevron-right text-muted small"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
