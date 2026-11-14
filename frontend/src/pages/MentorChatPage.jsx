import React, { useState, useEffect, useRef } from 'react';
import { mentorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MentorChatPage = () => {
  const { user, profile } = useAuth();
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
    'What are the mandatory competencies for Full Stack Developer?',
    'Explain React state composition vs Redux in architectural terms.',
    'Provide a standard algorithmic challenge for technical assessment.',
    'How do I benchmark my readiness for Ministry technical examinations?',
  ];

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="gov-seal-badge mb-1">
            <i className="bi bi-shield-lock-fill"></i>
            <span>Statutory Advisory Channel</span>
          </div>
          <h3 className="fw-bold text-dark mb-0">National AI Career Advisory Co-Pilot</h3>
          <p className="text-secondary small mb-0">
            Automated technical guidance and curriculum advisory aligned with National Skill Standards
          </p>
        </div>

        <button
          className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
          onClick={() => {
            setActiveConversationId(null);
            setMessages([]);
          }}
        >
          <i className="bi bi-plus-lg"></i> New Consultation Thread
        </button>
      </div>

      <div className="row g-4">
        {/* Threads Sidebar */}
        <div className="col-lg-3 d-none d-lg-block">
          <div className="card border bg-white p-3 h-100 shadow-sm d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-3 px-1">
              <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                Consultation Records
              </span>
              <span className="badge bg-light text-secondary border small">
                {conversations.length}
              </span>
            </div>

            <div className="d-flex flex-column gap-1 overflow-y-auto" style={{ maxHeight: 480 }}>
              {conversations.map((conv) => {
                const isActive = activeConversationId === conv._id;
                return (
                  <button
                    key={conv._id}
                    className={`btn btn-sm text-start p-2.5 rounded-2 d-flex align-items-center gap-2 border ${
                      isActive ? 'btn-primary text-white' : 'btn-light text-secondary'
                    }`}
                    onClick={() => setActiveConversationId(conv._id)}
                  >
                    <i className="bi bi-chat-left-text"></i>
                    <span className="text-truncate flex-grow-1" style={{ fontSize: '0.82rem' }}>
                      {conv.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-3 border-top">
              <span className="small text-muted d-block fw-bold text-uppercase mb-1" style={{ fontSize: '0.68rem' }}>
                Active Candidate Record
              </span>
              <div className="small fw-bold text-dark">{profile?.targetCareerName || 'Full Stack Developer'}</div>
              <div className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                Readiness Index: {profile?.careerReadinessScore || 48}% • Certified Skills: {profile?.existingTechnicalSkills?.length || 5}
              </div>
            </div>
          </div>
        </div>

        {/* Main Advisory Chamber */}
        <div className="col-lg-9">
          <div className="card border bg-white rounded-3 d-flex flex-column shadow-sm" style={{ height: 680 }}>
            <div className="p-3 px-4 border-bottom bg-light d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-1 d-flex align-items-center justify-content-center text-white"
                  style={{ width: 34, height: 34, background: '#0F2C59' }}
                >
                  <i className="bi bi-robot fs-5"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Ministry AI Technical Co-Pilot</h6>
                  <span className="small text-success d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                    <span className="rounded-circle bg-success d-inline-block" style={{ width: 6, height: 6 }}></span>
                    National Occupational Standard Agent Active
                  </span>
                </div>
              </div>
              <span className="badge bg-light text-dark border">Official Advisory Engine</span>
            </div>

            {/* Messages Area */}
            <div className="p-4 flex-grow-1 overflow-y-auto d-flex flex-column gap-3">
              {messages.length === 0 ? (
                <div className="text-center my-auto py-4">
                  <div
                    className="rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
                    style={{ width: 64, height: 64, background: '#EEF2FF', color: '#0F2C59' }}
                  >
                    <i className="bi bi-robot fs-2"></i>
                  </div>
                  <h5 className="fw-bold text-dark">Ministry Technical Guidance Chamber</h5>
                  <p className="text-secondary small mx-auto mb-4" style={{ maxWidth: 460 }}>
                    Inquire regarding official competency benchmarks, curricular clarifications, architectural best practices, and examination prerequisites.
                  </p>

                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    {suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        className="btn btn-sm btn-light border text-dark px-3 py-1.5"
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
                      <div
                        className="p-3 rounded-2 shadow-sm"
                        style={{
                          maxWidth: '82%',
                          background: isUser ? '#0F2C59' : '#F8FAFC',
                          color: isUser ? '#FFFFFF' : '#0F172A',
                          border: isUser ? 'none' : '1px solid #CBD5E1',
                        }}
                      >
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.92rem' }}>
                          {msg.content}
                        </div>

                        {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                          <div className="mt-3 pt-2 border-top d-flex flex-wrap gap-1.5">
                            {msg.suggestedActions.map((act, aIdx) => (
                              <button
                                key={aIdx}
                                className="btn btn-sm btn-light border text-primary small py-1 px-2.5"
                                style={{ fontSize: '0.78rem' }}
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
                  <div className="p-3 bg-light border rounded-2 d-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                    <span className="small text-secondary">Ministry AI Advisor is synthesizing official guidance...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Strip */}
            <div className="px-3 pt-2 d-flex gap-2 overflow-x-auto pb-2 border-top bg-light">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  className="btn btn-sm btn-white border text-secondary text-nowrap py-1 px-2.5"
                  style={{ fontSize: '0.76rem', background: '#FFFFFF' }}
                  onClick={() => handleSendMessage(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-top bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="d-flex gap-2"
              >
                <input
                  type="text"
                  className="form-control rounded-2"
                  placeholder="Enter your technical or curriculum question here..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-semibold"
                  disabled={sending || !inputMessage.trim()}
                >
                  Submit Query
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
