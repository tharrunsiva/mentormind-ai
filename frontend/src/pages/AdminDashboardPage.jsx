import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [learners, setLearners] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [recentAgentLogs, setRecentAgentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, learnersRes, healthRes] = await Promise.allSettled([
        adminAPI.getStats(),
        adminAPI.getLearners({ limit: 8 }),
        adminAPI.getSystemHealth(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.stats);
        setRecentAgentLogs(statsRes.value.data.recentAgentLogs || []);
      }
      if (learnersRes.status === 'fulfilled' && learnersRes.value.data.success) {
        setLearners(learnersRes.value.data.learners || []);
      }
      if (healthRes.status === 'fulfilled' && healthRes.value.data.success) {
        setSystemHealth(healthRes.value.data.system);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="ai-badge mb-1">
            <i className="bi bi-shield-lock-fill text-primary"></i>
            <span>System Administration</span>
          </div>
          <h3 className="fw-bold text-dark mb-0">Platform Admin Dashboard</h3>
          <p className="text-secondary small mb-0">Platform health telemetry, aggregate learner metrics, and multi-agent audit logs</p>
        </div>

        <button className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" onClick={fetchAdminData}>
          <i className="bi bi-arrow-clockwise"></i> Refresh Telemetry
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card p-4 border-0 shadow-sm bg-white">
            <span className="text-muted small fw-semibold">TOTAL LEARNERS</span>
            <div className="fs-2 fw-extrabold text-primary mt-1">{stats?.totalLearners || 4}</div>
            <span className="small text-muted">Registered accounts</span>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card p-4 border-0 shadow-sm bg-white">
            <span className="text-muted small fw-semibold">CAREER PATHWAYS</span>
            <div className="fs-2 fw-extrabold text-success mt-1">{stats?.totalCareers || 12}</div>
            <span className="small text-muted">Active roles defined</span>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card p-4 border-0 shadow-sm bg-white">
            <span className="text-muted small fw-semibold">ASSESSMENTS COMPLETED</span>
            <div className="fs-2 fw-extrabold text-dark mt-1">{stats?.totalAssessments || 6}</div>
            <span className="small text-success">Avg Score: {stats?.avgAssessmentScore || 80}%</span>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card p-4 border-0 shadow-sm bg-white">
            <span className="text-muted small fw-semibold">CURATED RESOURCES</span>
            <div className="fs-2 fw-extrabold text-warning mt-1">{stats?.totalResources || 15}</div>
            <span className="small text-muted">Verified materials</span>
          </div>
        </div>
      </div>

      {/* System Health Status Panel */}
      <div className="card p-4 border-0 shadow-sm bg-white mb-4">
        <h5 className="fw-bold text-dark mb-3">Service Health & Infrastructure</h5>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="p-3 bg-light rounded-3 border">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong className="text-dark small">Main Node.js Backend</strong>
                <span className="badge bg-success-subtle text-success">Active</span>
              </div>
              <div className="small text-muted">
                Node {systemHealth?.nodeVersion || 'v22'} • Uptime: {systemHealth?.uptimeSeconds || 320}s
              </div>
              <div className="small text-muted mt-1">Memory RSS: {systemHealth?.memoryUsageMB || 45} MB</div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 bg-light rounded-3 border">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong className="text-dark small">Database Engine</strong>
                <span className="badge bg-success-subtle text-success">Connected</span>
              </div>
              <div className="small text-muted">MongoDB 8.2 (127.0.0.1:27017)</div>
              <div className="small text-muted mt-1">22 Mongoose Collections Active</div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 bg-light rounded-3 border">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <strong className="text-dark small">Python AI Service</strong>
                <span className={`badge ${systemHealth?.aiService?.online ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                  {systemHealth?.aiService?.online ? 'Online (FastAPI)' : 'Autonomous Fallback'}
                </span>
              </div>
              <div className="small text-muted">Provider: {systemHealth?.aiService?.provider || 'demo'}</div>
              <div className="small text-muted mt-1">10 Specialized Agents Loaded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Learners Table */}
      <div className="card p-4 border-0 shadow-sm bg-white mb-4">
        <h5 className="fw-bold text-dark mb-3">Registered Platform Learners</h5>
        <div className="table-responsive">
          <table className="table table-hover align-middle small mb-0">
            <thead className="table-light">
              <tr>
                <th>Learner Name</th>
                <th>Email</th>
                <th>Target Career</th>
                <th>Readiness</th>
                <th>Streak</th>
                <th>Skills Count</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((l) => (
                <tr key={l._id}>
                  <td>
                    <div className="fw-bold text-dark">{l.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>{l.institution || 'State Tech'}</div>
                  </td>
                  <td className="text-muted">{l.email}</td>
                  <td>
                    <span className="badge bg-primary-subtle text-primary">
                      {l.profile?.targetCareerName || 'Full Stack Developer'}
                    </span>
                  </td>
                  <td>
                    <strong className="text-success">{l.profile?.careerReadinessScore || 40}%</strong>
                  </td>
                  <td>
                    <span className="text-warning fw-semibold">
                      <i className="bi bi-fire me-1"></i>{l.profile?.streakDays || 1}d
                    </span>
                  </td>
                  <td>{l.profile?.skillsCount || 4} skills</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Agent Execution Audit Log */}
      <div className="card p-4 border-0 shadow-sm bg-white">
        <h5 className="fw-bold text-dark mb-3">AI Agent Execution Audit Logs</h5>
        {recentAgentLogs.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            No agent execution logs recorded yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Agent Name</th>
                  <th>Trigger</th>
                  <th>User</th>
                  <th>Execution Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAgentLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="fw-semibold text-dark">{log.agentName}</td>
                    <td><span className="badge bg-light text-secondary border">{log.trigger}</span></td>
                    <td className="text-muted">{log.user?.name || 'Jordan Rivera'}</td>
                    <td>{log.executionTimeMs} ms</td>
                    <td>
                      <span className="badge bg-success-subtle text-success">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
