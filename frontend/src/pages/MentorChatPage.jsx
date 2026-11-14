import React, { useState, useEffect, useRef } from 'react';
import { mentorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MentorChatPage = () => {
  const { user, profile } = useAuth();
  const { isDark } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadConversations = async () => {
    try {
      const res = await mentorAPI.getConversations();
      if (res.data && res.data.success) {
        setConversations(res.data.conversations);
        if (res.data.conversations.length > 0) {
          setActiveConversationId(res.data.conversations[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const res = await mentorAPI.getMessages(convId);
      if (res.data && res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (customText) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || sending) return;

    setInputMessage('');
    setSending(true);

    // Optimistically add user message
    const tempUserMsg = {
      _id: 'temp-' + Date.now(),
      sender: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await mentorAPI.sendMessage({
        conversationId: activeConversationId,
        content: textToSend,
      });

      if (res.data && res.data.success) {
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== tempUserMsg._id),
          { ...tempUserMsg, _id: res.data.message._id + '-u' },
          res.data.message,
        ]);
        if (!activeConversationId) {
          setActiveConversationId(res.data.conversationId);
          loadConversations();
        }
      }
    } catch (err) {
      alert('Failed to send message: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  const suggestedPrompts = [
    'What should I learn today?',
    'Explain React hooks in simple terms.',
    'Give me a practical coding challenge.',
    'Explain the difference between SQL and MongoDB.',
    'How do I prepare for Full Stack technical interviews?',
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Personal AI Mentor</h3>
          <p className="text-secondary small mb-0">
            Context-aware career co-pilot calibrated to your skill gaps and roadmap
          </p>
        </div>

        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
          onClick={() => {
            setActiveConversationId(null);
            setMessages([]);
          }}
        >
          <i className="bi bi-plus-lg"></i> New Session
        </button>
      </div>

      <div className="row g-4">
        {/* Chat Threads Sidebar - macOS Finder / Notes style */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="card mac-card p-3 h-100 d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-3 px-1">
              <span className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                Threads
              </span>
              <span className="badge rounded-pill bg-light text-secondary border small" style={{ fontSize: '0.68rem' }}>
                {conversations.length}
              </span>
            </div>

            <div className="d-flex flex-column gap-1 overflow-y-auto" style={{ maxHeight: 480 }}>
              {conversations.map((conv) => {
                const isActive = activeConversationId === conv._id;
                return (
                  <button
                    key={conv._id}
                    className="btn btn-sm text-start p-2.5 rounded-3 d-flex align-items-center gap-2 border-0"
                    style={{
                      background: isActive ? 'var(--mac-blue)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--mac-text-primary)',
                      transition: 'all 0.18s ease',
                    }}
                    onClick={() => setActiveConversationId(conv._id)}
                  >
                    <i className={`bi bi-chat-left-text ${isActive ? 'text-white' : 'text-secondary'}`}></i>
                    <span className="text-truncate flex-grow-1" style={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 500 }}>
                      {conv.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Learner Context Mini Card */}
            <div className="mt-auto pt-3 border-top" style={{ borderColor: 'var(--mac-border)' }}>
              <span className="small text-secondary d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                Active Profile Context
              </span>
              <div className="small fw-bold">{profile?.targetCareerName || 'Full Stack Developer'}</div>
              <div className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                Readiness: {profile?.careerReadinessScore || 48}% • {profile?.existingTechnicalSkills?.length || 5} Skills Tracked
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Interface - macOS Window Style */}
        <div className="col-lg-9">
          <div className="card mac-card rounded-4 d-flex flex-column shadow-lg" style={{ height: 680 }}>
            {/* macOS Window Titlebar with Traffic Lights */}
            <div
              className="p-3 px-4 border-bottom d-flex align-items-center justify-content-between"
              style={{
                borderColor: 'var(--mac-border)',
                background: 'rgba(140, 140, 150, 0.04)',
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="mac-traffic-lights">
                  <span className="mac-traffic-dot mac-traffic-close"></span>
                  <span className="mac-traffic-dot mac-traffic-minimize"></span>
                  <span className="mac-traffic-dot mac-traffic-zoom"></span>
                </div>

                <div className="d-flex align-items-center gap-2 ms-2">
                  <div
                    className="text-white rounded-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: 28,
                      height: 28,
                      background: 'linear-gradient(135deg, #0071E3 0%, #5856D6 100%)',
                    }}
                  >
                    <i className="bi bi-robot fs-6"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>MentorMind AI Co-Pilot</h6>
                    <span className="small text-success d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                      <span className="ai-pulse-dot" style={{ width: 6, height: 6 }}></span>
                      Context Engine Synced
                    </span>
                  </div>
                </div>
              </div>

              <div className="ai-badge">
                <i className="bi bi-stars"></i>
                <span>10 Specialized Agents</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="p-4 flex-grow-1 overflow-y-auto d-flex flex-column gap-3">
              {messages.length === 0 ? (
                <div className="text-center my-auto py-4">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
                    style={{
                      width: 64,
                      height: 64,
                      background: 'rgba(0, 113, 227, 0.1)',
                      color: 'var(--mac-blue)',
                    }}
                  >
                    <i className="bi bi-robot fs-2"></i>
                  </div>
                  <h5 className="fw-bold">How can I guide your learning today?</h5>
                  <p className="text-secondary small mx-auto mb-4" style={{ maxWidth: 440, lineHeight: 1.5 }}>
                    I have full visibility into your target career, declared skills, assessment results, and roadmap milestones.
                  </p>

                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        className="btn btn-sm mac-btn-secondary text-secondary card-hover rounded-pill px-3"
                        style={{ fontSize: '0.82rem' }}
                        onClick={() => handleSendMessage(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={idx} className={`d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                        <div
                          className="chat-text"
                          style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
                        >
                          {msg.content}
                        </div>

                        {/* Suggested Follow-up Actions */}
                        {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                          <div className="mt-3 pt-2 border-top d-flex flex-wrap gap-1.5" style={{ borderColor: 'var(--mac-border)' }}>
                            {msg.suggestedActions.map((act, aIdx) => (
                              <button
                                key={aIdx}
                                className="btn btn-sm rounded-pill text-primary small py-1 px-3"
                                style={{
                                  fontSize: '0.78rem',
                                  background: 'rgba(0, 113, 227, 0.08)',
                                  border: '1px solid rgba(0, 113, 227, 0.2)',
                                  fontWeight: 500,
                                }}
                                onClick={() => handleSendMessage(act)}
                              >
                                → {act}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {sending && (
                <div className="d-flex justify-content-start">
                  <div className="chat-bubble-assistant d-flex align-items-center gap-2">
                    <span className="spinner-grow spinner-grow-sm text-primary" role="status"></span>
                    <span className="small text-secondary">AI Mentor is analyzing your skill profile and composing advice...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Pill Strip */}
            <div
              className="px-3 pt-2 d-flex gap-2 overflow-x-auto pb-2 border-top"
              style={{
                borderColor: 'var(--mac-border)',
                background: 'rgba(140, 140, 150, 0.03)',
              }}
            >
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  className="btn btn-sm rounded-pill text-secondary text-nowrap py-1 px-3"
                  style={{
                    fontSize: '0.76rem',
                    background: 'var(--mac-surface)',
                    border: '1px solid var(--mac-border)',
                  }}
                  onClick={() => handleSendMessage(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* macOS Frosted Input Capsule */}
            <div
              className="p-3 border-top"
              style={{
                borderColor: 'var(--mac-border)',
                background: 'var(--mac-surface)',
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="d-flex gap-2"
              >
                <input
                  type="text"
                  className="form-control rounded-pill px-4"
                  style={{
                    background: 'rgba(140, 140, 150, 0.08)',
                    border: '1px solid var(--mac-border)',
                    color: 'var(--mac-text-primary)',
                    fontSize: '0.92rem',
                  }}
                  placeholder="Ask a technical concept, roadmap question, or request a challenge..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2"
                  disabled={sending || !inputMessage.trim()}
                >
                  <span>Send</span>
                  <i className="bi bi-arrow-up-circle-fill fs-5"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorChatPage;
