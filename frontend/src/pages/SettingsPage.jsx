import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';

const SettingsPage = () => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const [isPublic, setIsPublic] = useState(profile?.isPublicProfile ?? true);
  const [savedMessage, setSavedMessage] = useState('');

  const handleTogglePrivacy = async () => {
    try {
      const nextVal = !isPublic;
      setIsPublic(nextVal);
      await profileAPI.updateProfile({ isPublicProfile: nextVal });
      await refreshProfile();
      setSavedMessage('Privacy preferences updated.');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (e) {
      alert('Failed to update preferences: ' + e.message);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Account & Platform Settings</h3>
        <p className="text-secondary small mb-0">Manage profile visibility, notification preferences, and system telemetry</p>
      </div>

      {savedMessage && <div className="alert alert-success py-2 px-3 small mb-3">{savedMessage}</div>}

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Privacy & Profile Settings */}
          <div className="card p-4 border-0 shadow-sm bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">Privacy & Collaboration</h5>

            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0 small">Discoverable in Peer Skill Matching</h6>
                <p className="text-muted small mb-0">
                  Allow other learners to discover your profile and invite you to collaborate.
                </p>
              </div>
              <div className="form-check form-switch fs-5">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={isPublic}
                  onChange={handleTogglePrivacy}
                />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border">
              <div>
                <h6 className="fw-bold text-dark mb-0 small">Automated Adaptive Alerts</h6>
                <p className="text-muted small mb-0">
                  Receive recommendations when assessment scores suggest prerequisite revision.
                </p>
              </div>
              <div className="form-check form-switch fs-5">
                <input type="checkbox" className="form-check-input" defaultChecked readOnly />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="card p-4 border-0 shadow-sm bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">Account Security</h5>
            <div className="small text-muted mb-2">
              <strong>Email Address: </strong> {user?.email}
            </div>
            <div className="small text-muted mb-3">
              <strong>Account Role: </strong> <span className="badge bg-secondary-subtle text-secondary">{user?.role}</span>
            </div>
            <button className="btn btn-outline-danger btn-sm" onClick={logout}>
              <i className="bi bi-box-arrow-right me-1"></i> Sign Out of MentorMind AI
            </button>
          </div>
        </div>

        {/* System Architecture Telemetry */}
        <div className="col-lg-4">
          <div className="card p-4 border-0 shadow-sm bg-white">
            <h6 className="fw-bold text-dark small text-uppercase mb-3">System Architecture Info</h6>

            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Platform</span>
                <span className="fw-bold text-dark">MentorMind AI v1.0</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Node Backend</span>
                <span className="text-success fw-semibold"><i className="bi bi-check-circle-fill me-1"></i> Express (Port 5000)</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">Database</span>
                <span className="text-success fw-semibold"><i className="bi bi-check-circle-fill me-1"></i> MongoDB (Port 27017)</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom">
                <span className="text-muted">AI Service</span>
                <span className="text-success fw-semibold"><i className="bi bi-check-circle-fill me-1"></i> FastAPI (Port 8000)</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">AI Agents</span>
                <span className="badge bg-primary">10 Agents Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
