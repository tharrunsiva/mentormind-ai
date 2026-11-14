import React, { useState, useEffect } from 'react';
import { assessmentAPI, skillsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

const AssessmentPage = () => {
  const { profile, refreshProfile } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [myHistory, setMyHistory] = useState([]);
  const [customSkillSearch, setCustomSkillSearch] = useState('');

  useEffect(() => {
    loadAssessments();
    loadHistory();
  }, []);

  const loadAssessments = async () => {
    try {
      const res = await assessmentAPI.getAssessments();
      if (res.data && res.data.success) {
        setAssessments(res.data.assessments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await assessmentAPI.getMyResults();
      if (res.data && res.data.success) {
        setMyHistory(res.data.results || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Timer Countdown when assessment is active
  useEffect(() => {
    if (!activeAssessment || result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAssessment, result]);

  const startAssessment = async (skillName) => {
    try {
      const res = await assessmentAPI.getAssessmentForSkill(skillName);
      if (res.data && res.data.success) {
        setActiveAssessment(res.data.assessment);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setTimeLeft((res.data.assessment.timeLimitMinutes || 10) * 60);
        setResult(null);
      }
    } catch (err) {
      alert('Could not start assessment: ' + err.message);
    }
  };

  const handleSelectOption = (questionId, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: option,
    });
  };

  const handleSubmitAssessment = async () => {
    if (!activeAssessment) return;
    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([qId, ans]) => ({
        questionId: qId,
        selectedAnswer: ans,
      }));

      const res = await assessmentAPI.submitAssessment({
        assessmentId: activeAssessment._id,
        skillName: activeAssessment.skillName,
        answers: formattedAnswers,
      });

      if (res.data && res.data.success) {
        setResult(res.data);
        await refreshProfile();
        await loadHistory();

        if (res.data.percentage >= 70) {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        }
      }
    } catch (err) {
      alert('Failed to submit assessment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">AI Skill Assessment</h3>
          <p className="text-secondary small mb-0">
            Benchmark your proficiency through deterministic scenario & technical evaluations
          </p>
        </div>
      </div>

      {/* ACTIVE ASSESSMENT MODAL / FULL SCREEN VIEW */}
      {activeAssessment && !result && (
        <div className="card p-4 border-0 shadow-lg bg-white rounded-4 mb-4">
          <div className="d-flex justify-content-between align-items-center pb-3 border-bottom mb-4">
            <div>
              <span className="badge bg-primary-subtle text-primary me-2">
                {activeAssessment.skillName} • {activeAssessment.targetLevel}
              </span>
              <h5 className="fw-bold text-dark d-inline">{activeAssessment.title}</h5>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning-subtle text-warning fs-6 px-3 py-2">
                <i className="bi bi-stopwatch me-1"></i> {formatTime(timeLeft)}
              </span>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setActiveAssessment(null)}>
                Exit
              </button>
            </div>
          </div>

          {/* Question Viewer */}
          {activeAssessment.questions && activeAssessment.questions[currentQuestionIndex] && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small fw-semibold">
                  Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}
                </span>
                <span className="badge bg-light text-secondary border">
                  Type: {activeAssessment.questions[currentQuestionIndex].type.toUpperCase()}
                </span>
              </div>

              <h5 className="fw-bold text-dark mb-4" style={{ lineHeight: 1.4 }}>
                {activeAssessment.questions[currentQuestionIndex].question}
              </h5>

              {/* Options */}
              <div className="d-flex flex-column gap-2 mb-4">
                {activeAssessment.questions[currentQuestionIndex].options?.map((opt, idx) => {
                  const qId = activeAssessment.questions[currentQuestionIndex].id;
                  const isSelected = selectedAnswers[qId] === opt;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-3 border cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary-subtle shadow-sm' : 'bg-white card-hover'
                      }`}
                      onClick={() => handleSelectOption(qId, opt)}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <input
                          type="radio"
                          name={`q-${qId}`}
                          className="form-check-input mt-1"
                          checked={isSelected}
                          onChange={() => handleSelectOption(qId, opt)}
                        />
                        <span className="text-dark small fw-medium" style={{ lineHeight: 1.5 }}>
                          {opt}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stepper buttons */}
              <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                <button
                  className="btn btn-outline-secondary btn-sm px-3"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                >
                  <i className="bi bi-arrow-left me-1"></i> Previous
                </button>

                {currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                  <button
                    className="btn btn-primary btn-sm px-4"
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  >
                    Next Question <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                ) : (
                  <button
                    className="btn btn-success btn-sm px-4 py-2 fw-semibold"
                    onClick={handleSubmitAssessment}
                    disabled={submitting}
                  >
                    {submitting ? 'Evaluating with deterministic rubrics...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESULT REPORT MODAL / CARD */}
      {result && (
        <div className="card p-4 border-0 shadow-lg bg-white rounded-4 mb-4">
          <div className="text-center py-3 border-bottom mb-4">
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-2 ${
                result.percentage >= 70 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
              }`}
            >
              <i className={`bi ${result.percentage >= 70 ? 'bi-trophy-fill' : 'bi-award-fill'} fs-1`}></i>
            </div>
            <h3 className="fw-bold text-dark mb-1">
              {result.percentage}% • {result.proficiencyAssigned} Level
            </h3>
            <p className="text-secondary small mx-auto mb-0" style={{ maxWidth: 540 }}>
              {result.feedback}
            </p>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="p-3 bg-light rounded-3 border h-100">
                <h6 className="fw-bold text-success mb-2">
                  <i className="bi bi-check-circle-fill me-1"></i> Demonstrated Strengths
                </h6>
                <ul className="small text-muted mb-0 ps-3">
                  {result.strengths?.map((str, idx) => (
                    <li key={idx} className="mb-1">{str}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 bg-light rounded-3 border h-100">
                <h6 className="fw-bold text-warning mb-2">
                  <i className="bi bi-exclamation-circle-fill me-1"></i> Areas for Improvement
                </h6>
                <ul className="small text-muted mb-0 ps-3">
                  {result.weaknesses?.map((w, idx) => (
                    <li key={idx} className="mb-1">{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-3 bg-primary-subtle border border-primary rounded-3 mb-4 small text-primary">
            <i className="bi bi-stars me-1"></i>
            <strong>Adaptive Roadmap Impact:</strong> {result.adaptiveRecommendation}
          </div>

          <div className="d-flex justify-content-end">
            <button className="btn btn-primary px-4" onClick={() => setResult(null)}>
              Done & Return to Assessments
            </button>
          </div>
        </div>
      )}

      {/* Available Assessments Catalog */}
      <div className="card p-4 border-0 shadow-sm bg-white mb-4">
        <h5 className="fw-bold text-dark mb-3">Available Skill Assessments</h5>

        <div className="row g-3 mb-4">
          {assessments.map((ass) => (
            <div key={ass._id} className="col-md-4">
              <div className="p-3.5 border rounded-3 bg-light h-100 d-flex flex-column justify-content-between p-3 card-hover">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary text-white">{ass.skillName}</span>
                    <span className="small text-muted">{ass.timeLimitMinutes || 15} mins</span>
                  </div>
                  <h6 className="fw-bold text-dark mb-1">{ass.title}</h6>
                  <p className="small text-muted mb-3" style={{ fontSize: '0.8rem' }}>
                    {ass.questions?.length || 5} questions covering core syntax, architecture & scenarios.
                  </p>
                </div>
                <button
                  className="btn btn-outline-primary btn-sm w-100"
                  onClick={() => startAssessment(ass.skillName)}
                >
                  <i className="bi bi-play-circle me-1"></i> Start Assessment
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Assessment Launcher */}
        <div className="p-3 bg-light border rounded-3">
          <h6 className="fw-bold text-dark mb-1">Take Assessment for Any Skill</h6>
          <p className="small text-muted mb-2">
            Want to benchmark a skill not listed above? Enter any skill name to launch an evaluation.
          </p>
          <div className="d-flex gap-2" style={{ maxWidth: 450 }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="e.g. Node.js, Docker, MongoDB, TypeScript"
              value={customSkillSearch}
              onChange={(e) => setCustomSkillSearch(e.target.value)}
            />
            <button
              className="btn btn-primary btn-sm px-3 flex-shrink-0"
              onClick={() => startAssessment(customSkillSearch)}
              disabled={!customSkillSearch.trim()}
            >
              Launch Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Previous Assessment History */}
      <div className="card p-4 border-0 shadow-sm bg-white">
        <h5 className="fw-bold text-dark mb-3">My Assessment History</h5>
        {myHistory.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            No previous assessments taken yet. Choose a skill above to verify your proficiency!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle small mb-0">
              <thead className="table-light">
                <tr>
                  <th>Skill Tested</th>
                  <th>Proficiency Level</th>
                  <th>Score</th>
                  <th>Date Taken</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myHistory.map((item) => (
                  <tr key={item._id}>
                    <td className="fw-semibold text-dark">{item.skillName}</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary">{item.proficiencyAssigned}</span>
                    </td>
                    <td>
                      <strong className={item.percentage >= 70 ? 'text-success' : 'text-warning'}>
                        {item.percentage}%
                      </strong>
                    </td>
                    <td className="text-muted">{new Date(item.completedAt).toLocaleDateString()}</td>
                    <td>
                      <span className="badge bg-success-subtle text-success">
                        <i className="bi bi-check2 me-1"></i> Verified
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

export default AssessmentPage;
