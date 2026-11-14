import React, { useState, useEffect } from 'react';
import { interviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import confetti from 'canvas-confetti';

const InterviewRoomPage = () => {
  const { profile } = useAuth();
  const { isDark } = useTheme();
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
      alert('Failed to start interview: ' + (err.response?.data?.message || err.message));
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

  return (
    <div className="fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="ai-badge mb-1">
            <span className="ai-pulse-dot"></span>
            <span>Interactive Simulator</span>
          </div>
          <h3 className="fw-bold mb-0" style={{ letterSpacing: '-0.02em' }}>AI Mock Interview Room</h3>
          <p className="text-secondary small mb-0">
            Simulate career-specific interviews with rubric-driven scoring and adaptive feedback
          </p>
        </div>

        {!inSetup && (
          <button className="btn mac-btn-secondary btn-sm" onClick={() => setInSetup(true)}>
            <i className="bi bi-gear me-1"></i> New Simulation Setup
          </button>
        )}
      </div>

      {/* VIEW 1: INTERVIEW SETUP */}
      {inSetup && (
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card mac-card p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="mac-traffic-lights">
                  <span className="mac-traffic-dot mac-traffic-close"></span>
                  <span className="mac-traffic-dot mac-traffic-minimize"></span>
                  <span className="mac-traffic-dot mac-traffic-zoom"></span>
                </div>
                <h5 className="fw-bold mb-0 ms-2">Configure Simulation</h5>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Target Role</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)', color: 'var(--mac-text-primary)' }}
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, Backend Engineer"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-secondary">Interview Category</label>
                <select
                  className="form-select rounded-3"
                  style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)', color: 'var(--mac-text-primary)' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="technical">Technical Architecture & Coding</option>
                  <option value="hr">HR & Career Elevator Pitch</option>
                  <option value="behavioral">Behavioral (STAR Method)</option>
                  <option value="scenario">System Outage & Scenario Response</option>
                  <option value="mixed">Mixed Comprehensive Round</option>
                </select>
              </div>

              <div className="row g-2 mb-4">
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Seniority Level</label>
                  <select
                    className="form-select rounded-3"
                    style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)', color: 'var(--mac-text-primary)' }}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="Entry">Entry / Junior Level</option>
                    <option value="Mid-Level">Mid-Level Engineer</option>
                    <option value="Senior">Senior Architect</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold text-secondary">Question Count</label>
                  <select
                    className="form-select rounded-3"
                    style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)', color: 'var(--mac-text-primary)' }}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  >
                    <option value="2">2 Questions (Sprint)</option>
                    <option value="3">3 Questions (Standard)</option>
                    <option value="4">4 Questions (Thorough)</option>
                  </select>
                </div>
              </div>

              <button
                className="btn btn-primary w-100 py-2.5 fs-6 fw-semibold rounded-pill"
                onClick={handleStartInterview}
                disabled={loading}
              >
                {loading ? 'Initializing Simulation...' : 'Enter Mock Interview Room'}
              </button>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card mac-card p-4 h-100">
              <h6 className="fw-bold small text-uppercase mb-2 text-secondary" style={{ letterSpacing: '0.04em' }}>
                Evaluation Rubric Standard
              </h6>
              <p className="text-secondary small mb-3">
                Responses are scored against objective criteria by the AI Mock Interview Agent:
              </p>

              <div className="d-flex flex-column gap-2 mb-3">
                <div
                  className="p-2.5 rounded-3 d-flex justify-content-between"
                  style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
                >
                  <span className="fw-semibold small">1. Technical Depth</span>
                  <span className="small text-secondary">Architectural correctness & tradeoffs</span>
                </div>
                <div
                  className="p-2.5 rounded-3 d-flex justify-content-between"
                  style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
                >
                  <span className="fw-semibold small">2. Relevance & Focus</span>
                  <span className="small text-secondary">Directly answering prompt intent</span>
                </div>
                <div
                  className="p-2.5 rounded-3 d-flex justify-content-between"
                  style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
                >
                  <span className="fw-semibold small">3. Completeness</span>
                  <span className="small text-secondary">Edge cases & production metrics</span>
                </div>
                <div
                  className="p-2.5 rounded-3 d-flex justify-content-between"
                  style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
                >
                  <span className="fw-semibold small">4. Communication Clarity</span>
                  <span className="small text-secondary">Structured STAR articulation</span>
                </div>
              </div>

              <div
                className="p-3 rounded-3 small text-secondary mt-auto"
                style={{ background: 'rgba(0, 113, 227, 0.06)', border: '1px solid rgba(0, 113, 227, 0.15)' }}
              >
                <i className="bi bi-mic text-primary me-1"></i>
                <strong>Voice Support Enabled:</strong> You can dictate answers using your browser microphone or type text directly into the room.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE LIVE INTERVIEW - macOS FaceTime / Studio Camera View */}
      {!inSetup && !interviewReport && currentQuestion && (
        <div className="card mac-card p-4 rounded-4 mb-4 shadow-lg">
          {/* macOS FaceTime / Studio Top Bar */}
          <div className="mac-facetime-frame mb-4" style={{ height: 200 }}>
            <div className="mac-facetime-glass-header">
              <div className="d-flex align-items-center gap-2">
                <span className="badge rounded-pill bg-danger d-flex align-items-center gap-1.5 px-2.5 py-1">
                  <span className="spinner-grow spinner-grow-sm text-light" style={{ width: 6, height: 6 }} role="status"></span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>LIVE SIMULATION</span>
                </span>
                <span className="text-white small fw-medium">
                  Question {currentQuestion.questionNumber} of {interviewSession?.totalQuestions}
                </span>
              </div>

              <div className="d-flex align-items-center gap-2">
                {isRecording && (
                  <div className="mac-audio-wave me-2">
                    <span className="mac-audio-bar"></span>
                    <span className="mac-audio-bar"></span>
                    <span className="mac-audio-bar"></span>
                    <span className="mac-audio-bar"></span>
                    <span className="mac-audio-bar"></span>
                  </div>
                )}
                <button
                  className="btn btn-sm btn-dark text-white rounded-pill border border-secondary px-3"
                  onClick={() => speakText(currentQuestion.questionText)}
                  title="Read Question Aloud"
                >
                  <i className="bi bi-volume-up-fill me-1"></i> Read Aloud
                </button>
              </div>
            </div>

            {/* Simulated Camera Center Badge */}
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white mb-2 shadow"
                style={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #0071E3 0%, #5856D6 100%)',
                }}
              >
                <i className="bi bi-person-fill fs-3"></i>
              </div>
              <span className="text-white-50 small">Candidate Audio/Video Channel Active</span>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-3" style={{ borderColor: 'var(--mac-border)' }}>
            <div>
              <span className="badge rounded-pill bg-primary me-2">
                {currentQuestion.category.toUpperCase()}
              </span>
              <span className="badge rounded-pill bg-light text-secondary border">
                {interviewSession?.jobRole}
              </span>
            </div>
            <span className="small text-secondary">
              Difficulty: {interviewSession?.difficulty}
            </span>
          </div>

          <h4 className="fw-bold mb-4" style={{ lineHeight: 1.45, letterSpacing: '-0.02em' }}>
            "{currentQuestion.questionText}"
          </h4>

          {/* Answer Input Area */}
          <div className="mb-3 position-relative">
            <textarea
              className="form-control rounded-3"
              style={{
                background: 'var(--mac-surface)',
                border: '1px solid var(--mac-border)',
                color: 'var(--mac-text-primary)',
                fontSize: '0.94rem',
                lineHeight: 1.6,
              }}
              rows="6"
              placeholder="Structure your answer clearly. Explain key architectural concepts, trade-offs, and past project precedents..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />

            {/* Mic Toggle Button */}
            {speechSupported && (
              <button
                type="button"
                className={`btn btn-sm position-absolute bottom-0 end-0 m-3 rounded-pill px-3 d-flex align-items-center gap-1.5 ${
                  isRecording ? 'btn-danger animate-pulse' : 'mac-btn-secondary'
                }`}
                onClick={handleVoiceInputToggle}
              >
                <i className={`bi ${isRecording ? 'bi-stop-fill' : 'bi-mic-fill'}`}></i>
                <span>{isRecording ? 'Recording Voice...' : 'Dictate Answer'}</span>
              </button>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span className="small text-secondary">
              Word count: {answerText.trim().split(/\s+/).filter(Boolean).length} words
            </span>

            <button
              className="btn btn-primary px-4 py-2 fw-semibold rounded-pill"
              onClick={handleSubmitAnswer}
              disabled={evaluating || !answerText.trim()}
            >
              {evaluating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Evaluating Answer...
                </>
              ) : (
                'Submit Answer & Next'
              )}
            </button>
          </div>

          {/* Real-time Follow-up / Evaluation Feedback */}
          {latestEvaluation && (
            <div
              className="mt-4 p-3 rounded-3"
              style={{ background: 'rgba(52, 199, 89, 0.08)', border: '1px solid rgba(52, 199, 89, 0.2)' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="badge rounded-pill bg-success text-white">
                  Previous Answer Score: {latestEvaluation.scores.overall}/100
                </span>
                <span className="small text-secondary">
                  Tech: {latestEvaluation.scores.technical} • Clarity: {latestEvaluation.scores.clarity}
                </span>
              </div>
              <p className="small mb-1">
                <strong>Feedback:</strong> {latestEvaluation.feedback}
              </p>
              {latestEvaluation.followUpQuestion && (
                <div className="small text-primary mt-2">
                  <i className="bi bi-arrow-return-right me-1"></i>
                  <strong>Follow-up Consideration:</strong> {latestEvaluation.followUpQuestion}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: COMPREHENSIVE INTERVIEW REPORT */}
      {interviewReport && (
        <div className="card mac-card p-4 p-md-5 rounded-4 mb-4 shadow-lg">
          <div className="text-center py-2 border-bottom mb-4" style={{ borderColor: 'var(--mac-border)' }}>
            <span className="ai-badge mb-2">Simulation Complete</span>
            <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.025em' }}>Interview Performance Report</h2>
            <p className="text-secondary small">
              Evaluated for <strong>{interviewReport.jobRole}</strong> ({interviewReport.difficulty} Level)
            </p>

            <div className="d-flex justify-content-center gap-4 my-4">
              <div
                className="p-3 rounded-4 text-center"
                style={{ minWidth: 140, background: 'rgba(0, 113, 227, 0.08)', border: '1px solid rgba(0, 113, 227, 0.2)' }}
              >
                <span className="text-secondary small fw-bold d-block text-uppercase" style={{ fontSize: '0.68rem' }}>Overall Score</span>
                <span className="fs-1 fw-bold text-primary">{interviewReport.overallScore}%</span>
              </div>
              <div
                className="p-3 rounded-4 text-center"
                style={{ minWidth: 140, background: 'rgba(52, 199, 89, 0.08)', border: '1px solid rgba(52, 199, 89, 0.2)' }}
              >
                <span className="text-secondary small fw-bold d-block text-uppercase" style={{ fontSize: '0.68rem' }}>Technical</span>
                <span className="fs-1 fw-bold text-success">{interviewReport.technicalScore}%</span>
              </div>
              <div
                className="p-3 rounded-4 text-center"
                style={{ minWidth: 140, background: 'rgba(255, 159, 10, 0.08)', border: '1px solid rgba(255, 159, 10, 0.2)' }}
              >
                <span className="text-secondary small fw-bold d-block text-uppercase" style={{ fontSize: '0.68rem' }}>Clarity</span>
                <span className="fs-1 fw-bold text-warning">{interviewReport.clarityScore}%</span>
              </div>
            </div>

            <p className="small text-secondary mx-auto mb-0" style={{ maxWidth: 600, lineHeight: 1.55 }}>
              {interviewReport.feedbackSummary}
            </p>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div
                className="p-3 rounded-3 h-100"
                style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
              >
                <h6 className="fw-bold text-success mb-2">
                  <i className="bi bi-check-circle-fill me-1"></i> Strong Response Highlights
                </h6>
                <ul className="small text-secondary mb-0 ps-3">
                  {interviewReport.strongPoints?.map((p, i) => (
                    <li key={i} className="mb-1">{p}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-md-6">
              <div
                className="p-3 rounded-3 h-100"
                style={{ background: 'var(--mac-surface)', border: '1px solid var(--mac-border)' }}
              >
                <h6 className="fw-bold text-danger mb-2">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i> Areas for Technical Hardening
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
            <button className="btn btn-primary px-5 py-2.5 rounded-pill" onClick={() => setInSetup(true)}>
              Start Another Interview Round
            </button>
          </div>
        </div>
      )}

      {/* Past Interview History Table */}
      {history.length > 0 && inSetup && (
        <div className="card mac-card p-4">
          <h5 className="fw-bold mb-3">Past Interview Sessions</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ color: 'var(--mac-text-primary)' }}>
              <thead>
                <tr className="text-secondary small text-uppercase" style={{ borderColor: 'var(--mac-border)' }}>
                  <th>Role</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id} style={{ borderColor: 'var(--mac-border)' }}>
                    <td className="fw-bold">{item.jobRole}</td>
                    <td>
                      <span className="badge rounded-pill bg-light text-secondary border">
                        {item.category}
                      </span>
                    </td>
                    <td>{item.difficulty}</td>
                    <td>
                      <span className="fw-bold text-primary">{item.overallScore || 0}%</span>
                    </td>
                    <td className="small text-secondary">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm mac-btn-secondary py-1 px-3 rounded-pill"
                        onClick={() => handleViewPastReport(item._id)}
                      >
                        View Report
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
