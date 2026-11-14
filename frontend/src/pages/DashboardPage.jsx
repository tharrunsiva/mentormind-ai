import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { roadmapAPI, skillGapAPI, assessmentAPI, analyticsAPI } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const DashboardPage = () => {
  const { user, profile } = useAuth();
  const { isDark } = useTheme();
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

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const readinessScore = gapReport?.overallReadinessPercentage || profile?.careerReadinessScore || 48;
  const targetCareerTitle = profile?.targetCareerName || 'Full Stack Developer';

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

  // Circular Apple Ring calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="fade-in">
      {/* Welcome Header with macOS Style Action Controls */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0" style={{ letterSpacing: '-0.03em' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Learner'}
            </h2>
            <span className="fs-4">👋</span>
          </div>
          <p className="text-secondary mb-0" style={{ fontSize: '0.94rem' }}>
            Tracking your autonomous journey toward{' '}
            <strong className="text-primary">{targetCareerTitle}</strong>.
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/roadmap" className="btn btn-outline-primary d-flex align-items-center gap-2">
            <i className="bi bi-map"></i> View Roadmap
          </Link>
          <Link to="/mentor" className="btn btn-primary d-flex align-items-center gap-2">
            <i className="bi bi-robot"></i> Ask AI Mentor
          </Link>
        </div>
      </div>

      {/* Key Metric Stats Row - macOS Tahoe Frosted Widgets */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-2">
          <div className="card mac-card p-3 h-100 card-hover">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Total Skills
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="fs-3 fw-bold">{totalSkillsCount}</span>
              <span className="small text-success fw-medium">+2 this wk</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card mac-card p-3 h-100 card-hover">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Mastered
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="fs-3 fw-bold text-success">{masteredCount}</span>
              <span className="small text-secondary">&gt; 75% score</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card mac-card p-3 h-100 card-hover">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Roadmap Progress
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="fs-3 fw-bold text-primary">{roadmap?.overallProgress || 35}%</span>
              <span className="small text-secondary">on track</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card mac-card p-3 h-100 card-hover">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Learning Streak
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="fs-3 fw-bold text-warning">
                <i className="bi bi-fire me-1"></i>{profile?.streakDays || 5}
              </span>
              <span className="small text-secondary">days</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card mac-card p-3 h-100 card-hover">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Tasks Completed
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="fs-3 fw-bold">{analyticsData?.summary?.totalTasksCompleted || 3}</span>
              <span className="small text-secondary">modules</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-2">
          <div className="card mac-card p-3 h-100 card-hover">
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Assessment Avg
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="fs-3 fw-bold">
                {recentAssessments.length > 0 ? recentAssessments[0].percentage : 82}%
              </span>
              <span className="small text-success fw-medium">Passing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Career Readiness Ring & Roadmap Preview */}
      <div className="row g-4 mb-4">
        {/* Career Readiness Activity Ring (Apple Watch / macOS Activity Style) */}
        <div className="col-lg-5">
          <div className="card mac-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="mac-traffic-lights me-1">
                  <span className="mac-traffic-dot mac-traffic-close" style={{ width: 8, height: 8 }}></span>
                  <span className="mac-traffic-dot mac-traffic-minimize" style={{ width: 8, height: 8 }}></span>
                  <span className="mac-traffic-dot mac-traffic-zoom" style={{ width: 8, height: 8 }}></span>
                </div>
                <h5 className="fw-bold mb-0">Career Readiness</h5>
              </div>
              <Link to="/skill-gap" className="small text-primary text-decoration-none fw-semibold">
                Full Gap Report <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="d-flex align-items-center gap-4 py-2">
              {/* Apple Activity Style Circular Progress Gauge */}
              <div className="position-relative d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 120, height: 120 }}>
                <svg width="120" height="120" className="mac-progress-ring">
                  <circle
                    className="mac-progress-circle-bg"
                    strokeWidth="10"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                  />
                  <circle
                    className="mac-progress-circle"
                    strokeWidth="10"
                    strokeDasharray={`${circumference} ${circumference}`}
                    style={{ strokeDashoffset }}
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                  />
                </svg>
                <div className="position-absolute text-center">
                  <span className="fs-3 fw-bold text-primary d-block" style={{ lineHeight: 1 }}>{readinessScore}%</span>
                  <span className="text-secondary text-uppercase fw-semibold" style={{ fontSize: '0.62rem' }}>Index</span>
                </div>
              </div>

              <div>
                <h6 className="fw-bold mb-1">{targetCareerTitle}</h6>
                <p className="text-secondary small mb-2" style={{ lineHeight: 1.45 }}>
                  Synthesized across {totalSkillsCount} assessed skills against current industry benchmarks.
                </p>
                <div className="d-flex flex-wrap gap-1">
                  <span className="badge rounded-pill bg-success-subtle text-success">
                    {gapReport?.strongSkills?.length || 2} Strong
                  </span>
                  <span className="badge rounded-pill bg-warning-subtle text-warning">
                    {gapReport?.partialSkills?.length || 2} Developing
                  </span>
                  <span className="badge rounded-pill bg-danger-subtle text-danger">
                    {gapReport?.missingSkills?.length || 3} Missing
                  </span>
                </div>
              </div>
            </div>

            <div
              className="p-3 rounded-3 mt-3 small text-secondary"
              style={{ background: 'rgba(140, 140, 150, 0.08)', border: '1px solid var(--mac-border)' }}
            >
              <i className="bi bi-info-circle text-primary me-1"></i>
              <strong>Transparent Evaluation:</strong> Real-time deterministic weighted ratio based on verified assessment scores and roadmap milestones.
            </div>
          </div>
        </div>

        {/* Learning Roadmap Preview */}
        <div className="col-lg-7">
          <div className="card mac-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span
                  className="badge rounded-pill mb-1"
                  style={{
                    background: 'rgba(0, 113, 227, 0.12)',
                    color: 'var(--mac-blue)',
                    fontWeight: 600,
                  }}
                >
                  Phase {currentPhase?.phaseNumber || 2} in progress
                </span>
                <h5 className="fw-bold mb-0">
                  {currentPhase?.title || 'Phase 2: Core Engineering Specialization'}
                </h5>
              </div>
              <Link to="/roadmap" className="btn btn-sm btn-primary px-3">
                Continue Learning
              </Link>
            </div>

            <p className="text-secondary small mb-3">
              {currentPhase?.description || 'Deep-dive into component architecture, backend integration, and state.'}
            </p>

            {nextTask && (
              <div
                className="p-3 rounded-3 mb-3"
                style={{
                  background: 'rgba(140, 140, 150, 0.06)',
                  border: '1px solid var(--mac-border)',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                    Next Priority Task
                  </span>
                  <span className="badge rounded-pill bg-warning-subtle text-warning" style={{ fontSize: '0.72rem' }}>
                    Priority: {nextTask.priority || 'High'}
                  </span>
                </div>
                <h6 className="fw-bold mb-1">{nextTask.topic}</h6>
                <p className="small text-secondary mb-2">{nextTask.description}</p>
                <div className="d-flex align-items-center gap-3 small text-secondary">
                  <span><i className="bi bi-clock me-1"></i> Est: {nextTask.estimatedHours || 4} hours</span>
                  <span><i className="bi bi-tag me-1"></i> Skill: {nextTask.skillName}</span>
                </div>
              </div>
            )}

            <div className="mt-auto">
              <div className="d-flex justify-content-between small text-secondary mb-1">
                <span>Phase Progress</span>
                <span className="fw-semibold">50%</span>
              </div>
              <div className="progress rounded-pill" style={{ height: 6, background: 'rgba(140, 140, 150, 0.15)' }}>
                <div className="progress-bar rounded-pill bg-primary" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Skill Breakdown Chart & AI Mentor Advice */}
      <div className="row g-4 mb-4">
        {/* Skills Proficiency Chart */}
        <div className="col-lg-7">
          <div className="card mac-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Skill Proficiency Breakdown</h5>
              <Link to="/profile" className="small text-primary text-decoration-none fw-semibold">
                Manage Skills <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div style={{ height: 250, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: isDark ? '#A1A1A6' : '#6E6E73' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: isDark ? '#A1A1A6' : '#6E6E73' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid var(--mac-border)',
                      backgroundColor: isDark ? '#1E1E22' : '#FFFFFF',
                      color: isDark ? '#F5F5F7' : '#1D1D1F',
                      fontSize: 12,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    }}
                    formatter={(val) => [`${val}%`, 'Proficiency Score']}
                  />
                  <Bar dataKey="score" fill="var(--mac-blue)" radius={[8, 8, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Personalized AI Mentor Advice & Action Checklist */}
        <div className="col-lg-5">
          <div className="card mac-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white"
                  style={{
                    width: 32,
                    height: 32,
                    background: 'linear-gradient(135deg, #0071E3 0%, #5856D6 100%)',
                  }}
                >
                  <i className="bi bi-robot fs-6"></i>
                </div>
                <h5 className="fw-bold mb-0">AI Mentor Advice</h5>
              </div>
              <span className="ai-badge">
                <span className="ai-pulse-dot"></span>
                <span>Active</span>
              </span>
            </div>

            <div
              className="p-3 rounded-3 mb-3"
              style={{
                background: 'rgba(0, 113, 227, 0.06)',
                border: '1px solid rgba(0, 113, 227, 0.15)',
              }}
            >
              <p className="small mb-0" style={{ lineHeight: 1.55 }}>
                "Solid progress on React components! In alignment with your goal of <strong>{targetCareerTitle}</strong>, your highest-yield priority right now is <strong>Node.js REST API Architecture</strong>. Connecting with peer <strong>Maya Chen</strong> will accelerate this phase."
              </p>
            </div>

            <h6 className="fw-bold small text-uppercase mb-2 text-secondary" style={{ letterSpacing: '0.04em', fontSize: '0.72rem' }}>
              Recommended Next Actions
            </h6>
            <div className="d-flex flex-column gap-2">
              <Link
                to="/assessment"
                className="d-flex align-items-center justify-content-between p-2.5 rounded-3 text-decoration-none card-hover"
                style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)', color: 'var(--mac-text-primary)' }}
              >
                <div className="d-flex align-items-center gap-2 small">
                  <i className="bi bi-patch-check text-primary fs-6"></i>
                  <span className="fw-medium">Take JavaScript Core Assessment</span>
                </div>
                <i className="bi bi-chevron-right text-secondary small"></i>
              </Link>

              <Link
                to="/peers"
                className="d-flex align-items-center justify-content-between p-2.5 rounded-3 text-decoration-none card-hover"
                style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)', color: 'var(--mac-text-primary)' }}
              >
                <div className="d-flex align-items-center gap-2 small">
                  <i className="bi bi-person-plus text-success fs-6"></i>
                  <span className="fw-medium">Connect with Maya Chen (94% Match)</span>
                </div>
                <i className="bi bi-chevron-right text-secondary small"></i>
              </Link>

              <Link
                to="/interviews"
                className="d-flex align-items-center justify-content-between p-2.5 rounded-3 text-decoration-none card-hover"
                style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)', color: 'var(--mac-text-primary)' }}
              >
                <div className="d-flex align-items-center gap-2 small">
                  <i className="bi bi-mic text-warning fs-6"></i>
                  <span className="fw-medium">Practice Technical Mock Interview</span>
                </div>
                <i className="bi bi-chevron-right text-secondary small"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
