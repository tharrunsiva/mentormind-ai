const { AIConversation, AIMessage, LearnerProfile, SkillGapReport, LearningRoadmap, AssessmentResult, AgentExecutionLog } = require('../models');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Get user's AI Mentor conversations
// @route   GET /api/mentor/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
  try {
    let conversations = await AIConversation.find({ user: req.user.id }).sort({ lastMessageAt: -1 });

    if (conversations.length === 0) {
      const newConv = await AIConversation.create({
        user: req.user.id,
        title: 'Career & Learning Guidance',
        context: {
          targetCareer: 'Full Stack Developer',
        },
      });

      // Add welcoming introductory mentor message
      await AIMessage.create({
        conversation: newConv._id,
        user: req.user.id,
        sender: 'assistant',
        content: `Hello ${req.user.name}! I am your personal **MentorMind AI Career & Learning Mentor**.\n\nI have full visibility into your current technical skills, assessment history, target career milestones, and learning roadmap.\n\nHow can I help you today? You can ask me:\n- *"What should I focus on learning today?"*\n- *"Explain React hooks vs class state in simple terms."*\n- *"How do I prepare for a Full Stack technical interview?"*\n- *"Can you give me a practical coding challenge to practice?"*`,
        suggestedActions: [
          'What should I learn today?',
          'Explain React hooks with an example',
          'Give me a practical coding exercise',
          'How can I improve my weakest skill?'
        ]
      });

      conversations = [newConv];
    }

    res.status(200).json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/mentor/conversations/:id/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const conversation = await AIConversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    const messages = await AIMessage.find({ conversation: req.params.id }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message to AI Mentor
// @route   POST /api/mentor/chat
// @access  Private
exports.sendMessage = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { conversationId } = req.body;
    const content = req.body.content || req.body.message;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Please provide message content.' });
    }

    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, user: req.user.id });
    }
    if (!conversation) {
      conversation = await AIConversation.create({
        user: req.user.id,
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
      });
    }

    // Save user message
    const userMsg = await AIMessage.create({
      conversation: conversation._id,
      user: req.user.id,
      sender: 'user',
      content,
    });

    // Gather rich learner context
    const profile = await LearnerProfile.findOne({ user: req.user.id });
    const gapReport = await SkillGapReport.findOne({ user: req.user.id });
    const roadmap = await LearningRoadmap.findOne({ user: req.user.id });
    const recentAssessments = await AssessmentResult.find({ user: req.user.id }).sort({ completedAt: -1 }).limit(3);

    const learnerContext = {
      userName: req.user.name,
      targetCareer: profile ? profile.targetCareerName : 'Software Developer',
      readinessScore: profile ? profile.careerReadinessScore : 40,
      skills: profile ? profile.existingTechnicalSkills.map(s => `${s.name} (${s.proficiencyLevel}, ${s.score}%)`) : [],
      missingSkills: gapReport ? gapReport.missingSkills.map(s => s.skillName) : [],
      currentRoadmapProgress: roadmap ? `${roadmap.overallProgress}%` : 'Not started',
      recentAssessmentScores: recentAssessments.map(a => `${a.skillName}: ${a.percentage}% (${a.proficiencyAssigned})`),
      preferredLearningStyle: profile ? profile.preferredLearningStyle : 'Hands-on',
    };

    let assistantResponseText = '';
    let suggestedActions = [];
    let isFallback = false;

    // Call Python AI Service
    try {
      const aiResp = await axios.post(`${AI_SERVICE_URL}/ai/mentor-chat`, {
        user_name: req.user.name,
        message: content,
        context: learnerContext,
      }, { timeout: 10000 });

      if (aiResp.data && aiResp.data.response) {
        assistantResponseText = aiResp.data.response;
        suggestedActions = aiResp.data.suggested_actions || [];
      }
    } catch (aiErr) {
      console.warn('[AI Service Warning] Python AI Mentor unavailable, using contextual engine:', aiErr.message);
      isFallback = true;
    }

    // High quality contextual fallback responses if Python service is offline
    if (!assistantResponseText) {
      const lower = content.toLowerCase();
      if (lower.includes('today') || lower.includes('what should i learn') || lower.includes('next')) {
        const topMissing = gapReport && gapReport.missingSkills.length > 0 ? gapReport.missingSkills[0].skillName : 'Node.js & Express';
        assistantResponseText = `Based on your goal of becoming a **${learnerContext.targetCareer}** (Current readiness: **${learnerContext.readinessScore}%**), here is your highest leverage action for today:\n\n### Recommended Focus: **${topMissing}**\n\n1. **Concept Review (30 mins)**: Study core architectural patterns in ${topMissing} (see Curated Resources).\n2. **Hands-On Coding (45 mins)**: Build a simple working module or endpoint.\n3. **Skill Verification (15 mins)**: Take the 5-question skill assessment in MentorMind to benchmark your progress.\n\n> *“Consistency beats intensity. 45 minutes of deliberate practice today moves your career readiness forward.”*`;
        suggestedActions = [
          `Take ${topMissing} Assessment`,
          'View Recommended Resources',
          'Review Learning Roadmap'
        ];
      } else if (lower.includes('react') && (lower.includes('hook') || lower.includes('explain'))) {
        assistantResponseText = `### Understanding React Hooks Simply\n\nBefore React Hooks (React 16.8), state and lifecycles were trapped inside verbose **ES6 Classes**. Hooks let you use state and side-effects in clean, reusable **Functional Components**.\n\n#### The Big Three Hooks:\n1. **\`useState\`**: Adds reactive internal state.\n\`\`\`jsx\nconst [count, setCount] = useState(0);\n\`\`\`\n2. **\`useEffect\`**: Synchronizes with external systems (APIs, subscriptions, timers).\n\`\`\`jsx\nuseEffect(() => {\n  console.log("Mounted or count changed:", count);\n  return () => console.log("Cleanup before unmount");\n}, [count]);\n\`\`\`\n3. **\`useCallback\` / \`useMemo\`**: Preserves function references and cached values between renders to prevent unnecessary child re-renders.\n\n*Would you like a quick scenario-based question to test your understanding of hooks?*`;
        suggestedActions = [
          'Give me a React hooks coding challenge',
          'Explain useEffect cleanup',
          'How does useMemo prevent re-renders?'
        ];
      } else if (lower.includes('exercise') || lower.includes('challenge') || lower.includes('practice')) {
        assistantResponseText = `### Practical Coding Challenge: Async Cache Wrapper\n\n**Goal**: Write a JavaScript function \`memoizeAsync(fn, ttlMs)\` that caches the result of an asynchronous function for a specified time-to-live.\n\n\`\`\`javascript\nfunction memoizeAsync(fn, ttlMs) {\n  const cache = new Map();\n  return async (...args) => {\n    const key = JSON.stringify(args);\n    const cached = cache.get(key);\n    if (cached && Date.now() - cached.timestamp < ttlMs) {\n      return cached.data;\n    }\n    const result = await fn(...args);\n    cache.set(key, { data: result, timestamp: Date.now() });\n    return result;\n  };\n}\n\`\`\`\n\n**Key concepts practiced**: Closures, Maps, Promises, and TTL invalidation. Try implementing error-handling for rejected promises!`;
        suggestedActions = [
          'Explain how this handles errors',
          'How does Map differ from plain Object in JS?',
          'Next challenge'
        ];
      } else {
        assistantResponseText = `Great question, ${req.user.name}! In pursuing your target career as a **${learnerContext.targetCareer}**, mastering both technical foundations and system design tradeoffs is crucial.\n\nRegarding: *"**${content}**"*\n\n1. **Core Concept**: Focus on breaking complex requirements into modular, single-responsibility functions or components.\n2. **Practical Tip**: Always verify how this interacts with your data flow—whether client-side state in React, or relational records in MongoDB/SQL.\n3. **Next Step**: You can verify your skills by taking the related assessment or trying our AI Mock Interview room for realistic technical simulation.\n\nWhat specific part would you like to explore deeper?`;
        suggestedActions = [
          'What should I learn today?',
          'Prepare for Mock Interview',
          'Review My Skill Gaps'
        ];
      }
    }

    // Save assistant response
    const assistantMsg = await AIMessage.create({
      conversation: conversation._id,
      user: req.user.id,
      sender: 'assistant',
      content: assistantResponseText,
      suggestedActions,
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Log agent execution
    await AgentExecutionLog.create({
      user: req.user.id,
      agentName: 'AI Mentor Agent',
      trigger: 'mentor_chat',
      inputSummary: content.slice(0, 100),
      outputSummary: assistantResponseText.slice(0, 100),
      executionTimeMs: Date.now() - startTime,
      status: isFallback ? 'fallback_mode' : 'success',
    });

    res.status(200).json({
      success: true,
      message: assistantMsg,
      conversationId: conversation._id,
    });
  } catch (error) {
    next(error);
  }
};
