import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationAPI.getNotifications();
      if (res.data && res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (id === 'all' || n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'assessment': return 'bi-patch-check text-primary';
      case 'roadmap': return 'bi-map text-success';
      case 'peer_request': return 'bi-person-plus text-info';
      case 'interview': return 'bi-mic text-warning';
      default: return 'bi-info-circle text-secondary';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Notifications & Activity Feed</h3>
          <p className="text-secondary small mb-0">System updates, peer requests, and roadmap milestone notifications</p>
        </div>

        <button className="btn btn-outline-secondary btn-sm" onClick={() => handleMarkAsRead('all')}>
          <i className="bi bi-check2-all me-1"></i> Mark All as Read
        </button>
      </div>

      <div className="card border-0 shadow-sm bg-white p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="text-muted small mt-2">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-5 text-muted small">
            <i className="bi bi-bell-slash fs-2 mb-2 d-block"></i>
            No notifications right now.
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3 rounded-3 border d-flex align-items-center justify-content-between gap-3 ${
                  n.read ? 'bg-white' : 'bg-light border-primary'
                }`}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="p-2 rounded-2 bg-white border flex-shrink-0">
                    <i className={`bi ${getIcon(n.type)} fs-5`}></i>
                  </div>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="fw-bold text-dark mb-0 small">{n.title}</h6>
                      {!n.read && <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>NEW</span>}
                    </div>
                    <p className="text-muted small mb-0 mt-0.5">{n.message}</p>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {n.link && (
                    <Link to={n.link} className="btn btn-sm btn-outline-primary py-1 px-3">
                      View
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      className="btn btn-sm btn-light border"
                      onClick={() => handleMarkAsRead(n._id)}
                      title="Mark as Read"
                    >
                      <i className="bi bi-check-lg"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
