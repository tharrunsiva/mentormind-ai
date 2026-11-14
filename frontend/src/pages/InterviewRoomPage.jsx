import React, { useState, useEffect } from 'react';
import { interviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

const InterviewRoomPage = () => {
  const { profile, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Setup State
  const [inSetup, setInSetup] = useState(true);
  const [jobRole, setJobRole] = useState(profile?.targetCareerName || 'Full Stack Developer');
  const [category, setCategory] = useState('technical');
  const [difficulty, setDifficulty] = useState('Entry');
  const [questionCount, setQuestionCount] = useState(3);

  // Active Interview State
  const [interviewSession, setInterviewSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [interviewReport, setInterviewReport] = useState(null);

  // Web Speech API STT & TTS
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    loadHistory();
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const loadHistory = async () => {
    try {
      const res = await interviewAPI.getMyInterviews();
      if (res.data && res.data.success) {
        setHistory(res.data.interviews);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    try {
      const res = await interviewAPI.startInterview({
        jobRole,
        category,
        difficulty,
        totalQuestions: questionCount,
      });

      if (res.data && res.data.success) {
        setInterviewSession(res.data.interview);
        setCurrentQuestion(res.data.currentQuestion);
        setInSetup(false);
        setLatestEvaluation(null);
        setInterviewReport(null);
        setAnswerText('');

        speakText(res.data.currentQuestion.questionText);
      }
    } catch (err) {
      alert('Failed to initialize examination: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInputToggle = () => {
    if (!speechSupported) return;

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswerText((prev) => (prev ? prev + ' ' + transcript : transcript));
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || evaluating) return;
    setEvaluating(true);

    try {
      const res = await interviewAPI.submitAnswer(interviewSession._id, {
        questionId: currentQuestion._id,
        answerText,
      });

      if (res.data && res.data.success) {
        setLatestEvaluation(res.data.evaluation);

        if (res.data.isCompleted) {
          setInterviewReport(res.data.report);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          loadHistory();
        } else {
          setCurrentQuestion(res.data.nextQuestion);
          setAnswerText('');
          speakText(res.data.nextQuestion.questionText);
        }
      }
    } catch (err) {
      alert('Failed to evaluate answer: ' + (err.response?.data?.message || err.message));
    } finally {
      setEvaluating(false);
    }
  };

  const handleViewPastReport = async (interviewId) => {
    try {
      const res = await interviewAPI.getInterviewDetails(interviewId);
      if (res.data && res.data.success) {
        setInterviewReport(res.data.interview);
        setInSetup(false);
      }
    } catch (e) {
      alert('Could not load report.');
    }
  };

  const candidateId = `MM-IN-2026-${(user?._id || '90412').slice(-5).toUpperCase()}`;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="gov-seal-badge mb-1">
            <i className="bi bi-shield-shaded"></i>
            <span>Board of Examiners</span>
          </div>
          <h3 className="fw-bold text-dark mb-0">National Mock Examination Chamber</h3>
          <p className="text-secondary small mb-0">
            Standardized technical and architectural oral examinations evaluated against Ministry benchmarks
          </p>
        </div>

        {!inSetup && (
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setInSetup(true)}>
            <i className="bi bi-arrow-left me-1"></i> Return to Examination Selection
          </button>
        )}
      </div>

      {/* VIEW 1: EXAMINATION CONFIGURATION */}
      {inSetup && (
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card border bg-white h-100 shadow-sm">
              <div className="card-header-gov">
                <h6 className="fw-bold text-white mb-0">Examination Docket Configuration</h6>
                <span className="badge bg-warning text-dark">FORM-EX-26</span>
              </div>

              <div className="p-4">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Candidate Registration ID</label>
                  <input
                    type="text"
                    className="form-control form-control-sm font-monospace bg-light"
                    value={candidateId}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Target Role Classification</label>
                  <input
                    type="text"
                    className="form-control"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer, Systems Architect"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Examination Board Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="technical">Technical Architecture & Systems Engineering</option>
                    <option value="hr">Professional Ethics & Leadership Pitch</option>
                    <option value="behavioral">Incident Response & Crisis Management (STAR)</option>
                    <option value="scenario">Production Outage Simulation</option>
                    <option value="mixed">Comprehensive Board Examination</option>
                  </select>
                </div>

                <div className="row g-2 mb-4">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Standard Tier</label>
                    <select
                      className="form-select"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="Entry">Tier 1: Junior Officer</option>
                      <option value="Mid-Level">Tier 2: Senior Specialist</option>
                      <option value="Senior">Tier 3: Principal Architect</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Docket Questions</label>
                    <select
                      className="form-select"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    >
                      <option value="2">2 Questions (Fast Track)</option>
                      <option value="3">3 Questions (Standard Docket)</option>
                      <option value="4">4 Questions (Comprehensive)</option>
                    </select>
                  </div>
                </div>

                <button
                  className="btn btn-primary w-100 py-2.5 fw-bold"
                  onClick={handleStartInterview}
                  disabled={loading}
                >
                  {loading ? 'Initializing Board Examination...' : 'Enter Examination Chamber'}
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border bg-light h-100 shadow-sm">
              <div className="p-3 px-4 border-bottom bg-white">
                <h6 className="fw-bold text-dark mb-0">Statutory Marking Scheme & Rubric</h6>
              </div>

              <div className="p-4 d-flex flex-column gap-2">
                <div className="p-3 bg-white border rounded-2 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-bold text-dark d-block">1. Technical Veracity (35%)</span>
                    <span className="small text-muted">Architectural correctness, security best practices</span>
                  </div>
                  <span className="badge bg-primary">35 Marks</span>
                </div>

                <div className="p-3 bg-white border rounded-2 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-bold text-dark d-block">2. Focus & Prompt Alignment (25%)</span>
                    <span className="small text-muted">Directness of response without obfuscation</span>
                  </div>
                  <span className="badge bg-secondary">25 Marks</span>
                </div>

                <div className="p-3 bg-white border rounded-2 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-bold text-dark d-block">3. Completeness & Edge Conditions (20%)</span>
                    <span className="small text-muted">Error boundaries, failovers, and scale limits</span>
                  </div>
                  <span className="badge bg-secondary">20 Marks</span>
                </div>

                <div className="p-3 bg-white border rounded-2 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-bold text-dark d-block">4. Communication Precision (20%)</span>
                    <span className="small text-muted">Concise articulation, structured presentation</span>
                  </div>
                  <span className="badge bg-secondary">20 Marks</span>
                </div>

                <div className="p-3 bg-white border rounded-2 small text-secondary mt-2">
                  <i className="bi bi-mic-fill text-primary me-1"></i>
                  <strong>Oral Examination Enabled:</strong> Dictation speech recognition is active. Answers are recorded in official examination transcripts.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE EXAMINATION SESSION */}
      {!inSetup && !interviewReport && currentQuestion && (
        <div className="card border bg-white rounded-3 mb-4 shadow-sm">
          <div className="card-header-gov">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark font-monospace">
                QUESTION {currentQuestion.questionNumber} / {interviewSession?.totalQuestions}
              </span>
              <span className="text-white fw-bold">
                Docket: {interviewSession?.jobRole} ({interviewSession?.difficulty} Level)
              </span>
            </div>

            <button
              className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
              onClick={() => speakText(currentQuestion.questionText)}
              title="Read Question Aloud"
            >
              <i className="bi bi-volume-up-fill"></i> Read Aloud
            </button>
          </div>

          <div className="p-4">
            <div className="p-3 rounded-2 bg-light border mb-4">
              <span className="small text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.68rem' }}>
                BOARD EXAMINER PROMPT
              </span>
              <h4 className="fw-bold text-dark mb-0" style={{ lineHeight: 1.45 }}>
                "{currentQuestion.questionText}"
              </h4>
            </div>

            {/* Answer Input Area */}
            <div className="mb-3 position-relative">
              <textarea
                className="form-control"
                rows="6"
                placeholder="Structure your formal answer. Detail architectural trade-offs, security considerations, and production deployment patterns..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
              />

              {speechSupported && (
                <button
                  type="button"
                  className={`btn btn-sm position-absolute bottom-0 end-0 m-3 px-3 d-flex align-items-center gap-1.5 ${
                    isRecording ? 'btn-danger' : 'btn-light border'
                  }`}
                  onClick={handleVoiceInputToggle}
                >
                  <i className={`bi ${isRecording ? 'bi-stop-fill' : 'bi-mic-fill'}`}></i>
                  <span>{isRecording ? 'Transcribing Oral Input...' : 'Dictate Oral Response'}</span>
                </button>
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <span className="small text-muted font-monospace">
                Word Count: {answerText.trim().split(/\s+/).filter(Boolean).length} words
              </span>

              <button
                className="btn btn-primary px-4 py-2 fw-bold"
                onClick={handleSubmitAnswer}
                disabled={evaluating || !answerText.trim()}
              >
                {evaluating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Board is Scoring Submission...
                  </>
                ) : (
                  'Submit Formal Response & Proceed'
                )}
              </button>
            </div>

            {latestEvaluation && (
              <div className="mt-4 p-3 bg-light border rounded-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="badge bg-success text-white">
                    Score: {latestEvaluation.scores.overall}/100 Marks
                  </span>
                  <span className="small text-muted font-monospace">
                    Tech: {latestEvaluation.scores.technical} • Clarity: {latestEvaluation.scores.clarity}
                  </span>
                </div>
                <p className="small text-dark mb-1">
                  <strong>Examiner Remarks:</strong> {latestEvaluation.feedback}
                </p>
                {latestEvaluation.followUpQuestion && (
                  <div className="small text-primary mt-1">
                    <i className="bi bi-arrow-return-right me-1"></i>
                    <strong>Follow-up Consideration:</strong> {latestEvaluation.followUpQuestion}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: COMPREHENSIVE EXAMINATION REPORT */}
      {interviewReport && (
        <div className="card border bg-white rounded-3 mb-4 shadow-sm">
          <div className="card-header-gov">
            <h5 className="fw-bold text-white mb-0">Official Examination Result Certificate</h5>
            <span className="gov-verified-pill bg-white text-dark">
              RESULT VERIFIED
            </span>
          </div>

          <div className="p-4 p-md-5">
            <div className="text-center pb-3 border-bottom mb-4">
              <span className="gov-seal-badge mb-2">OFFICIAL MARKSHEET</span>
              <h2 className="fw-bold text-dark mb-1">Certificate of Competency Assessment</h2>
              <p className="text-secondary small">
                Candidate: <strong>{user?.name}</strong> ({candidateId}) • Examined for: <strong>{interviewReport.jobRole}</strong>
              </p>

              <div className="d-flex justify-content-center gap-4 my-4">
                <div className="p-3 bg-light border rounded-2 text-center" style={{ minWidth: 140 }}>
                  <span className="text-muted small fw-bold d-block">AGGREGATE SCORE</span>
                  <span className="fs-1 fw-bold text-primary">{interviewReport.overallScore}%</span>
                </div>
                <div className="p-3 bg-light border rounded-2 text-center" style={{ minWidth: 140 }}>
                  <span className="text-muted small fw-bold d-block">TECHNICAL DEPTH</span>
                  <span className="fs-1 fw-bold text-success">{interviewReport.technicalScore}%</span>
                </div>
                <div className="p-3 bg-light border rounded-2 text-center" style={{ minWidth: 140 }}>
                  <span className="text-muted small fw-bold d-block">COMMUNICATION</span>
                  <span className="fs-1 fw-bold text-warning">{interviewReport.clarityScore}%</span>
                </div>
              </div>

              <p className="small text-secondary mx-auto mb-0" style={{ maxWidth: 620 }}>
                {interviewReport.feedbackSummary}
              </p>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="p-3 bg-light rounded-2 border h-100">
                  <h6 className="fw-bold text-success mb-2">
                    <i className="bi bi-check-circle-fill me-1"></i> Verified Competency Highlights
                  </h6>
                  <ul className="small text-secondary mb-0 ps-3">
                    {interviewReport.strongPoints?.map((p, i) => (
                      <li key={i} className="mb-1">{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 bg-light rounded-2 border h-100">
                  <h6 className="fw-bold text-danger mb-2">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i> Prescribed Hardening Directives
                  </h6>
                  <ul className="small text-secondary mb-0 ps-3">
                    {interviewReport.weakPoints?.map((p, i) => (
                      <li key={i} className="mb-1">{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button className="btn btn-primary px-5 py-2 fw-bold" onClick={() => setInSetup(true)}>
                Schedule Another Examination Docket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Past Examinations History Table */}
      {history.length > 0 && inSetup && (
        <div className="card border bg-white shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold text-dark mb-0">Official Examination Record History</h6>
            <span className="badge bg-light text-secondary border small">{history.length} Entries</span>
          </div>

          <div className="table-responsive">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Target Classification</th>
                  <th>Board Category</th>
                  <th>Standard Tier</th>
                  <th>Marks Scored</th>
                  <th>Examination Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td className="fw-bold text-dark">{item.jobRole}</td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {item.category}
                      </span>
                    </td>
                    <td>{item.difficulty}</td>
                    <td>
                      <span className="fw-bold text-primary">{item.overallScore || 0}%</span>
                    </td>
                    <td className="small text-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary py-1 px-3"
                        onClick={() => handleViewPastReport(item._id)}
                      >
                        Inspect Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoomPage;
