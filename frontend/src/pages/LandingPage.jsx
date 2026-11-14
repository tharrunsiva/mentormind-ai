import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async () => {
    try {
      await login('demo@mentormind.ai', 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  const agents = [
    { title: 'Profile Analysis Agent', icon: 'bi-person-gear', desc: 'Parses resume PDFs and extracts verified technical proficiencies.', grad: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' },
    { title: 'Career Intelligence Agent', icon: 'bi-compass', desc: 'Maps industry role requirements against market expectations.', grad: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)' },
    { title: 'Skill Gap Analysis Agent', icon: 'bi-diagram-3', desc: 'Identifies strong, developing, and missing skills with exact gap percentages.', grad: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)' },
    { title: 'Learning Path Agent', icon: 'bi-map', desc: 'Generates structured multi-phase milestones with prerequisite ordering.', grad: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)' },
    { title: 'Resource Recommendation Agent', icon: 'bi-collection-play', desc: 'Curates verified tutorials, official docs, and interactive coding exercises.', grad: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' },
    { title: 'Assessment Agent', icon: 'bi-patch-check', desc: 'Designs skill benchmarks and short-answer rubrics.', grad: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
    { title: 'Progress Evaluation Agent', icon: 'bi-graph-up-arrow', desc: 'Monitors performance curves and triggers adaptive roadmap adjustments.', grad: 'linear-gradient(135deg, #84CC16 0%, #14B8A6 100%)' },
    { title: 'AI Mentor Agent', icon: 'bi-robot', desc: 'Context-aware conversational co-pilot answering domain questions 24/7.', grad: 'linear-gradient(135deg, #D946EF 0%, #EC4899 100%)' },
    { title: 'Peer Matching Agent', icon: 'bi-people', desc: 'Connects learners with complementary skills and mutual goals.', grad: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)' },
    { title: 'Mock Interview Agent', icon: 'bi-mic', desc: 'Simulates technical & HR interviews with rubric-driven feedback.', grad: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)' },
  ];

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'transparent' }}>
      {/* Frosted Glass Navigation */}
      <nav className="navbar navbar-expand-lg landing-nav-glass sticky-top py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2.5">
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-3 flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #4F46E5 0%, #D946EF 100%)',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.45)',
              }}
            >
              <i className="bi bi-cpu-fill fs-5"></i>
            </div>
            <span className="fw-extrabold fs-4 text-dark" style={{ letterSpacing: '-0.03em' }}>MentorMind</span>
            <span
              className="badge ms-1 px-2.5 py-1 rounded-pill text-white"
              style={{
                fontSize: '0.72rem',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                fontWeight: 700,
              }}
            >
              AI
            </span>
          </Link>

          <div className="d-flex align-items-center gap-2.5 ms-auto">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-vibrant-primary px-4">
                Open Dashboard <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            ) : (
              <>
                <button
                  onClick={handleQuickDemoLogin}
                  className="btn btn-vibrant-outline d-none d-sm-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-lightning-charge-fill text-warning"></i> Quick Demo Account
                </button>
                <Link to="/login" className="btn btn-light border text-dark fw-bold px-3.5 rounded-pill shadow-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-vibrant-primary px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Vibrant Ambient Text & Elements */}
      <section className="py-5 text-center position-relative overflow-hidden" style={{ background: 'transparent' }}>
        <div className="container py-lg-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              <div className="feature-pill-badge mb-3">
                <i className="bi bi-stars" style={{ color: '#8B5CF6' }}></i>
                <span>Multi-Agent Career Intelligence Platform</span>
              </div>
              <h1 className="display-4 fw-extrabold text-dark mb-3" style={{ lineHeight: 1.18 }}>
                Your Skills. Your Goals. <br />
                <span className="text-gradient-aurora">Your AI Mentor.</span>
              </h1>
              <p className="lead text-secondary mb-4 mx-auto" style={{ maxWidth: 680, fontSize: '1.22rem', lineHeight: 1.6 }}>
                Stop taking generic courses. MentorMind AI analyzes your current skills, pinpoints exact missing requirements for your dream career, generates an adaptive roadmap, and matches you with peer study partners.
              </p>

              <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
                <Link to="/register" className="btn btn-vibrant-primary btn-lg px-4 py-3 fs-6">
                  Start Your Personalized Journey <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <button onClick={handleQuickDemoLogin} className="btn btn-vibrant-outline btn-lg px-4 py-3 fs-6">
                  <i className="bi bi-play-circle me-2"></i> Explore Live Demo Dashboard
                </button>
              </div>

              {/* Differentiating Feature Badges in Jewel Tones */}
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <div className="badge-glow badge-glow-indigo">
                  <i className="bi bi-check-circle-fill text-primary"></i> 10 Specialized AI Agents
                </div>
                <div className="badge-glow badge-glow-pink">
                  <i className="bi bi-check-circle-fill" style={{ color: '#EC4899' }}></i> AI Peer Skill Matching
                </div>
                <div className="badge-glow badge-glow-cyan">
                  <i className="bi bi-check-circle-fill" style={{ color: '#06B6D4' }}></i> AI Mock Interview Room
                </div>
                <div className="badge-glow badge-glow-emerald">
                  <i className="bi bi-check-circle-fill text-success"></i> 100% Adaptive Roadmaps
                </div>
              </div>
            </div>
          </div>

          {/* Interactive UI Preview Showcase with Glassmorphism */}
          <div className="mt-5 pt-3">
            <div className="landing-card-glass p-3 mx-auto text-start" style={{ maxWidth: 1000 }}>
              <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3 px-2">
                <div className="d-flex gap-2">
                  <span className="rounded-circle bg-danger opacity-75" style={{ width: 12, height: 12 }}></span>
                  <span className="rounded-circle bg-warning opacity-75" style={{ width: 12, height: 12 }}></span>
                  <span className="rounded-circle bg-success opacity-75" style={{ width: 12, height: 12 }}></span>
                </div>
                <div className="text-muted small fw-medium">
                  <i className="bi bi-shield-check text-success me-1"></i> MentorMind AI Workspace — Full Stack Developer Path
                </div>
                <div
                  className="badge rounded-pill text-white px-3 py-1"
                  style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #D946EF 100%)', fontSize: '0.72rem' }}
                >
                  Live Simulation
                </div>
              </div>

              <div className="row g-3 p-2">
                <div className="col-md-4">
                  <div
                    className="p-3 rounded-4 h-100 border"
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(99, 102, 241, 0.25)',
                      borderTop: '3px solid #6366F1',
                    }}
                  >
                    <div className="text-secondary small fw-bold text-uppercase mb-1">Target Career</div>
                    <div className="fs-5 fw-bold text-dark mb-2">Full Stack Developer</div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-muted">Readiness Score</span>
                      <span className="badge-glow badge-glow-indigo">48% Ready</span>
                    </div>
                    <div className="progress rounded-pill overflow-hidden" style={{ height: 10, background: '#EEF2FF' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: '48%',
                          background: 'linear-gradient(90deg, #4F46E5 0%, #8B5CF6 100%)',
                        }}
                      ></div>
                    </div>
                    <div className="mt-3 pt-2 border-top small text-muted">
                      <i className="bi bi-arrow-up-right text-success me-1"></i> +6% gain from last React assessment
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className="p-3 rounded-4 h-100 border"
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(236, 72, 153, 0.25)',
                      borderTop: '3px solid #EC4899',
                    }}
                  >
                    <div className="text-secondary small fw-bold text-uppercase mb-1">Active AI Roadmap Phase</div>
                    <div className="fw-bold text-dark mb-2">Phase 2: Backend Architecture</div>
                    <div className="small text-muted mb-2">
                      <i className="bi bi-check2-circle text-success me-1"></i> Phase 1: Frontend Foundations (Done)
                    </div>
                    <div className="small fw-semibold mb-1" style={{ color: '#D946EF' }}>
                      <i className="bi bi-hourglass-split me-1"></i> Current: JWT Auth & Validation
                    </div>
                    <span className="badge-glow badge-glow-cyan mt-2">Prerequisites Verified</span>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className="p-3 rounded-4 h-100 border"
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderColor: 'rgba(16, 185, 129, 0.25)',
                      borderTop: '3px solid #10B981',
                    }}
                  >
                    <div className="text-secondary small fw-bold text-uppercase mb-1">AI Peer Skill Match</div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div
                        className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                        style={{
                          width: 32,
                          height: 32,
                          fontSize: '0.82rem',
                          background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
                        }}
                      >
                        MC
                      </div>
                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Maya Chen</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>94% Compatibility</div>
                      </div>
                    </div>
                    <div className="small text-muted" style={{ fontSize: '0.8rem' }}>
                      <strong>She teaches:</strong> Node & MongoDB<br />
                      <strong>You teach:</strong> React & CSS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiating Feature 1: AI Peer Skill Matching */}
      <section className="py-5" style={{ background: 'transparent' }}>
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div className="feature-pill-badge mb-3">
                <i className="bi bi-people-fill" style={{ color: '#EC4899' }}></i>
                <span>Differentiator 1</span>
              </div>
              <h2 className="display-6 fw-bold text-dark mb-3">AI Peer Skill Matching</h2>
              <p className="lead text-secondary mb-4" style={{ fontSize: '1.15rem', lineHeight: 1.6 }}>
                Traditional learning is isolating. MentorMind AI uses transparent weighted algorithms to match you with peers who have similar career goals and <strong>complementary skills</strong>.
              </p>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex gap-3">
                  <div
                    className="p-2 rounded-3 text-white flex-shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
                      boxShadow: '0 4px 12px rgba(236, 72, 153, 0.35)',
                    }}
                  >
                    <i className="bi bi-arrow-left-right fs-5"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 text-dark fs-6 fw-bold">Reciprocal Peer Learning</h5>
                    <p className="text-muted small mb-0">If you excel at React and need help with Node.js backend schemas, MentorMind pairs you with a backend learner looking to master React.</p>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <div
                    className="p-2 rounded-3 text-white flex-shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
                    }}
                  >
                    <i className="bi bi-people-fill fs-5"></i>
                  </div>
                  <div>
                    <h5 className="mb-1 text-dark fs-6 fw-bold">Collaborative Study Groups & Challenges</h5>
                    <p className="text-muted small mb-0">Join sprint study groups, compete on coding challenges, and message in real-time through WebSocket rooms.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="landing-card-glass p-4 rounded-4" style={{ borderTop: '4px solid #EC4899 !important' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-dark">Suggested Learning Partner</span>
                  <span className="badge-glow badge-glow-emerald">94% Compatibility</span>
                </div>
                <div
                  className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3 border"
                  style={{ background: 'rgba(255, 255, 255, 0.65)' }}
                >
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm"
                    style={{
                      width: 48,
                      height: 48,
                      background: 'linear-gradient(135deg, #EC4899 0%, #7C3AED 100%)',
                    }}
                  >
                    MC
                  </div>
                  <div>
                    <h5 className="mb-0 text-dark fw-bold">Maya Chen</h5>
                    <div className="text-muted small">B.S. Software Engineering • Univ. of Washington</div>
                    <span className="badge-glow badge-glow-indigo mt-1">Full Stack Developer</span>
                  </div>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div className="p-2 border rounded-3 bg-white small">
                      <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>CAN TEACH YOU</span>
                      <strong className="text-success">Node.js & MongoDB</strong>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 border rounded-3 bg-white small">
                      <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>WANTS TO LEARN</span>
                      <strong className="text-primary">React Hooks & SPA</strong>
                    </div>
                  </div>
                </div>
                <button className="btn btn-vibrant-primary w-100 py-2.5 justify-content-center">
                  <i className="bi bi-person-plus me-1"></i> Connect & Start Pair Coding
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiating Feature 2: AI Mock Interview Room */}
      <section className="py-5" style={{ background: 'transparent' }}>
        <div className="container py-4">
          <div className="row align-items-center g-5 flex-lg-row-reverse">
            <div className="col-lg-6">
              <div className="feature-pill-badge mb-3">
                <i className="bi bi-mic-fill" style={{ color: '#06B6D4' }}></i>
                <span>Differentiator 2</span>
              </div>
              <h2 className="display-6 fw-bold text-dark mb-3">AI Mock Interview Room</h2>
              <p className="lead text-secondary mb-4" style={{ fontSize: '1.15rem', lineHeight: 1.6 }}>
                Simulate role-specific technical and behavioral interviews. Receive rubric evaluations across Technical Depth, Relevance, Completeness, and Communication Clarity.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-2.5 text-secondary">
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check2-circle text-primary fs-5"></i> Career-specific categories: Technical, HR, Behavioral, Scenario, and Mixed.
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check2-circle text-primary fs-5"></i> Optional browser speech-to-text transcript and speech synthesis.
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check2-circle text-primary fs-5"></i> Comprehensive final report detailing strong points and missed concepts.
                </li>
                <li className="d-flex align-items-center gap-2">
                  <i className="bi bi-check2-circle text-primary fs-5"></i> Automatically adds weak topics to your learning roadmap.
                </li>
              </ul>
            </div>

            <div className="col-lg-6">
              <div className="landing-card-glass p-4 rounded-4" style={{ borderTop: '4px solid #06B6D4 !important' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge-glow badge-glow-indigo">Technical Question 2 of 4</span>
                  <span className="badge-glow badge-glow-amber">Mid-Level</span>
                </div>
                <h5 className="text-dark mb-3" style={{ fontSize: '1.05rem', lineHeight: 1.45 }}>
                  "How does React's Virtual DOM reconciliation algorithm optimize browser UI updates?"
                </h5>
                <div className="p-3 bg-white rounded-3 border mb-3">
                  <div className="text-muted small mb-1 fw-bold">Sample Candidate Response:</div>
                  <p className="small text-dark mb-0">
                    React keeps an in-memory representation of the DOM. When state changes, it diffs the new tree against the old tree using shallow heuristics, applying only minimal DOM patches rather than re-rendering the whole page.
                  </p>
                </div>
                <div className="p-3 bg-white rounded-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge-glow badge-glow-emerald">Evaluation Score: 88/100</span>
                    <span className="small text-muted">Technical: 90 • Clarity: 86</span>
                  </div>
                  <div className="small text-muted">
                    <strong className="text-dark">AI Feedback:</strong> Clear explanation of heuristic diffing. Consider also mentioning component keys and batch state updates.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Specialized Multi-Agent AI Grid */}
      <section className="py-5" style={{ background: 'transparent' }}>
        <div className="container py-4">
          <div className="text-center mb-5">
            <div className="feature-pill-badge mb-2">
              <i className="bi bi-diagram-3-fill" style={{ color: '#4F46E5' }}></i>
              <span>LangGraph Orchestration</span>
            </div>
            <h2 className="fw-extrabold text-dark display-6">10 Specialized Collaborative AI Agents</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: 620, fontSize: '1.05rem' }}>
              MentorMind AI is powered by specialized agents running on a unified coordination graph to deliver personalized career intelligence.
            </p>
          </div>

          <div className="row g-3">
            {agents.map((ag, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <div className="landing-agent-card">
                  <div className="d-flex align-items-center gap-3 mb-2.5">
                    <div
                      className="text-white rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 44,
                        height: 44,
                        background: ag.grad,
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <i className={`bi ${ag.icon} fs-5`}></i>
                    </div>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                        Agent {idx + 1}
                      </div>
                      <h6 className="mb-0 text-dark fw-bold">{ag.title}</h6>
                    </div>
                  </div>
                  <p className="text-secondary small mb-0 mt-1">{ag.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action with Radiant Aurora Mesh Banner */}
      <section className="py-5 container my-4">
        <div className="vibrant-hero-banner text-center py-5 my-2">
          <div className="position-relative" style={{ zIndex: 2 }}>
            <h2 className="display-6 fw-extrabold mb-3 text-white">Ready to Accelerate Your Career?</h2>
            <p className="lead opacity-95 mb-4 mx-auto text-white" style={{ maxWidth: 640 }}>
              Join MentorMind AI today, discover your true skill readiness, and follow an adaptive learning path built specifically for you.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Link to="/register" className="btn btn-light text-primary btn-lg px-4 py-3 fw-bold rounded-pill shadow-lg">
                Create Free Account
              </Link>
              <button
                onClick={handleQuickDemoLogin}
                className="btn btn-outline-light btn-lg px-4 py-3 fw-bold rounded-pill shadow-lg"
              >
                Explore Demo Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Frosted Glass Footer */}
      <footer className="py-4 landing-nav-glass mt-auto">
        <div className="container d-flex flex-wrap justify-content-between align-items-center text-muted small">
          <div>
            <strong className="text-dark">MentorMind AI</strong> — AI-Powered Adaptive Career & Learning Intelligence Platform.
          </div>
          <div className="d-flex gap-3">
            <span>Production SaaS Architecture</span>
            <span>•</span>
            <span>Node.js / Express</span>
            <span>•</span>
            <span>FastAPI Multi-Agent</span>
            <span>•</span>
            <span>MongoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;