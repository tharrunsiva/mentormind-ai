import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [demoResetToken, setDemoResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      if (res.data.success) {
        setMessage('Reset instructions generated.');
        if (res.data.resetToken) {
          setDemoResetToken(res.data.resetToken);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.resetPassword({
        resetToken: demoResetToken,
        newPassword,
      });
      if (res.data.success) {
        setResetSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5 px-3">
      <Link to="/" className="d-flex align-items-center gap-2 mb-4 text-decoration-none">
        <div className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
          <i className="bi bi-cpu-fill fs-5"></i>
        </div>
        <span className="fw-bold fs-4 text-dark">MentorMind</span>
        <span className="badge bg-primary-subtle text-primary">AI</span>
      </Link>

      <div className="card border-0 shadow-sm rounded-4 p-4 p-sm-5 bg-white w-100" style={{ maxWidth: 460 }}>
        <h3 className="fw-bold text-dark text-center mb-1">Reset Password</h3>
        <p className="text-secondary text-center small mb-4">Enter your registered email address</p>

        {error && <div className="alert alert-danger py-2 px-3 small mb-3">{error}</div>}
        {message && <div className="alert alert-success py-2 px-3 small mb-3">{message}</div>}

        {!demoResetToken ? (
          <form onSubmit={handleRequestReset}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark">Account Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2.5 mb-3" disabled={loading}>
              {loading ? 'Generating...' : 'Send Reset Link'}
            </button>
          </form>
        ) : !resetSuccess ? (
          <form onSubmit={handleApplyReset}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark">Demo Reset Token</label>
              <input type="text" className="form-control" value={demoResetToken} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-dark">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2.5 mb-3" disabled={loading}>
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        ) : (
          <div className="text-center py-3">
            <i className="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
            <h5 className="fw-bold text-dark">Password Updated!</h5>
            <p className="text-muted small">You can now sign in with your updated credentials.</p>
            <Link to="/login" className="btn btn-primary w-100 mt-2">
              Proceed to Login
            </Link>
          </div>
        )}

        <div className="text-center mt-3">
          <Link to="/login" className="small text-muted text-decoration-none">
            <i className="bi bi-arrow-left me-1"></i> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
