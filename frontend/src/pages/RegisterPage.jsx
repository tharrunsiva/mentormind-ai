import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    educationLevel: 'Undergraduate',
    institution: '',
    currentYear: '3rd Year',
    careerStatus: 'Student',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3" style={{ background: 'transparent' }}>
      <Link to="/" className="d-flex align-items-center gap-2.5 mb-4 text-decoration-none">
        <div
          className="d-flex align-items-center justify-content-center text-white rounded-3 shadow"
          style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #4F46E5 0%, #D946EF 100%)' }}
        >
          <i className="bi bi-cpu-fill fs-5"></i>
        </div>
        <span className="fw-extrabold fs-4 text-dark" style={{ letterSpacing: '-0.03em' }}>MentorMind</span>
        <span
          className="badge px-2.5 py-1 rounded-pill text-white"
          style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', fontSize: '0.72rem', fontWeight: 700 }}
        >
          AI
        </span>
      </Link>

      <div className="card landing-card-glass border-0 rounded-4 p-4 p-sm-5 w-100 shadow-lg" style={{ maxWidth: 540 }}>
        <h3 className="fw-extrabold text-dark text-center mb-1">Create Your Account</h3>
        <p className="text-secondary text-center small mb-4">Start your personalized, AI-guided career transformation</p>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Jordan Rivera"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="jordan@domain.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row g-2 mb-3">
            <div className="col-sm-6">
              <label className="form-label small fw-semibold text-dark">Education Level</label>
              <select
                name="educationLevel"
                className="form-select"
                value={formData.educationLevel}
                onChange={handleChange}
              >
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Self-Taught / Bootcamp">Self-Taught / Bootcamp</option>
              </select>
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-semibold text-dark">Current Status</label>
              <select
                name="careerStatus"
                className="form-select"
                value={formData.careerStatus}
                onChange={handleChange}
              >
                <option value="Student">Student</option>
                <option value="Fresh Graduate">Fresh Graduate</option>
                <option value="Career Changer">Career Changer</option>
                <option value="Working Professional">Working Professional</option>
              </select>
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-sm-6">
              <label className="form-label small fw-semibold text-dark">Institution / Org</label>
              <input
                type="text"
                name="institution"
                className="form-control"
                placeholder="e.g. State University"
                value={formData.institution}
                onChange={handleChange}
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-semibold text-dark">Study Year / Exp</label>
              <input
                type="text"
                name="currentYear"
                className="form-control"
                placeholder="e.g. 3rd Year / 1 yr exp"
                value={formData.currentYear}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row g-2 mb-4">
            <div className="col-sm-6">
              <label className="form-label small fw-semibold text-dark">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-semibold text-dark">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Re-type password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-vibrant-primary w-100 py-2.5 mb-3 justify-content-center shadow" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            {loading ? 'Creating Account...' : 'Create Account & Begin Onboarding'}
          </button>
        </form>

        <p className="text-center text-muted small mt-2 mb-0">
          Already have an account?{' '}
          <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#4F46E5' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
