import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roadmapAPI, skillGapAPI, assessmentAPI, analyticsAPI } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

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

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const readinessScore = gapReport?.overallReadinessPercentage || profile?.careerReadinessScore || 48;
  const targetCareerTitle = profile?.targetCareerName || 'Full Stack Developer';

  let currentPhase = null;
  let nextTask = null;
  if (roadmap && roadmap.phases) {
    currentPhase = roadmap.phases.find(p => p.status === 'in_progress') || roadmap.phases[0];
    if (currentPhase && currentPhase.tasks) {
      nextTask = currentPhase.tasks.find(t => t.status === 'todo' || t.status === 'in_progress') || currentPhase.tasks[0];
    }
  }

  // Multi-color palette for chart bars
  const barColors = ['#F59E0B', '#F97316', '#06B6D4', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899'];

  const skillsChartData = profile?.existingTechnicalSkills?.length > 0
    ? profile.existingTechnicalSkills.slice(0, 6).map((s, idx) => ({
        name: s.name.length > 10 ? s.name.slice(0, 9) + '..' : s.name,
        score: s.score || 40,
        level: s.proficiencyLevel,
        color: barColors[idx % barColors.length],
      }))
    : [
        { name: 'JavaScript', score: 65, color: '#F59E0B' },
        { name: 'HTML/CSS', score: 85, color: '#F97316' },
        { name: 'React.js', score: 60, color: '#06B6D4' },
        { name: 'Git/GitHub', score: 70, color: '#8B5CF6' },
        { name: 'Python', score: 40, color: '#3B82F6' },
      ];

  const masteredCount = profile?.existingTechnicalSkills?.filter(s => (s.score || 0) >= 75).length || 2;
  const totalSkillsCount = profile?.existingTechnicalSkills?.length || 5;

  return (
    <div>
      {/* 1. Vibrant Multi-Color Aurora Hero Banner */}
      <div className="vibrant-hero-banner">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 position-relative" style={{ zIndex: 2 }}>
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge rounded-pill bg-white text-dark fw-bold px-3 py-1 shadow-sm" style={{ fontSize: '0.78rem' }}>
                ✨ AI Career Co-Pilot Active
              </span>
              <span className="badge rounded-pill text-white px-3 py-1" style={{ background: 'rgba(255, 255, 255, 0.25)', fontSize: '0.78rem' }}>
                Goal: {targetCareerTitle}
              </span>
            </div>
            <h1 className="fw-extrabold text-white mb-2" style={{ fontSize: '2.2rem', letterSpacing: '-0.03em' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Learner'}! 🚀
            </h1>
            <p className="text-white-50 mb-0" style={{ fontSize: '1.05rem', maxWidth: 600 }}>
              Your personalized learning roadmap is calibrated. Ready to master new skills today?
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2.5">
            <Link
              to="/roadmap"
              className="btn bg-white text-dark fw-bold px-4 py-2.5 rounded-pill shadow"
              style={{ transition: 'all 0.2s ease' }}
            >
              <i className="bi bi-map-fill text-primary me-1.5"></i> Continue Roadmap
            </Link>
            <Link
              to="/mentor"
              className="btn btn-outline-light fw-bold px-4 py-2.5 rounded-pill"
              style={{ borderWidth: 2, transition: 'all 0.2s ease' }}
            >
              <i className="bi bi-robot me-1.5"></i> Ask AI Mentor
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Six Colorful Jewel-Tone Metric Stat Cards */}
      <div className="row g-3 mb-4">
        {/* Stat 1: Total Skills (Electric Indigo) */}
        <div className="col-sm-6 col-lg-2">
          <div className="stat-card-vibrant card-indigo h-100">
            <div className="stat-icon-wrapper stat-icon-indigo">
              <i className="bi bi-cpu-fill"></i>
            </div>
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Total Skills
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-2 fw-extrabold text-dark">{totalSkillsCount}</span>
              <span className="badge rounded-pill bg-indigo-subtle text-primary fw-bold" style={{ fontSize: '0.72rem', background: '#EEF2FF' }}>
                +2 new
              </span>
            </div>
          </div>
        </div>

        {/* Stat 2: Skills Mastered (Vibrant Emerald) */}
        <div className="col-sm-6 col-lg-2">
          <div className="stat-card-vibrant card-emerald h-100">
            <div className="stat-icon-wrapper stat-icon-emerald">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Mastered
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-2 fw-extrabold text-success">{masteredCount}</span>
              <span className="small text-secondary fw-medium">&gt;75% score</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Roadmap Progress (Neon Berry Purple) */}
        <div className="col-sm-6 col-lg-2">
          <div className="stat-card-vibrant card-purple h-100">
            <div className="stat-icon-wrapper stat-icon-purple">
              <i className="bi bi-signpost-2-fill"></i>
            </div>
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Roadmap
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-2 fw-extrabold" style={{ color: '#8B5CF6' }}>
                {roadmap?.overallProgress || 35}%
              </span>
              <span className="small text-secondary fw-medium">on track</span>
            </div>
          </div>
        </div>

        {/* Stat 4: Learning Streak (Sunset Flame Amber) */}
        <div className="col-sm-6 col-lg-2">
          <div className="stat-card-vibrant card-amber h-100">
            <div className="stat-icon-wrapper stat-icon-amber">
              <i className="bi bi-fire"></i>
            </div>
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Streak
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-2 fw-extrabold text-warning">
                {profile?.streakDays || 5}
              </span>
              <span className="small text-secondary fw-medium">days 🔥</span>
            </div>
          </div>
        </div>

        {/* Stat 5: Tasks Cleared (Sky Cyan) */}
        <div className="col-sm-6 col-lg-2">
          <div className="stat-card-vibrant card-cyan h-100">
            <div className="stat-icon-wrapper stat-icon-cyan">
              <i className="bi bi-layers-fill"></i>
            </div>
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Modules Done
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-2 fw-extrabold" style={{ color: '#06B6D4' }}>
                {analyticsData?.summary?.totalTasksCompleted || 3}
              </span>
              <span className="small text-secondary fw-medium">modules</span>
            </div>
          </div>
        </div>

        {/* Stat 6: Assessment Score (Hot Rose Pink) */}
        <div className="col-sm-6 col-lg-2">
          <div className="stat-card-vibrant card-rose h-100">
            <div className="stat-icon-wrapper stat-icon-rose">
              <i className="bi bi-award-fill"></i>
            </div>
            <div className="text-secondary small fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
              Avg Score
            </div>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <span className="fs-2 fw-extrabold" style={{ color: '#F43F5E' }}>
                {recentAssessments.length > 0 ? recentAssessments[0].percentage : 82}%
              </span>
              <span className="small text-success fw-bold">Passing</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Rainbow Readiness Ring & Roadmap Preview */}
      <div className="row g-4 mb-4">
        {/* Rainbow Career Readiness Indicator */}
        <div className="col-lg-5">
          <div className="card p-4 border-0 shadow-sm bg-white h-100 rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="p-2 rounded-3 text-white" style={{ background: 'var(--grad-berry)', width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-speedometer2"></i>
                </span>
                <h5 className="fw-bold text-dark mb-0">Career Readiness Score</h5>
              </div>
              <Link to="/skill-gap" className="small fw-bold text-decoration-none" style={{ color: '#8B5CF6' }}>
                Full Audit <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="d-flex align-items-center gap-4 py-2">
              {/* Colorful Conic Gradient Gauge */}
              <div className="rainbow-meter-wrapper flex-shrink-0">
                <div className="rainbow-meter-inner">
                  <span className="fs-2 fw-extrabold text-primary" style={{ lineHeight: 1 }}>{readinessScore}%</span>
                  <span className="text-secondary text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>Index</span>
                </div>
              </div>

              <div>
                <h6 className="fw-bold text-dark mb-1">{targetCareerTitle}</h6>
                <p className="text-muted small mb-2" style={{ lineHeight: 1.45 }}>
                  Calculated against industry benchmark requirements for {targetCareerTitle}.
                </p>
                <div className="d-flex flex-wrap gap-1">
                  <span className="badge-glow badge-glow-emerald">
                    <i className="bi bi-check-circle-fill"></i> {gapReport?.strongSkills?.length || 2} Strong
                  </span>
                  <span className="badge-glow badge-glow-amber">
                    <i className="bi bi-lightning-charge-fill"></i> {gapReport?.partialSkills?.length || 2} Developing
                  </span>
                  <span className="badge-glow badge-glow-pink">
                    <i className="bi bi-exclamation-triangle-fill"></i> {gapReport?.missingSkills?.length || 3} Missing
                  </span>
                </div>
              </div>
            </div>

            <div
              className="p-3 rounded-3 mt-3 small"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                color: '#475569',
              }}
            >
              <i className="bi bi-stars text-primary me-1"></i>
              <strong>Dynamic AI Scoring:</strong> Updates automatically after each skill assessment, interview round, and roadmap task completion.
            </div>
          </div>
        </div>

        {/* Learning Roadmap Preview */}
        <div className="col-lg-7">
          <div className="card p-4 border-0 shadow-sm bg-white h-100 rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span
                  className="badge rounded-pill mb-1 text-white"
                  style={{ background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)', fontSize: '0.74rem', fontWeight: 700 }}
                >
                  Phase {currentPhase?.phaseNumber || 2} in progress
                </span>
                <h5 className="fw-bold text-dark mb-0">
                  {currentPhase?.title || 'Phase 2: Core Engineering Specialization'}
                </h5>
              </div>
              <Link to="/roadmap" className="btn btn-vibrant-primary btn-sm px-3.5">
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
                  background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                    NEXT RECOMMENDED TASK
                  </span>
                  <span className="badge rounded-pill bg-warning-subtle text-warning fw-bold" style={{ fontSize: '0.72rem' }}>
                    Priority: {nextTask.priority || 'High'}
                  </span>
                </div>
                <h6 className="fw-bold text-dark mb-1">{nextTask.topic}</h6>
                <p className="small text-secondary mb-2">{nextTask.description}</p>
                <div className="d-flex align-items-center gap-3 small text-secondary">
                  <span><i className="bi bi-clock-fill text-primary me-1"></i> Est: {nextTask.estimatedHours || 4} hours</span>
                  <span><i className="bi bi-tag-fill text-success me-1"></i> Skill: {nextTask.skillName}</span>
                </div>
              </div>
            )}

            <div className="mt-auto">
              <div className="d-flex justify-content-between small text-secondary mb-1">
                <span>Phase Progress</span>
                <span className="fw-bold text-dark">50% Completed</span>
              </div>
              <div className="progress rounded-pill" style={{ height: 8, background: '#F1F5F9' }}>
                <div
                  className="progress-bar rounded-pill"
                  style={{
                    width: '50%',
                    background: 'linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%)',
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Multi-Colored Skill Breakdown Chart & AI Mentor Advice */}
      <div className="row g-4 mb-4">
        {/* Multi-Colored Skills Proficiency Chart */}
        <div className="col-lg-7">
          <div className="card p-4 border-0 shadow-sm bg-white h-100 rounded-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="p-2 rounded-3 text-white" style={{ background: 'var(--grad-sunset)', width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-bar-chart-fill"></i>
                </span>
                <h5 className="fw-bold text-dark mb-0">Multi-Skill Proficiency Matrix</h5>
              </div>
              <Link to="/profile" className="small fw-bold text-decoration-none text-primary">
                Manage Skills <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div style={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsChartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.1)' }}
                    formatter={(val) => [`${val}%`, 'Proficiency Score']}
                  />
                  <Bar dataKey="score" radius={[8, 8, 2, 2]}>
                    {skillsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Personalized AI Mentor Advice & Next Actions */}
        <div className="col-lg-5">
          <div className="card p-4 border-0 shadow-sm bg-white h-100 rounded-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white"
                  style={{
                    width: 36,
                    height: 36,
                    background: 'var(--grad-aurora)',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  <i className="bi bi-robot fs-5"></i>
                </div>
                <h5 className="fw-bold text-dark mb-0">AI Mentor Advice</h5>
              </div>
              <span className="badge-glow badge-glow-indigo">
                <span className="spinner-grow spinner-grow-sm text-primary" style={{ width: 6, height: 6 }} role="status"></span>
                <span>Real-Time</span>
              </span>
            </div>

            <div
              className="p-3 rounded-3 mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(217, 70, 239, 0.08) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <p className="small text-dark mb-0" style={{ lineHeight: 1.55 }}>
                "Great work on React state management! For your goal of <strong>{targetCareerTitle}</strong>, your highest-yield priority right now is <strong>Node.js & Express RESTful APIs</strong>. Connecting with peer <strong>Maya Chen</strong> will speed up this phase."
              </p>
            </div>

            <h6 className="fw-bold text-secondary small text-uppercase mb-2" style={{ letterSpacing: '0.04em', fontSize: '0.72rem' }}>
              Actionable Next Steps
            </h6>
            <div className="d-flex flex-column gap-2">
              <Link
                to="/assessment"
                className="d-flex align-items-center justify-content-between p-2.5 rounded-3 text-decoration-none border bg-light text-dark"
                style={{ transition: 'all 0.2s ease' }}
              >
                <div className="d-flex align-items-center gap-2 small">
                  <span className="badge rounded-circle p-1.5 text-white" style={{ background: '#10B981' }}>
                    <i className="bi bi-patch-check-fill"></i>
                  </span>
                  <span className="fw-semibold">Take JavaScript Core Assessment</span>
                </div>
                <i className="bi bi-chevron-right text-muted small"></i>
              </Link>

              <Link
                to="/peers"
                className="d-flex align-items-center justify-content-between p-2.5 rounded-3 text-decoration-none border bg-light text-dark"
                style={{ transition: 'all 0.2s ease' }}
              >
                <div className="d-flex align-items-center gap-2 small">
                  <span className="badge rounded-circle p-1.5 text-white" style={{ background: '#06B6D4' }}>
                    <i className="bi bi-people-fill"></i>
                  </span>
                  <span className="fw-semibold">Connect with Maya Chen (94% Match)</span>
                </div>
                <i className="bi bi-chevron-right text-muted small"></i>
              </Link>

              <Link
                to="/interviews"
                className="d-flex align-items-center justify-content-between p-2.5 rounded-3 text-decoration-none border bg-light text-dark"
                style={{ transition: 'all 0.2s ease' }}
              >
                <div className="d-flex align-items-center gap-2 small">
                  <span className="badge rounded-circle p-1.5 text-white" style={{ background: '#F59E0B' }}>
                    <i className="bi bi-mic-fill"></i>
                  </span>
                  <span className="fw-semibold">Practice Technical Mock Interview</span>
                </div>
                <i className="bi bi-chevron-right text-muted small"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
