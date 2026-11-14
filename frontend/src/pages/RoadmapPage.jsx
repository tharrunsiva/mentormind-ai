import React, { useState, useEffect } from 'react';
import { roadmapAPI } from '../services/api';
import confetti from 'canvas-confetti';

const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const res = await roadmapAPI.getRoadmap();
      if (res.data && res.data.success) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const res = await roadmapAPI.updateTaskStatus(taskId, newStatus);
      if (res.data && res.data.success) {
        // Update local roadmap state
        setRoadmap((prev) => {
          if (!prev) return prev;
          const updatedPhases = prev.phases.map((ph) => ({
            ...ph,
            tasks: ph.tasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)),
          }));
          return {
            ...prev,
            phases: updatedPhases,
            overallProgress: res.data.overallProgress,
          };
        });

        if (newStatus === 'completed') {
          confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        }
      }
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate your AI roadmap? This will recalculate phases based on your latest skill gap and assessments.')) {
      return;
    }
    setRegenerating(true);
    try {
      const res = await roadmapAPI.generateRoadmap();
      if (res.data && res.data.success) {
        setRoadmap(res.data.roadmap);
        setMessage('Personalized AI roadmap successfully regenerated!');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      alert('Failed to regenerate roadmap: ' + err.message);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted small mt-2">Loading Learning Roadmap...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bold text-dark mb-0">{roadmap?.title || 'Personalized AI Learning Roadmap'}</h3>
            {roadmap?.isAdaptiveAdjusted && (
              <span className="badge bg-info-subtle text-info border">
                <i className="bi bi-cpu me-1"></i> Adaptively Adjusted
              </span>
            )}
          </div>
          <p className="text-secondary small mb-0">
            Target Career: <strong className="text-primary">{roadmap?.careerTitle}</strong> • Overall Completion:{' '}
            <strong>{roadmap?.overallProgress || 0}%</strong>
          </p>
        </div>

        <button
          className="btn btn-outline-primary d-flex align-items-center gap-2"
          onClick={handleRegenerate}
          disabled={regenerating}
        >
          {regenerating ? (
            <span className="spinner-border spinner-border-sm me-1"></span>
          ) : (
            <i className="bi bi-arrow-clockwise"></i>
          )}
          {regenerating ? 'Regenerating...' : 'Regenerate AI Roadmap'}
        </button>
      </div>

      {message && <div className="alert alert-success py-2 px-3 small mb-3">{message}</div>}

      {roadmap?.lastAdaptedReason && (
        <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-info-circle-fill flex-shrink-0 text-primary"></i>
          <span>
            <strong>Adaptive Engine Notice:</strong> {roadmap.lastAdaptedReason}
          </span>
        </div>
      )}

      {/* Overall Progress Bar */}
      <div className="card p-3.5 px-4 border-0 shadow-sm bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="small text-muted fw-semibold">ROADMAP COMPLETION TRAJECTORY</span>
          <span className="fw-bold text-primary">{roadmap?.overallProgress || 0}%</span>
        </div>
        <div className="progress" style={{ height: 10 }}>
          <div
            className="progress-bar bg-primary"
            style={{ width: `${roadmap?.overallProgress || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Interactive Phased Timeline */}
      <div className="d-flex flex-column gap-4">
        {roadmap?.phases?.map((phase) => {
          const isCompleted = phase.status === 'completed';
          const isInProgress = phase.status === 'in_progress';

          return (
            <div key={phase.phaseNumber} className="card border-0 shadow-sm bg-white overflow-hidden">
              {/* Phase Header */}
              <div
                className={`p-3 px-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2 ${
                  isCompleted ? 'bg-success-subtle' : isInProgress ? 'bg-primary-subtle' : 'bg-light'
                }`}
              >
                <div>
                  <span
                    className={`badge me-2 ${
                      isCompleted ? 'bg-success text-white' : isInProgress ? 'bg-primary text-white' : 'bg-secondary text-white'
                    }`}
                  >
                    Phase {phase.phaseNumber}
                  </span>
                  <h5 className="fw-bold text-dark d-inline mb-0">{phase.title}</h5>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted">
                    <i className="bi bi-calendar3 me-1"></i> {phase.estimatedDurationWeeks || 2} weeks
                  </span>
                  <span
                    className={`badge ${
                      isCompleted ? 'bg-success' : isInProgress ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Phase Body */}
              <div className="p-4">
                <p className="text-secondary small mb-3">{phase.description}</p>

                {/* Tasks List */}
                <h6 className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '0.04em' }}>
                  Learning Tasks & Objectives
                </h6>

                <div className="d-flex flex-column gap-2 mb-3">
                  {phase.tasks?.map((t) => {
                    const isTaskDone = t.status === 'completed';
                    const isTaskActive = t.status === 'in_progress';

                    return (
                      <div
                        key={t._id}
                        className={`p-3 rounded-3 border d-flex flex-wrap justify-content-between align-items-center gap-3 transition-all ${
                          isTaskDone ? 'bg-light opacity-75' : 'bg-white card-hover'
                        }`}
                      >
                        <div className="d-flex align-items-start gap-3" style={{ maxWidth: '75%' }}>
                          <button
                            className={`btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5 ${
                              isTaskDone ? 'btn-success text-white' : 'btn-outline-secondary'
                            }`}
                            style={{ width: 24, height: 24 }}
                            onClick={() => handleTaskStatusChange(t._id, isTaskDone ? 'todo' : 'completed')}
                            title={isTaskDone ? 'Mark as incomplete' : 'Mark as completed'}
                          >
                            {isTaskDone && <i className="bi bi-check-lg" style={{ fontSize: '0.75rem' }}></i>}
                          </button>

                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`fw-semibold text-dark ${isTaskDone ? 'text-decoration-line-through text-muted' : ''}`}>
                                {t.topic}
                              </span>
                              <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.7rem' }}>
                                {t.skillName}
                              </span>
                              {t.priority === 'High' && (
                                <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '0.68rem' }}>
                                  High Priority
                                </span>
                              )}
                            </div>
                            <p className="small text-muted mb-1 mt-1">{t.description}</p>

                            {/* Resource Links if available */}
                            {t.resources && t.resources.length > 0 && (
                              <div className="d-flex flex-wrap gap-2 mt-1">
                                {t.resources.map((res, rIdx) => (
                                  <a
                                    key={rIdx}
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="small text-primary text-decoration-none d-inline-flex align-items-center gap-1"
                                    style={{ fontSize: '0.78rem' }}
                                  >
                                    <i className="bi bi-box-arrow-up-right"></i> {res.title} ({res.platform})
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Select */}
                        <div className="d-flex align-items-center gap-2 ms-auto">
                          <span className="small text-muted d-none d-sm-inline">
                            <i className="bi bi-clock me-1"></i> {t.estimatedHours || 4}h
                          </span>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 130 }}
                            value={t.status}
                            onChange={(e) => handleTaskStatusChange(t._id, e.target.value)}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="paused">Paused</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Phase Milestones */}
                {phase.milestones && phase.milestones.length > 0 && (
                  <div className="p-2.5 px-3 bg-light rounded-2 small text-muted">
                    <strong className="text-dark">Phase Milestone Checkpoint: </strong>
                    {phase.milestones.join(' • ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapPage;
