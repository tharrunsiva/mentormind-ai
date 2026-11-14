import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@mentormind.ai');
      setPassword('AdminPassword123!');
    } else {
      setEmail('demo@mentormind.ai');
      setPassword('Password123!');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5 px-3">
      <Link to="/" className="d-flex align-items-center gap-2 mb-4 text-decoration-none">
        <div className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
          <i className="bi bi-cpu-fill fs-5"></i>
        </div>
        <span className="fw-bold fs-4 text-dark" style={{ letterSpacing: '-0.03em' }}>MentorMind</span>
        <span className="badge bg-primary-subtle text-primary">AI</span>
      </Link>

      <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white w-100" style={{ maxWidth: 460 }}>
        <h3 className="fw-bold text-dark text-center mb-1">Welcome Back</h3>
        <p className="text-secondary text-center small mb-4">Log in to continue your career development journey</p>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-dark">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label small fw-semibold text-dark mb-0">Password</label>
              <Link to="/forgot-password" className="small text-primary text-decoration-none">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2.5 mb-3" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Fill Buttons */}
        <div className="border-top pt-3 mt-2">
          <div className="text-muted small text-center mb-2 fw-medium">Quick Demo Access:</div>
          <div className="d-flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo('learner')}
              className="btn btn-sm btn-outline-secondary w-50 py-1.5"
            >
              <i className="bi bi-person me-1"></i> Demo Learner
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="btn btn-sm btn-outline-secondary w-50 py-1.5"
            >
              <i className="bi bi-shield-lock me-1"></i> Demo Admin
            </button>
          </div>
        </div>

        <p className="text-center text-muted small mt-4 mb-0">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary fw-semibold text-decoration-none">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
