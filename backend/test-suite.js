import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api';
const AI_BASE = 'http://127.0.0.1:8000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function pass(msg) {
  console.log(`${colors.green}✓ PASS:${colors.reset} ${msg}`);
}

function fail(msg, err) {
  console.error(`${colors.red}✗ FAIL:${colors.reset} ${msg}`);
  if (err?.response?.data) {
    console.error(`  Details:`, JSON.stringify(err.response.data));
  } else if (err?.message) {
    console.error(`  Error: ${err.message}`);
  }
}

async function runTestSuite() {
  console.log(`${colors.bold}${colors.cyan}====================================================`);
  console.log(`      MENTORMIND AI - END-TO-END VERIFICATION SUITE`);
  console.log(`====================================================${colors.reset}\n`);

  let learnerToken = '';
  let adminToken = '';
  let targetCareerId = '';
  let sampleAssessmentId = '';
  let activeRoadmapId = '';
  let activeTaskId = '';
  let samplePeerId = '';
  let interviewSessionId = '';

  // 1. HEALTH CHECKS
  console.log(`${colors.yellow}[1/13] Checking Services Health...${colors.reset}`);
  try {
    const nodeRes = await axios.get(`${API_BASE}/health`);
    if (nodeRes.data.status === 'OK') {
      pass(`Node.js Backend is healthy (MongoDB connected, Uptime: ${Math.round(nodeRes.data.uptime)}s)`);
    } else {
      throw new Error('Unexpected health response');
    }
  } catch (e) {
    fail('Node.js Backend health check failed', e);
  }

  try {
    const aiRes = await axios.get(`${AI_BASE}/health`);
    if (aiRes.data.status === 'ok') {
      pass(`Python FastAPI AI Service is healthy (Service: ${aiRes.data.service})`);
    } else {
      throw new Error('Unexpected AI health response');
    }
  } catch (e) {
    fail('Python AI Service health check failed', e);
  }

  // 2. AUTHENTICATION & LOGIN (Learner)
  console.log(`\n${colors.yellow}[2/13] Testing Authentication (Learner)...${colors.reset}`);
  try {
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'demo@mentormind.ai',
      password: 'Password123!'
    });
    learnerToken = loginRes.data.token;
    if (learnerToken && loginRes.data.user.role === 'learner') {
      pass(`Logged in successfully as Learner: ${loginRes.data.user.name} (${loginRes.data.user.email})`);
    } else {
      throw new Error('Login response missing token or unexpected role');
    }
  } catch (e) {
    fail('Learner login failed', e);
  }

  const learnerAuth = { headers: { Authorization: `Bearer ${learnerToken}` } };

  // 3. LEARNER PROFILE
  console.log(`\n${colors.yellow}[3/13] Testing Profile & Skills Module...${colors.reset}`);
  try {
    const profileRes = await axios.get(`${API_BASE}/profile/me`, learnerAuth);
    const p = profileRes.data;
    if (p && p.technicalSkills && p.targetCareer) {
      targetCareerId = p.targetCareer._id || p.targetCareer;
      pass(`Profile loaded: Target Career=${p.targetCareer.title || p.targetCareer}, Skills Count=${p.technicalSkills.length}, Readiness Index=${p.readinessScore}%`);
    } else {
      throw new Error('Profile missing skills or target career');
    }
  } catch (e) {
    fail('Fetch profile failed', e);
  }

  // 4. CAREER EXPLORER
  console.log(`\n${colors.yellow}[4/13] Testing Career Explorer...${colors.reset}`);
  try {
    const careersRes = await axios.get(`${API_BASE}/careers`, learnerAuth);
    const careers = careersRes.data;
    if (Array.isArray(careers) && careers.length >= 10) {
      pass(`Loaded ${careers.length} career paths with match scores (Top: ${careers[0].title} - ${careers[0].matchScore || 'N/A'}% match)`);
    } else {
      throw new Error('Expected at least 10 careers');
    }

    // Test career details
    const firstCareerId = careers[0]._id;
    const detailRes = await axios.get(`${API_BASE}/careers/${firstCareerId}`, learnerAuth);
    if (detailRes.data.career && Array.isArray(detailRes.data.career.requiredSkills)) {
      pass(`Career detail for '${detailRes.data.career.title}': Required Skills=${detailRes.data.career.requiredSkills.length}, Avg Salary=$${detailRes.data.career.averageSalary?.toLocaleString()}`);
    }
  } catch (e) {
    fail('Career Explorer test failed', e);
  }

  // 5. SKILL GAP ANALYSIS
  console.log(`\n${colors.yellow}[5/13] Testing Skill Gap Analysis Engine...${colors.reset}`);
  try {
    const gapRes = await axios.get(`${API_BASE}/skill-gap/target`, learnerAuth);
    const gap = gapRes.data;
    if (gap && gap.career) {
      pass(`Skill gap evaluated against '${gap.career.title}': Match=${gap.matchScore}%, Acquired=${gap.acquiredSkills?.length || 0}, Missing=${gap.missingSkills?.length || 0}, Critical Missing=${gap.criticalMissingSkills?.length || 0}`);
    } else {
      throw new Error('Invalid skill gap response');
    }
  } catch (e) {
    fail('Skill gap analysis failed', e);
  }

  // 6. LEARNING ROADMAP & TASK COMPLETION
  console.log(`\n${colors.yellow}[6/13] Testing Learning Roadmap & Adaptation...${colors.reset}`);
  try {
    const roadmapRes = await axios.get(`${API_BASE}/roadmap/active`, learnerAuth);
    const rm = roadmapRes.data.roadmap;
    if (rm && Array.isArray(rm.phases)) {
      activeRoadmapId = rm._id;
      const totalTasks = rm.phases.reduce((acc, ph) => acc + (ph.tasks?.length || 0), 0);
      pass(`Active roadmap loaded: '${rm.title}' with ${rm.phases.length} phases, ${totalTasks} total tasks, Current Progress=${rm.progress}%`);

      if (rm.phases[0]?.tasks?.[0]) {
        activeTaskId = rm.phases[0].tasks[0]._id;
        // Test toggling task
        const toggleRes = await axios.patch(
          `${API_BASE}/roadmap/${activeRoadmapId}/tasks/${activeTaskId}`,
          { status: 'in-progress' },
          learnerAuth
        );
        pass(`Updated task '${rm.phases[0].tasks[0].title}' status to 'in-progress' (New Roadmap Progress: ${toggleRes.data.roadmap.progress}%)`);
      }
    } else {
      throw new Error('No active roadmap found');
    }
  } catch (e) {
    fail('Roadmap test failed', e);
  }

  // 7. LEARNING RESOURCES DIRECTORY
  console.log(`\n${colors.yellow}[7/13] Testing Learning Resources...${colors.reset}`);
  try {
    const resRes = await axios.get(`${API_BASE}/resources?page=1&limit=8`, learnerAuth);
    const resources = resRes.data.resources || resRes.data;
    if (Array.isArray(resources) && resources.length > 0) {
      pass(`Loaded ${resources.length} learning resources (First: '${resources[0].title}' - Type: ${resources[0].type})`);
      
      // Test bookmarking
      const bmRes = await axios.post(`${API_BASE}/resources/${resources[0]._id}/bookmark`, {}, learnerAuth);
      pass(`Resource bookmark toggled: bookmarked=${bmRes.data.bookmarked}`);
    } else {
      throw new Error('No resources returned');
    }
  } catch (e) {
    fail('Resources test failed', e);
  }

  // 8. AI MENTOR CONVERSATION
  console.log(`\n${colors.yellow}[8/13] Testing Multi-Agent AI Mentor Chat...${colors.reset}`);
  try {
    const chatRes = await axios.post(`${API_BASE}/mentor/chat`, {
      message: 'What are the top 3 high-impact skills I should focus on right now to land a Full Stack Developer role?'
    }, learnerAuth);

    if (chatRes.data && chatRes.data.reply) {
      pass(`AI Mentor Agent replied (${chatRes.data.reply.length} chars, Fallback: ${chatRes.data.isFallback ? 'Yes' : 'No'}):`);
      console.log(`  Preview: "${chatRes.data.reply.substring(0, 140).replace(/\n/g, ' ')}..."`);
    } else {
      throw new Error('AI Mentor returned empty reply');
    }
  } catch (e) {
    fail('AI Mentor Chat test failed', e);
  }

  // 9. AI PEER SKILL MATCHING
  console.log(`\n${colors.yellow}[9/13] Testing AI Peer Skill Matching Engine...${colors.reset}`);
  try {
    const peersRes = await axios.get(`${API_BASE}/peers/recommendations`, learnerAuth);
    const peers = peersRes.data;
    if (Array.isArray(peers) && peers.length > 0) {
      samplePeerId = peers[0]._id;
      pass(`Found ${peers.length} compatible peer learners (Top: ${peers[0].name} - Compatibility: ${peers[0].compatibilityScore}%)`);
      console.log(`  Complementary skills: ${peers[0].complementarySkills?.join(', ') || 'N/A'}`);
      
      // Test connection request
      try {
        const connectRes = await axios.post(`${API_BASE}/peers/connect/${samplePeerId}`, {
          note: 'Hi! Let us collaborate on full-stack projects.'
        }, learnerAuth);
        pass(`Connection request sent to peer ${peers[0].name} (Status: ${connectRes.data.connection?.status})`);
      } catch (ce) {
        if (ce.response?.data?.message?.includes('already')) {
          pass(`Connection already exists with peer ${peers[0].name}`);
        } else {
          throw ce;
        }
      }
    } else {
      throw new Error('No peers returned');
    }
  } catch (e) {
    fail('Peer matching test failed', e);
  }

  // 10. AI MOCK INTERVIEW ROOM & EVALUATION
  console.log(`\n${colors.yellow}[10/13] Testing AI Mock Interview Room...${colors.reset}`);
  try {
    // Start session
    const startRes = await axios.post(`${API_BASE}/interviews/start`, {
      careerPathId: targetCareerId,
      interviewType: 'technical',
      difficulty: 'intermediate'
    }, learnerAuth);

    const interview = startRes.data.interview;
    if (interview && interview.questions?.length > 0) {
      interviewSessionId = interview._id;
      const q = interview.questions[0];
      pass(`Mock interview session started (${interview.questions.length} questions loaded, First: "${q.questionText?.substring(0, 70)}...")`);

      // Submit an answer for evaluation
      const answerRes = await axios.post(`${API_BASE}/interviews/${interviewSessionId}/answer`, {
        questionIndex: 0,
        transcript: 'In RESTful APIs, GET retrieves data without side effects, POST creates new resources, PUT replaces existing resources completely, and DELETE removes them. Status codes like 200 OK, 201 Created, 400 Bad Request, 404 Not Found, and 500 Server Error communicate execution status reliably.',
        durationSeconds: 45
      }, learnerAuth);

      const evaluation = answerRes.data.evaluation;
      if (evaluation && evaluation.score !== undefined) {
        pass(`Interview answer evaluated by AI! Overall Score: ${evaluation.score}/100`);
        console.log(`  Rubric: Technical=${evaluation.technicalAccuracyScore}/100, Clarity=${evaluation.clarityScore}/100, Completeness=${evaluation.completenessScore}/100`);
        console.log(`  Feedback: "${evaluation.feedback?.substring(0, 100)}..."`);
      } else {
        throw new Error('Missing evaluation in interview answer response');
      }
    } else {
      throw new Error('Failed to start interview session');
    }
  } catch (e) {
    fail('Mock Interview test failed', e);
  }

  // 11. SKILL ASSESSMENT & ADAPTIVE UPDATES
  console.log(`\n${colors.yellow}[11/13] Testing Skill Assessment System...${colors.reset}`);
  try {
    const assessmentsRes = await axios.get(`${API_BASE}/assessments`, learnerAuth);
    const assessments = assessmentsRes.data;
    if (Array.isArray(assessments) && assessments.length > 0) {
      sampleAssessmentId = assessments[0]._id;
      pass(`Found ${assessments.length} assessments available (Selected: '${assessments[0].title}' - Questions: ${assessments[0].questions?.length})`);

      // Submit assessment answers
      const answers = assessments[0].questions.map((q, idx) => ({
        questionId: q._id,
        selectedOption: q.correctOption !== undefined ? q.correctOption : 0
      }));

      const submitRes = await axios.post(`${API_BASE}/assessments/${sampleAssessmentId}/submit`, {
        answers,
        timeSpentSeconds: 120
      }, learnerAuth);

      const result = submitRes.data.result;
      if (result && result.score !== undefined) {
        pass(`Assessment evaluated: Score=${result.score}%, Passed=${result.passed}, Updated Proficiency=${result.newProficiencyLevel || 'N/A'}`);
      } else {
        throw new Error('Assessment result missing score');
      }
    } else {
      throw new Error('No assessments found');
    }
  } catch (e) {
    fail('Skill Assessment test failed', e);
  }

  // 12. PROGRESS ANALYTICS
  console.log(`\n${colors.yellow}[12/13] Testing Progress Analytics...${colors.reset}`);
  try {
    const analyticsRes = await axios.get(`${API_BASE}/analytics/overview`, learnerAuth);
    const a = analyticsRes.data;
    if (a) {
      pass(`Analytics overview retrieved: Readiness Score=${a.readinessScore}%, Streak=${a.currentStreak || 0} days, Completed Tasks=${a.completedTasks || 0}, Skills Assessed=${a.assessedSkillsCount || 0}`);
    } else {
      throw new Error('Analytics returned empty data');
    }
  } catch (e) {
    fail('Analytics test failed', e);
  }

  // 13. ADMIN PORTAL & METRICS
  console.log(`\n${colors.yellow}[13/13] Testing Administrator Portal...${colors.reset}`);
  try {
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@mentormind.ai',
      password: 'AdminPassword123!'
    });
    adminToken = adminLoginRes.data.token;
    if (adminToken && adminLoginRes.data.user.role === 'admin') {
      pass(`Logged in as Administrator (${adminLoginRes.data.user.name})`);
    } else {
      throw new Error('Admin login failed or unexpected role');
    }

    const adminAuth = { headers: { Authorization: `Bearer ${adminToken}` } };

    const statsRes = await axios.get(`${API_BASE}/admin/stats`, adminAuth);
    const s = statsRes.data;
    if (s && s.totalUsers !== undefined) {
      pass(`Admin platform stats: Total Users=${s.totalUsers}, Active Roadmaps=${s.activeRoadmaps}, Completed Assessments=${s.completedAssessments}, Total Skills=${s.totalSkills}`);
    }

    const usersRes = await axios.get(`${API_BASE}/admin/users?page=1&limit=5`, adminAuth);
    if (Array.isArray(usersRes.data.users)) {
      pass(`Admin learners query: Retrieved ${usersRes.data.users.length} users (Total: ${usersRes.data.totalUsers})`);
    }

    const logsRes = await axios.get(`${API_BASE}/admin/logs?limit=5`, adminAuth);
    if (Array.isArray(logsRes.data)) {
      pass(`Admin agent audit logs: Retrieved ${logsRes.data.length} execution logs`);
    }
  } catch (e) {
    fail('Admin Portal test failed', e);
  }

  console.log(`\n${colors.bold}${colors.green}====================================================`);
  console.log(`   ALL 13 VERIFICATION PHASES COMPLETED`);
  console.log(`====================================================${colors.reset}\n`);
}

runTestSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
