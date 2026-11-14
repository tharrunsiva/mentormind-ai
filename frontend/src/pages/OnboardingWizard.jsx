import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, careersAPI, skillsAPI, roadmapAPI } from '../services/api';

const OnboardingWizard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [error, setError] = useState('');
  const [careersList, setCareersList] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    education: user?.educationLevel || 'Undergraduate',
    institution: user?.institution || '',
    degree: 'B.S. in Computer Science',
    currentYear: user?.currentYear || '3rd Year',
    experienceLevel: 'Beginner',
    preferredLearningStyle: 'Hands-on',
    weeklyHoursAvailable: 12,
    targetCareer: '',
    targetCareerName: 'Full Stack Developer',
    existingTechnicalSkills: [
      { name: 'JavaScript', proficiencyLevel: 'Intermediate', score: 65 },
      { name: 'HTML5 & CSS3', proficiencyLevel: 'Advanced', score: 85 },
      { name: 'React.js', proficiencyLevel: 'Intermediate', score: 60 },
    ],
    existingSoftSkills: ['Critical Thinking', 'Team Collaboration', 'Presentation'],
    shortTermGoals: 'Build and deploy a full-stack web application with authentication and database integration.',
    longTermGoals: 'Become a Senior Software Engineer specializing in modern scalable cloud systems.',
  });

  // State for resume parse confirmation modal
  const [parsedResume, setParsedResume] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [careersRes, skillsRes] = await Promise.all([
          careersAPI.getAllCareers(),
          skillsAPI.getAllSkills(),
        ]);
        if (careersRes.data && careersRes.data.success) {
          setCareersList(careersRes.data.careers);
          if (careersRes.data.careers.length > 0 && !formData.targetCareer) {
            setFormData(prev => ({
              ...prev,
              targetCareer: careersRes.data.careers[0]._id,
              targetCareerName: careersRes.data.careers[0].title,
            }));
          }
        }
        if (skillsRes.data && skillsRes.data.success) {
          setAvailableSkills(skillsRes.data.skills);
        }
      } catch (err) {
        console.error('Failed to load careers or skills:', err);
      }
    };
    loadData();
  }, []);

  const handleResumeFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF format resume.');
      return;
    }

    setResumeUploading(true);
    setError('');
    const form = new FormData();
    form.append('resume', file);

    try {
      const res = await profileAPI.uploadResume(form);
      if (res.data && res.data.success) {
        setParsedResume(res.data.extractedData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Resume parsing encountered an issue.');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleConfirmResumeData = () => {
    if (!parsedResume) return;

    // Merge extracted skills
    const newSkills = [...formData.existingTechnicalSkills];
    (parsedResume.extractedSkills || []).forEach(skName => {
      if (!newSkills.some(s => s.name.toLowerCase() === skName.toLowerCase())) {
        newSkills.push({
          name: skName,
          proficiencyLevel: 'Basic',
          score: 40,
        });
      }
    });

    setFormData(prev => ({
      ...prev,
      existingTechnicalSkills: newSkills,
      institution: parsedResume.institution || prev.institution,
      education: parsedResume.education || prev.education,
    }));

    setParsedResume(null);
  };

  const handleAddSkill = (skillName) => {
    if (!skillName) return;
    if (formData.existingTechnicalSkills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      existingTechnicalSkills: [
        ...prev.existingTechnicalSkills,
        { name: skillName, proficiencyLevel: 'Basic', score: 40 }
      ]
    }));
  };

  const handleRemoveSkill = (skillName) => {
    setFormData(prev => ({
      ...prev,
      existingTechnicalSkills: prev.existingTechnicalSkills.filter(s => s.name !== skillName)
    }));
  };

  const handleProficiencyChange = (skillName, newLevel) => {
    const map = { Beginner: 20, Basic: 40, Intermediate: 60, Advanced: 80, Expert: 100 };
    setFormData(prev => ({
      ...prev,
      existingTechnicalSkills: prev.existingTechnicalSkills.map(s =>
        s.name === skillName ? { ...s, proficiencyLevel: newLevel, score: map[newLevel] } : s
      )
    }));
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Update Profile
      await profileAPI.updateProfile({
        ...formData,
        shortTermGoals: [formData.shortTermGoals],
        longTermGoals: [formData.longTermGoals],
      });

      // 2. Generate Initial AI Learning Roadmap
      await roadmapAPI.generateRoadmap();

      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete onboarding.');
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light py-5 px-3">
      <div className="container" style={{ maxWidth: 840 }}>
        {/* Wizard Header */}
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-3 d-inline-flex align-items-center justify-content-center p-2 mb-2">
            <i className="bi bi-cpu-fill fs-4"></i>
          </div>
          <h2 className="fw-bold text-dark">Welcome to MentorMind AI</h2>
          <p className="text-secondary small">Complete your 3-minute profile to generate your adaptive career intelligence</p>

          {/* Stepper Indicator */}
          <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="d-flex align-items-center gap-2">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                    step === num ? 'bg-primary text-white shadow-sm' : step > num ? 'bg-success text-white' : 'bg-white border text-muted'
                  }`}
                  style={{ width: 36, height: 36, fontSize: '0.85rem' }}
                >
                  {step > num ? <i className="bi bi-check-lg"></i> : num}
                </div>
                <span className={`small fw-semibold d-none d-sm-inline ${step === num ? 'text-primary' : 'text-muted'}`}>
                  {num === 1 ? 'Education' : num === 2 ? 'Skills & Resume' : num === 3 ? 'Target Career' : 'Review & Launch'}
                </span>
                {num < 4 && <div className="bg-secondary opacity-25 d-none d-sm-block" style={{ width: 24, height: 2 }}></div>}
              </div>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 px-3 small mb-3">{error}</div>}

        {/* Wizard Card Body */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          {/* STEP 1: Education & Learning Preferences */}
          {step === 1 && (
            <div>
              <h4 className="fw-bold text-dark mb-1">Step 1: Background & Preferences</h4>
              <p className="text-secondary small mb-4">Help us calibrate topic pacing and project complexity</p>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Education Level</label>
                  <select
                    className="form-select"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  >
                    <option value="Undergraduate">Undergraduate Degree</option>
                    <option value="Postgraduate">Postgraduate Degree</option>
                    <option value="Bootcamp">Coding Bootcamp</option>
                    <option value="Self-Taught">Self-Taught</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Institution / College</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. State University of Technology"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Degree Program</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. B.S. Computer Science"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Preferred Learning Style</label>
                  <select
                    className="form-select"
                    value={formData.preferredLearningStyle}
                    onChange={(e) => setFormData({ ...formData, preferredLearningStyle: e.target.value })}
                  >
                    <option value="Hands-on">Hands-on (Interactive projects & code)</option>
                    <option value="Visual">Visual (Video tutorials & diagrams)</option>
                    <option value="Reading/Writing">Reading/Writing (Docs & specifications)</option>
                    <option value="Auditory">Auditory (Lectures & discussions)</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">
                    Weekly Study Availability: <strong className="text-primary">{formData.weeklyHoursAvailable} hours</strong>
                  </label>
                  <input
                    type="range"
                    className="form-range mt-2"
                    min="4"
                    max="40"
                    step="2"
                    value={formData.weeklyHoursAvailable}
                    onChange={(e) => setFormData({ ...formData, weeklyHoursAvailable: parseInt(e.target.value) })}
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>4 hrs/wk (Casual)</span>
                    <span>20 hrs/wk (Intensive)</span>
                    <span>40 hrs/wk (Full-time)</span>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button className="btn btn-primary px-4 py-2" onClick={() => setStep(2)}>
                  Next: Skills & Resume <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Existing Skills & PyMuPDF Resume Upload */}
          {step === 2 && (
            <div>
              <h4 className="fw-bold text-dark mb-1">Step 2: Technical Skills & Resume</h4>
              <p className="text-secondary small mb-4">Declare your current knowledge so MentorMind skips what you already know</p>

              {/* PDF Resume Parser Box */}
              <div className="p-3.5 border-dashed border-2 rounded-3 bg-light text-center mb-4 p-4">
                <i className="bi bi-file-earmark-pdf fs-2 text-primary d-block mb-2"></i>
                <h6 className="fw-bold text-dark mb-1">Optional: Upload Resume for AI Skill Extraction</h6>
                <p className="text-muted small mb-3">Our PyMuPDF engine automatically parses your skills, projects, and education</p>
                <label className="btn btn-outline-primary btn-sm px-3 cursor-pointer">
                  {resumeUploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Parsing PDF with PyMuPDF...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-1"></i> Choose PDF Resume
                    </>
                  )}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="d-none"
                    onChange={handleResumeFileChange}
                    disabled={resumeUploading}
                  />
                </label>
              </div>

              {/* Resume Parse Preview Modal / Card */}
              {parsedResume && (
                <div className="alert alert-info border border-info rounded-3 p-3 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="text-dark">
                      <i className="bi bi-file-check me-1 text-success"></i> Extracted Resume Details
                    </strong>
                    <button className="btn btn-sm btn-close" onClick={() => setParsedResume(null)}></button>
                  </div>
                  <div className="small mb-2">
                    <strong>Found Skills ({parsedResume.extractedSkills?.length || 0}): </strong>
                    <span className="text-secondary">{parsedResume.extractedSkills?.join(', ')}</span>
                  </div>
                  <div className="small mb-3">
                    <strong>Education: </strong>
                    <span className="text-secondary">{parsedResume.education}</span>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={handleConfirmResumeData}>
                    <i className="bi bi-check2 me-1"></i> Confirm & Merge into My Profile
                  </button>
                </div>
              )}

              {/* Selected Skills List */}
              <label className="form-label small fw-semibold text-dark mb-2">Declared Technical Skills</label>
              <div className="d-flex flex-column gap-2 mb-4">
                {formData.existingTechnicalSkills.map((sk) => (
                  <div key={sk.name} className="p-2.5 px-3 border rounded-3 d-flex align-items-center justify-content-between bg-white">
                    <div className="fw-semibold text-dark">{sk.name}</div>
                    <div className="d-flex align-items-center gap-2">
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 140 }}
                        value={sk.proficiencyLevel}
                        onChange={(e) => handleProficiencyChange(sk.name, e.target.value)}
                      >
                        <option value="Beginner">Beginner (20%)</option>
                        <option value="Basic">Basic (40%)</option>
                        <option value="Intermediate">Intermediate (60%)</option>
                        <option value="Advanced">Advanced (80%)</option>
                        <option value="Expert">Expert (100%)</option>
                      </select>
                      <button
                        className="btn btn-sm text-danger border-0"
                        onClick={() => handleRemoveSkill(sk.name)}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Popular Skills Quick Badges */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark mb-2">Add More Skills:</label>
                <div className="d-flex flex-wrap gap-1.5">
                  {['Python', 'Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Docker', 'AWS Cloud', 'Git & GitHub']
                    .filter(sk => !formData.existingTechnicalSkills.some(s => s.name === sk))
                    .map(sk => (
                      <button
                        key={sk}
                        type="button"
                        className="btn btn-sm btn-light border text-secondary"
                        onClick={() => handleAddSkill(sk)}
                      >
                        + {sk}
                      </button>
                    ))}
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button className="btn btn-outline-secondary px-4 py-2" onClick={() => setStep(1)}>
                  <i className="bi bi-arrow-left me-1"></i> Back
                </button>
                <button className="btn btn-primary px-4 py-2" onClick={() => setStep(3)}>
                  Next: Target Career <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Target Career Selection & Career Goals */}
          {step === 3 && (
            <div>
              <h4 className="fw-bold text-dark mb-1">Step 3: Target Career & Goals</h4>
              <p className="text-secondary small mb-4">Choose the role you want to achieve. MentorMind AI will compute your exact skill gaps.</p>

              <div className="row g-3 mb-4">
                {careersList.map(career => {
                  const isSelected = formData.targetCareer === career._id || formData.targetCareerName === career.title;
                  return (
                    <div key={career._id} className="col-md-6">
                      <div
                        className={`p-3 rounded-3 border cursor-pointer h-100 transition-all ${
                          isSelected ? 'border-primary bg-primary-subtle shadow-sm' : 'bg-white card-hover'
                        }`}
                        onClick={() => setFormData({
                          ...formData,
                          targetCareer: career._id,
                          targetCareerName: career.title,
                        })}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold text-dark">{career.title}</span>
                          {isSelected && <i className="bi bi-check-circle-fill text-primary"></i>}
                        </div>
                        <p className="small text-secondary mb-2 line-clamp-2" style={{ fontSize: '0.8rem' }}>
                          {career.description}
                        </p>
                        <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                          <strong>Key Skills: </strong>
                          {career.requiredTechnicalSkills.slice(0, 3).map(s => s.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Short-Term Career Goal (Next 3-6 Months)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={formData.shortTermGoals}
                  onChange={(e) => setFormData({ ...formData, shortTermGoals: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark">Long-Term Career Goal (2-3 Years)</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={formData.longTermGoals}
                  onChange={(e) => setFormData({ ...formData, longTermGoals: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-between">
                <button className="btn btn-outline-secondary px-4 py-2" onClick={() => setStep(2)}>
                  <i className="bi bi-arrow-left me-1"></i> Back
                </button>
                <button className="btn btn-primary px-4 py-2" onClick={() => setStep(4)}>
                  Review & Generate <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Generate Adaptive Roadmap */}
          {step === 4 && (
            <div>
              <div className="text-center mb-4">
                <div className="ai-badge mb-2">Ready to Launch</div>
                <h4 className="fw-bold text-dark">Review Your Learning Profile</h4>
                <p className="text-secondary small">Our multi-agent system will generate your personalized roadmap immediately</p>
              </div>

              <div className="p-3.5 bg-light rounded-3 border mb-4 p-4">
                <div className="row g-3">
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">TARGET CAREER</span>
                    <strong className="text-dark fs-5">{formData.targetCareerName}</strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">STUDY AVAILABILITY</span>
                    <strong className="text-dark fs-5">{formData.weeklyHoursAvailable} hours/week</strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">DECLARED SKILLS</span>
                    <strong className="text-dark">{formData.existingTechnicalSkills.length} Technical Skills</strong>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted small d-block">LEARNING STYLE</span>
                    <strong className="text-dark">{formData.preferredLearningStyle}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white border rounded-3 mb-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-semibold small">
                  <i className="bi bi-stars"></i> What happens next:
                </div>
                <ul className="small text-muted mb-0 ps-3">
                  <li>Skill Gap Analysis Agent calculates current vs required proficiency scores.</li>
                  <li>Learning Path Agent organizes prerequisite-ordered milestones into 4 phases.</li>
                  <li>Peer Matching Agent indexes your profile for complementary learning partners.</li>
                </ul>
              </div>

              <div className="d-flex justify-content-between">
                <button className="btn btn-outline-secondary px-4 py-2" onClick={() => setStep(3)}>
                  <i className="bi bi-arrow-left me-1"></i> Back
                </button>
                <button
                  className="btn btn-primary btn-lg px-4 py-2.5 fs-6"
                  onClick={handleFinishOnboarding}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Generating AI Intelligence...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-rocket-takeoff-fill me-2"></i> Launch MentorMind Dashboard
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
