import React, { useState, useEffect } from 'react';
import { peersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const PeersPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations', 'connections', 'groups'
  const [messageNotice, setMessageNotice] = useState('');

  // Real-time Chat Drawer State
  const [activeChatPeer, setActiveChatPeer] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    loadPeerData();

    // Initialize Socket.IO connection
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('receive_peer_message', (payload) => {
      setChatMessages((prev) => [...prev, payload]);
    });

    return () => newSocket.disconnect();
  }, []);

  const loadPeerData = async () => {
    try {
      setLoading(true);
      const [recsRes, connRes, groupsRes] = await Promise.allSettled([
        peersAPI.getRecommendations(),
        peersAPI.getMyConnections(),
        peersAPI.getStudyGroups(),
      ]);

      if (recsRes.status === 'fulfilled' && recsRes.value.data.success) {
        setRecommendations(recsRes.value.data.recommendations);
      }
      if (connRes.status === 'fulfilled' && connRes.value.data.success) {
        setConnections(connRes.value.data.peers);
      }
      if (groupsRes.status === 'fulfilled' && groupsRes.value.data.success) {
        setStudyGroups(groupsRes.value.data.groups);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId, compatibilityScore) => {
    try {
      const res = await peersAPI.sendConnectRequest(userId, compatibilityScore);
      if (res.data && res.data.success) {
        setMessageNotice('Connection request sent successfully!');
        setRecommendations(prev =>
          prev.map(r => r.userId === userId ? { ...r, connectionStatus: 'pending' } : r)
        );
        setTimeout(() => setMessageNotice(''), 4000);
      }
    } catch (err) {
      alert('Failed to send connection request: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenChat = (peerItem) => {
    setActiveChatPeer(peerItem);
    setChatMessages([
      {
        senderName: peerItem.peer.name,
        senderId: peerItem.peer._id,
        message: `Hi ${user?.name?.split(' ')[0]}! Great connecting with you on MentorMind AI. Looking forward to sharing knowledge!`,
        timestamp: new Date().toISOString(),
      }
    ]);
    if (socket) {
      socket.emit('join_peer_chat', { connectionId: peerItem.connectionId });
    }
  };

  const handleSendDirectMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket || !activeChatPeer) return;

    const msgData = {
      connectionId: activeChatPeer.connectionId,
      senderId: user.id,
      senderName: user.name,
      message: chatInput.trim(),
    };

    socket.emit('send_peer_message', msgData);
    setChatInput('');
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const res = await peersAPI.joinStudyGroup(groupId);
      if (res.data && res.data.success) {
        setMessageNotice('Successfully joined study group!');
        loadPeerData();
        setTimeout(() => setMessageNotice(''), 4000);
      }
    } catch (err) {
      alert('Failed to join group: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="ai-badge mb-1">
            <i className="bi bi-people-fill text-primary"></i>
            <span>Collaborative Learning Intelligence</span>
          </div>
          <h3 className="fw-bold text-dark mb-0">AI Peer Skill Matching</h3>
          <p className="text-secondary small mb-0">
            Connect with learners with shared career goals and complementary skill strengths
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="btn-group shadow-sm bg-white p-1 rounded-3 border">
          <button
            className={`btn btn-sm ${activeTab === 'recommendations' ? 'btn-primary' : 'btn-light text-secondary'}`}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommended Peers ({recommendations.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'connections' ? 'btn-primary' : 'btn-light text-secondary'}`}
            onClick={() => setActiveTab('connections')}
          >
            My Connections ({connections.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'groups' ? 'btn-primary' : 'btn-light text-secondary'}`}
            onClick={() => setActiveTab('groups')}
          >
            Study Groups ({studyGroups.length})
          </button>
        </div>
      </div>

      {messageNotice && <div className="alert alert-success py-2 px-3 small mb-3">{messageNotice}</div>}

      {/* TAB 1: RECOMMENDED PEERS */}
      {activeTab === 'recommendations' && (
        <div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <div className="text-muted small mt-2">Computing Peer Compatibility Scores...</div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="card p-5 text-center text-muted border-0 shadow-sm bg-white">
              No matching peers found currently. Complete your profile skills to enhance matching.
            </div>
          ) : (
            <div className="row g-4">
              {recommendations.map((rec) => (
                <div key={rec.userId} className="col-md-6 col-lg-4">
                  <div className="card p-4 border-0 shadow-sm h-100 d-flex flex-column justify-content-between bg-white card-hover">
                    <div>
                      {/* Header with avatar & compatibility */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-5 flex-shrink-0"
                            style={{ width: 48, height: 48 }}
                          >
                            {rec.name.charAt(0)}
                          </div>
                          <div>
                            <h6 className="fw-bold text-dark mb-0">{rec.name}</h6>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {rec.institution} • {rec.degree}
                            </div>
                            <span className="badge bg-primary-subtle text-primary mt-1" style={{ fontSize: '0.7rem' }}>
                              {rec.targetCareer}
                            </span>
                          </div>
                        </div>

                        <span className="badge bg-success-subtle text-success fs-6 py-1.5 px-2.5">
                          {rec.compatibilityScore}% Match
                        </span>
                      </div>

                      {/* Complementary Skills Matrix */}
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <div className="p-2 border rounded-2 bg-light small h-100">
                            <span className="text-muted d-block fw-semibold" style={{ fontSize: '0.7rem' }}>
                              THEY CAN TEACH
                            </span>
                            <span className="text-success fw-bold" style={{ fontSize: '0.8rem' }}>
                              {rec.skillsTheyCanTeach?.join(', ') || 'Backend & Cloud'}
                            </span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-2 border rounded-2 bg-light small h-100">
                            <span className="text-muted d-block fw-semibold" style={{ fontSize: '0.7rem' }}>
                              THEY WANT TO LEARN
                            </span>
                            <span className="text-primary fw-bold" style={{ fontSize: '0.8rem' }}>
                              {rec.skillsTheyWantToLearn?.join(', ') || 'Frontend & SPA'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Main Skills Badges */}
                      <div className="mb-3">
                        <span className="text-muted small d-block mb-1" style={{ fontSize: '0.72rem' }}>VERIFIED SKILLS</span>
                        <div className="d-flex flex-wrap gap-1">
                          {rec.mainSkills?.map((s, idx) => (
                            <span key={idx} className="badge bg-white text-secondary border small" style={{ fontSize: '0.72rem' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      {rec.connectionStatus === 'accepted' ? (
                        <button className="btn btn-sm btn-success w-100" disabled>
                          <i className="bi bi-check2-circle me-1"></i> Connected
                        </button>
                      ) : rec.connectionStatus === 'pending' ? (
                        <button className="btn btn-sm btn-light border text-muted w-100" disabled>
                          <i className="bi bi-hourglass-split me-1"></i> Request Pending
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary w-100"
                          onClick={() => handleSendRequest(rec.userId, rec.compatibilityScore)}
                        >
                          <i className="bi bi-person-plus me-1"></i> Connect & Collaborate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY CONNECTIONS */}
      {activeTab === 'connections' && (
        <div className="card p-4 border-0 shadow-sm bg-white">
          <h5 className="fw-bold text-dark mb-3">Accepted Peer Connections ({connections.length})</h5>
          {connections.length === 0 ? (
            <div className="text-center py-5 text-muted small">
              You haven't connected with any peers yet. Browse "Recommended Peers" above to initiate a connection.
            </div>
          ) : (
            <div className="row g-3">
              {connections.map((c) => (
                <div key={c.connectionId} className="col-md-6 col-lg-4">
                  <div className="p-3 border rounded-3 bg-light d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                        {c.peer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="fw-bold text-dark small">{c.peer.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{c.peer.institution || 'Fellow Learner'}</div>
                      </div>
                    </div>
                    <button className="btn btn-sm btn-primary" onClick={() => handleOpenChat(c)}>
                      <i className="bi bi-chat-dots me-1"></i> Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STUDY GROUPS */}
      {activeTab === 'groups' && (
        <div>
          <div className="row g-4">
            {studyGroups.map((grp) => {
              const isMember = grp.members?.some((m) => m._id === user.id || m === user.id);
              return (
                <div key={grp._id} className="col-md-6">
                  <div className="card p-4 border-0 shadow-sm bg-white h-100">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className="badge bg-primary-subtle text-primary mb-1">{grp.targetCareerName}</span>
                        <h5 className="fw-bold text-dark mb-1">{grp.name}</h5>
                      </div>
                      <span className="badge bg-light text-secondary border">
                        {grp.members?.length || 1} / {grp.maxMembers} Members
                      </span>
                    </div>

                    <p className="text-secondary small mb-3">{grp.description}</p>

                    {/* Active Sprint Challenge */}
                    {grp.activeChallenge && (
                      <div className="p-3 bg-light rounded-3 border mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-dark small">
                            <i className="bi bi-lightning-charge text-warning me-1"></i> Active Sprint Challenge
                          </strong>
                          <span className="badge bg-warning-subtle text-warning" style={{ fontSize: '0.68rem' }}>
                            7 Days Left
                          </span>
                        </div>
                        <div className="fw-semibold text-dark small">{grp.activeChallenge.title}</div>
                        <div className="text-muted small mt-1">{grp.activeChallenge.description}</div>
                      </div>
                    )}

                    <div className="mt-auto pt-2">
                      {isMember ? (
                        <button className="btn btn-outline-success btn-sm w-100" disabled>
                          <i className="bi bi-check-circle-fill me-1"></i> You are a Member
                        </button>
                      ) : (
                        <button className="btn btn-primary btn-sm w-100" onClick={() => handleJoinGroup(grp._id)}>
                          <i className="bi bi-plus-circle me-1"></i> Join Study Group
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Direct Messaging Slide-out Drawer */}
      {activeChatPeer && (
        <div
          className="position-fixed bottom-0 end-0 me-4 mb-4 bg-white shadow-lg rounded-4 border overflow-hidden d-flex flex-column"
          style={{ width: 380, height: 480, zIndex: 1050 }}
        >
          {/* Drawer Header */}
          <div className="p-3 bg-primary text-white d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle bg-white text-primary fw-bold d-flex align-items-center justify-content-center" style={{ width: 30, height: 30 }}>
                {activeChatPeer.peer.name.charAt(0)}
              </div>
              <div>
                <div className="fw-bold small">{activeChatPeer.peer.name}</div>
                <div className="small opacity-75" style={{ fontSize: '0.7rem' }}>Peer Study Chat (Live Socket)</div>
              </div>
            </div>
            <button className="btn btn-sm btn-link text-white p-0" onClick={() => setActiveChatPeer(null)}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="p-3 flex-grow-1 overflow-y-auto d-flex flex-column gap-2 bg-light">
            {chatMessages.map((msg, i) => {
              const isMine = msg.senderId === user.id;
              return (
                <div key={i} className={`d-flex ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                  <div
                    className={`p-2 px-3 rounded-3 small ${
                      isMine ? 'bg-primary text-white' : 'bg-white text-dark border'
                    }`}
                    style={{ maxWidth: '85%' }}
                  >
                    <div>{msg.message}</div>
                    <div className="text-end opacity-75 mt-0.5" style={{ fontSize: '0.65rem' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendDirectMessage} className="p-2 border-top bg-white d-flex gap-2">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Type message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm px-3">
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PeersPage;
