import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AnalyticsPage = () => {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsAPI.getProgressAnalytics(range);
      if (res.data && res.data.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#16A34A', '#4F46E5', '#94A3B8'];

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Learning & Progress Analytics</h3>
          <p className="text-secondary small mb-0">
            Real-time telemetry tracking study hours, skill progression curves, and interview readiness
          </p>
        </div>

        {/* Time Filter Pills */}
        <div className="btn-group shadow-sm bg-white p-1 rounded-3 border">
          {['7d', '30d', '90d', 'all'].map((r) => (
            <button
              key={r}
              className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-light text-secondary'}`}
              onClick={() => setRange(r)}
            >
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : r === '90d' ? 'Last 90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card p-4 border-0 shadow-sm bg-white">
            <span className="text-muted small fw-semibold">TOTAL STUDY TIME</span>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="fs-2 fw-extrabold text-primary">{data?.summary?.totalHoursStudied || 28}</span>
              <span className="text-muted small">hours logged</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card p-4 border-0 shadow-sm bg-white">
            <span className="text-muted small fw-semibold">ROLE READINESS</span>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="fs-2 fw-extrabold text-success">{data?.summary?.careerReadinessScore || 48}%</span>
              <span className="text-success small fw-medium">+12% gain</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card p-4 border-0 shadow-sm bg-white">
            <span className="text-muted small fw-semibold">ROADMAP TASKS COMPLETED</span>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="fs-2 fw-extrabold text-dark">{data?.summary?.totalTasksCompleted || 4}</span>
              <span className="text-muted small">milestones</span>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card p-4 border-0 shadow-sm bg-white">
            <span className="text-muted small fw-semibold">ACTIVE LEARNING STREAK</span>
            <div className="d-flex align-items-baseline gap-2 mt-2">
              <span className="fs-2 fw-extrabold text-warning">{data?.summary?.streakDays || 5}</span>
              <span className="text-muted small">consecutive days</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHART 1: Study Hours & Readiness Trajectory */}
      <div className="card p-4 border-0 shadow-sm bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Daily Study Hours & Readiness Growth</h5>
            <span className="small text-muted">Tracking consistency and competency acceleration</span>
          </div>
        </div>

        <div style={{ height: 280, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F7" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="readinessScore"
                name="Career Readiness (%)"
                stroke="#4F46E5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReadiness)"
              />
              <Area
                type="monotone"
                dataKey="studyHours"
                name="Study Hours"
                stroke="#06B6D4"
                strokeWidth={2}
                fill="#ECFEFF"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART 2: Skills Breakdown & Task Distribution */}
      <div className="row g-4 mb-4">
        {/* Skills Mastery Chart */}
        <div className="col-lg-8">
          <div className="card p-4 border-0 shadow-sm bg-white h-100">
            <h5 className="fw-bold text-dark mb-1">Declared & Verified Technical Skills</h5>
            <span className="small text-muted mb-3 d-block">Benchmark scores across your technology stack</span>

            <div style={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.skillsBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F7" />
                  <XAxis dataKey="skill" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                    formatter={(val) => [`${val}%`, 'Proficiency']}
                  />
                  <Bar dataKey="score" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Task Distribution Donut */}
        <div className="col-lg-4">
          <div className="card p-4 border-0 shadow-sm bg-white h-100">
            <h5 className="fw-bold text-dark mb-1">Roadmap Task Status</h5>
            <span className="small text-muted mb-3 d-block">Overall milestone completion</span>

            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.taskStatusDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(data?.taskStatusDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="d-flex justify-content-center gap-3 small mt-2">
              <span className="text-success"><i className="bi bi-circle-fill me-1" style={{ fontSize: 8 }}></i> Completed</span>
              <span className="text-primary"><i className="bi bi-circle-fill me-1" style={{ fontSize: 8 }}></i> In Progress</span>
              <span className="text-secondary"><i className="bi bi-circle-fill me-1" style={{ fontSize: 8 }}></i> To Do</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
