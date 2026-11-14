import React, { useState, useEffect } from 'react';
import { resourcesAPI } from '../services/api';

const ResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [search, selectedPlatform, selectedDifficulty, onlyBookmarks]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      if (onlyBookmarks) {
        const res = await resourcesAPI.getMyBookmarks();
        if (res.data && res.data.success) {
          const list = res.data.bookmarks.map(b => ({
            ...b.resource,
            isBookmarked: true,
          }));
          setResources(list);
        }
      } else {
        const params = {};
        if (search) params.search = search;
        if (selectedPlatform !== 'All') params.platform = selectedPlatform;
        if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;

        const res = await resourcesAPI.getResources(params);
        if (res.data && res.data.success) {
          setResources(res.data.resources);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (resourceId) => {
    try {
      const res = await resourcesAPI.toggleBookmark(resourceId);
      if (res.data && res.data.success) {
        setResources(prev =>
          prev.map(r => r._id === resourceId ? { ...r, isBookmarked: res.data.bookmarked } : r)
        );
      }
    } catch (err) {
      alert('Failed to bookmark: ' + err.message);
    }
  };

  const platforms = ['All', 'Official Docs', 'freeCodeCamp', 'YouTube', 'Interactive', 'MDN', 'Medium'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Curated Learning Resources</h3>
          <p className="text-secondary small mb-0">
            Verified tutorials, official documentation, and project guides matched to your skill gaps
          </p>
        </div>

        <button
          className={`btn btn-sm ${onlyBookmarks ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setOnlyBookmarks(!onlyBookmarks)}
        >
          <i className={`bi ${onlyBookmarks ? 'bi-bookmark-check-fill' : 'bi-bookmark'} me-1`}></i>
          {onlyBookmarks ? 'Showing Bookmarks' : 'My Bookmarks'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-3.5 border-0 shadow-sm bg-white mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                className="form-control form-control-sm ps-5 bg-light border-light"
                placeholder="Search topics, skills, authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-5">
            <div className="d-flex flex-wrap gap-1">
              {platforms.map((p) => (
                <button
                  key={p}
                  className={`btn btn-sm ${selectedPlatform === p ? 'btn-primary' : 'btn-light border text-secondary'}`}
                  style={{ fontSize: '0.75rem' }}
                  onClick={() => setSelectedPlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>Difficulty: {d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="text-muted small mt-2">Loading curated materials...</div>
        </div>
      ) : resources.length === 0 ? (
        <div className="card p-5 text-center text-muted border-0 shadow-sm bg-white">
          <i className="bi bi-search fs-1 mb-2"></i>
          <p className="mb-0">No learning resources matched your criteria. Try adjusting filters.</p>
        </div>
      ) : (
        <div className="row g-3">
          {resources.map((res) => (
            <div key={res._id} className="col-md-6 col-lg-4">
              <div className="card p-4 border-0 shadow-sm h-100 d-flex flex-column justify-content-between card-hover">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary">{res.skillName}</span>
                    <button
                      className="btn btn-sm p-0 border-0"
                      onClick={() => handleToggleBookmark(res._id)}
                      title={res.isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                    >
                      <i className={`bi ${res.isBookmarked ? 'bi-bookmark-fill text-warning' : 'bi-bookmark text-muted'} fs-5`}></i>
                    </button>
                  </div>

                  <h6 className="fw-bold text-dark mb-2" style={{ lineHeight: 1.35 }}>
                    {res.title}
                  </h6>
                  <p className="small text-secondary mb-3 line-clamp-2" style={{ fontSize: '0.82rem' }}>
                    {res.description}
                  </p>
                </div>

                <div>
                  <div className="d-flex align-items-center justify-content-between text-muted small border-top pt-2 mb-3" style={{ fontSize: '0.75rem' }}>
                    <span><i className="bi bi-globe me-1"></i> {res.platform}</span>
                    <span><i className="bi bi-clock me-1"></i> {res.estimatedDuration}</span>
                    <span className="badge bg-secondary-subtle text-secondary">{res.difficulty}</span>
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                  >
                    <span>Open Resource</span>
                    <i className="bi bi-box-arrow-up-right"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
