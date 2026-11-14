import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI, skillsAPI } from '../services/api';

const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  // Editable Profile State
  const [form, setForm] = useState({
    fullName: '',
    education: '',
    institution: '',
    degree: '',
    experienceLevel: 'Beginner',
    preferredLearningStyle: 'Hands-on',
    weeklyHoursAvailable: 10,
    shortTermGoals: '',
    longTermGoals: '',
  });

  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [parsedResume, setParsedResume] = useState(null);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || user?.name || '',
        education: profile.education || '',
        institution: profile.institution || '',
        degree: profile.degree || '',
        experienceLevel: profile.experienceLevel || 'Beginner',
        preferredLearningStyle: profile.preferredLearningStyle || 'Hands-on',
        weeklyHoursAvailable: profile.weeklyHoursAvailable || 10,
        shortTermGoals: profile.shortTermGoals?.join('\n') || '',
        longTermGoals: profile.longTermGoals?.join('\n') || '',
      });
      setSkills(profile.existingTechnicalSkills || []);
    }
  }, [profile, user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSaveSuccess('');
    try {
      await profileAPI.updateProfile({
        ...form,
        existingTechnicalSkills: skills,
        shortTermGoals: form.shortTermGoals.split('\n').filter(Boolean),
        longTermGoals: form.longTermGoals.split('\n').filter(Boolean),
      });
      await refreshProfile();
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    setResumeLoading(true);
    setError('');
    const data = new FormData();
    data.append('resume', file);

    try {
      const res = await profileAPI.uploadResume(data);
      if (res.data.success) {
        setParsedResume(res.data.extractedData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Resume upload and extraction failed.');
    } finally {
      setResumeLoading(false);
    }
  };

  const confirmResumeExtraction = () => {
    if (!parsedResume) return;

    const updated = [...skills];
    (parsedResume.extractedSkills || []).forEach(skName => {
      if (!updated.some(s => s.name.toLowerCase() === skName.toLowerCase())) {
        updated.push({
          name: skName,
          proficiencyLevel: 'Basic',
          score: 40,
          verified: false,
        });
      }
    });

    setSkills(updated);
    setForm(prev => ({
      ...prev,
      institution: parsedResume.institution || prev.institution,
      education: parsedResume.education || prev.education,
    }));
    setParsedResume(null);
    setSaveSuccess('Extracted skills added to list. Click "Save Changes" to persist.');
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      setError('This skill is already declared.');
      return;
    }
    const map = { Beginner: 20, Basic: 40, Intermediate: 60, Advanced: 80, Expert: 100 };
    setSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        proficiencyLevel: newSkillLevel,
        score: map[newSkillLevel] || 40,
        verified: false,
      }
    ]);
    setNewSkillName('');
    setError('');
  };

  const handleRemoveSkill = (name) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Learner Profile</h3>
          <p className="text-secondary small mb-0">Manage personal details, verified skill proficiencies, and parsed credentials</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary-subtle text-primary py-2 px-3">
            Target: {profile?.targetCareerName || 'Full Stack Developer'}
          </span>
        </div>
      </div>

      {saveSuccess && <div className="alert alert-success py-2 px-3 small mb-3">{saveSuccess}</div>}
      {error && <div className="alert alert-danger py-2 px-3 small mb-3">{error}</div>}

      <div className="row g-4">
        {/* Left Column: Form Details */}
        <div className="col-lg-7">
          <div className="card p-4 border-0 shadow-sm bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">General Information</h5>

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Experience Level</label>
                  <select
                    className="form-select"
                    value={form.experienceLevel}
                    onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                  >
                    <option value="Beginner">Beginner (0-1 years)</option>
                    <option value="Intermediate">Intermediate (1-3 years)</option>
                    <option value="Advanced">Advanced (3+ years)</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Institution / University</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.institution}
                    onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Degree Program</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.degree}
                    onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Preferred Learning Style</label>
                  <select
                    className="form-select"
                    value={form.preferredLearningStyle}
                    onChange={(e) => setForm({ ...form, preferredLearningStyle: e.target.value })}
                  >
                    <option value="Hands-on">Hands-on (Interactive projects)</option>
                    <option value="Visual">Visual (Video tutorials & diagrams)</option>
                    <option value="Reading/Writing">Reading/Writing (Docs & specifications)</option>
                    <option value="Auditory">Auditory (Lectures & podcasts)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Weekly Study Availability: <strong>{form.weeklyHoursAvailable} hrs/wk</strong>
                  </label>
                  <input
                    type="range"
                    className="form-range mt-2"
                    min="4"
                    max="40"
                    step="2"
                    value={form.weeklyHoursAvailable}
                    onChange={(e) => setForm({ ...form, weeklyHoursAvailable: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Short-Term Career Goals</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={form.shortTermGoals}
                  onChange={(e) => setForm({ ...form, shortTermGoals: e.target.value })}
                  placeholder="e.g. Master React hooks, deploy full-stack portfolio"
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark">Long-Term Career Goals</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={form.longTermGoals}
                  onChange={(e) => setForm({ ...form, longTermGoals: e.target.value })}
                  placeholder="e.g. Senior Software Architect at high-growth SaaS firm"
                />
              </div>

              <button type="submit" className="btn btn-primary px-4 py-2" disabled={loading}>
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Skills & PyMuPDF Resume Upload */}
        <div className="col-lg-5">
          {/* Resume Upload Box */}
          <div className="card p-4 border-0 shadow-sm bg-white mb-4">
            <h5 className="fw-bold text-dark mb-1">Resume Parser (PyMuPDF)</h5>
            <p className="text-secondary small mb-3">Upload your PDF resume to auto-detect verified skills</p>

            <div className="p-3 border-dashed border-2 rounded-3 bg-light text-center mb-3">
              <i className="bi bi-file-earmark-pdf fs-3 text-primary d-block mb-1"></i>
              <label className="btn btn-outline-primary btn-sm px-3 mt-1 cursor-pointer">
                {resumeLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Parsing with PyMuPDF...
                  </>
                ) : (
                  <>
                    <i className="bi bi-upload me-1"></i> Upload PDF Resume
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  className="d-none"
                  onChange={handleResumeUpload}
                  disabled={resumeLoading}
                />
              </label>
            </div>

            {parsedResume && (
              <div className="p-3 bg-info-subtle border border-info rounded-3 small">
                <div className="fw-bold text-dark mb-1">Parsed Resume Found:</div>
                <div className="text-secondary mb-2">
                  <strong>Skills ({parsedResume.extractedSkills?.length || 0}): </strong>
                  {parsedResume.extractedSkills?.join(', ')}
                </div>
                <button className="btn btn-sm btn-primary w-100" onClick={confirmResumeExtraction}>
                  <i className="bi bi-check2 me-1"></i> Confirm & Merge Skills
                </button>
              </div>
            )}
          </div>

          {/* Declared Skills Management */}
          <div className="card p-4 border-0 shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Technical Skills ({skills.length})</h5>
            </div>

            {/* Add Skill Row */}
            <div className="row g-2 mb-3">
              <div className="col-7">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Next.js, Redis, Docker"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                />
              </div>
              <div className="col-3">
                <select
                  className="form-select form-select-sm"
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div className="col-2">
                <button className="btn btn-sm btn-primary w-100" onClick={handleAddSkill}>
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>

            {/* Skills List */}
            <div className="d-flex flex-column gap-2" style={{ maxHeight: 380, overflowY: 'auto' }}>
              {skills.map((s) => (
                <div key={s.name} className="p-2 border rounded-2 d-flex align-items-center justify-content-between bg-light">
                  <div>
                    <span className="fw-semibold text-dark small">{s.name}</span>
                    <span className="badge bg-secondary-subtle text-secondary ms-2" style={{ fontSize: '0.7rem' }}>
                      {s.proficiencyLevel} ({s.score || 40}%)
                    </span>
                    {s.verified && (
                      <i className="bi bi-patch-check-fill text-primary ms-1" title="Verified by Assessment"></i>
                    )}
                  </div>
                  <button className="btn btn-sm text-danger p-0 border-0" onClick={() => handleRemoveSkill(s.name)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
