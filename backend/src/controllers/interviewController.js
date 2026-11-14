const { MockInterview, InterviewQuestion, InterviewAnswer, LearnerProfile, LearningRoadmap, ProgressRecord, Notification } = require('../models');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Curated question banks for high-reliability mock interviews
const questionBanks = {
  'technical': [
    {
      questionText: 'Explain the difference between SQL and NoSQL databases. When would you choose MongoDB over PostgreSQL in a production system?',
      idealAnswerSummary: 'SQL databases are relational, table-based, with ACID guarantees and strict schemas. NoSQL (like MongoDB) is document-oriented, flexible schema, JSON-like, and excels in rapid prototyping or hierarchical data.',
      category: 'technical',
      difficulty: 'Entry'
    },
    {
      questionText: 'How does React\'s Virtual DOM reconciliation algorithm optimize browser UI updates?',
      idealAnswerSummary: 'React creates an in-memory Virtual DOM tree. When state changes, a new tree is created and diffed against the previous tree using shallow heuristic comparison (O(n) instead of O(n^3)), applying only minimal DOM batch patches.',
      category: 'technical',
      difficulty: 'Mid-Level'
    },
    {
      questionText: 'What is CORS (Cross-Origin Resource Sharing) and what happens during an HTTP Preflight OPTIONS request?',
      idealAnswerSummary: 'CORS is a browser security mechanism that restricts cross-origin HTTP requests. A preflight OPTIONS request is sent before complex requests (custom headers, non-GET/POST/HEAD, application/json) to verify server permissions.',
      category: 'technical',
      difficulty: 'Entry'
    },
    {
      questionText: 'How would you design a rate limiter in a Node.js/Express distributed architecture handling thousands of requests per second?',
      idealAnswerSummary: 'Use Redis with sliding window counter or token bucket algorithm. Track client IP or JWT user ID, check and increment redis keys atomically, return HTTP 429 Too Many Requests when limits are exceeded.',
      category: 'technical',
      difficulty: 'Mid-Level'
    }
  ],
  'hr': [
    {
      questionText: 'Tell me about yourself, your educational background, and why you are excited about this software development role.',
      idealAnswerSummary: 'Clear elevator pitch covering educational foundation, technical stack proficiency, passion for building resilient software, and alignment with company goals.',
      category: 'hr',
      difficulty: 'Entry'
    },
    {
      questionText: 'Where do you see yourself technically and professionally in the next 2 to 3 years?',
      idealAnswerSummary: 'Focuses on deep technical mastery, contributing to architecture design, collaborating closely in cross-functional teams, and mentoring newer engineers.',
      category: 'hr',
      difficulty: 'Entry'
    },
    {
      questionText: 'Why do you want to join our engineering organization specifically rather than other technology companies?',
      idealAnswerSummary: 'Shows research into engineering culture, mission, technical challenges, and excitement for building scalable products.',
      category: 'hr',
      difficulty: 'Entry'
    }
  ],
  'behavioral': [
    {
      questionText: 'Describe a challenging technical bug or blocker you encountered in a project. How did you diagnose and resolve it?',
      idealAnswerSummary: 'Uses STAR method (Situation, Task, Action, Result). Explains diagnostic isolation, hypothesis testing, git bisect/logging, and proactive documentation to prevent recurrence.',
      category: 'behavioral',
      difficulty: 'Entry'
    },
    {
      questionText: 'Tell me about a time you had a technical disagreement with a team member. How did you arrive at a resolution?',
      idealAnswerSummary: 'Demonstrates active listening, focusing on data and architectural tradeoffs rather than ego, prototyping proofs of concept, and committing to the team consensus.',
      category: 'behavioral',
      difficulty: 'Mid-Level'
    }
  ],
  'scenario': [
    {
      questionText: 'Your production web application suddenly experiences a sudden 10x traffic spike and response times degrade to 10 seconds. Walk me through your immediate incident response steps.',
      idealAnswerSummary: '1. Check telemetry dashboards (CPU, memory, database IOPS, slow query logs). 2. Scale application instances horizontally. 3. Enable edge caching / CDN. 4. Introduce read replicas or rate limiting. 5. Conduct post-mortem.',
      category: 'scenario',
      difficulty: 'Mid-Level'
    },
    {
      questionText: 'A product manager requests an urgent feature launch in 48 hours that would require cutting corners on security and automated tests. How do you respond?',
      idealAnswerSummary: 'Articulate the technical debt and security risks respectfully, offer a scoped MVP that meets core business goals safely, and schedule follow-up hardening immediately.',
      category: 'scenario',
      difficulty: 'Mid-Level'
    }
  ]
};

// @desc    Create and start a new mock interview session
// @route   POST /api/interviews/start
// @access  Private
exports.startInterview = async (req, res, next) => {
  try {
    const { jobRole, category, difficulty, totalQuestions } = req.body;
    const qCount = parseInt(totalQuestions) || 4;
    const interviewCategory = category || 'technical';
    const interviewRole = jobRole || 'Full Stack Developer';
    
    const difficultyMap = {
      'entry': 'Entry',
      'beginner': 'Entry',
      'basic': 'Entry',
      'mid-level': 'Mid-Level',
      'intermediate': 'Mid-Level',
      'medium': 'Mid-Level',
      'senior': 'Senior',
      'advanced': 'Senior',
      'expert': 'Senior'
    };
    const interviewDifficulty = difficultyMap[(difficulty || '').toLowerCase()] || 'Entry';

    const interview = await MockInterview.create({
      user: req.user.id,
      jobRole: interviewRole,
      category: interviewCategory,
      difficulty: interviewDifficulty,
      totalQuestions: qCount,
      currentQuestionIndex: 0,
      status: 'in_progress',
    });

    // Populate questions pool
    let pool = questionBanks[interviewCategory] || questionBanks['technical'];
    if (interviewCategory === 'mixed') {
      pool = [
        ...questionBanks['technical'].slice(0, 2),
        ...questionBanks['behavioral'].slice(0, 1),
        ...questionBanks['hr'].slice(0, 1),
      ];
    }

    const createdQuestions = [];
    for (let i = 0; i < Math.min(qCount, pool.length); i++) {
      const q = pool[i];
      const qDoc = await InterviewQuestion.create({
        interview: interview._id,
        questionNumber: i + 1,
        questionText: q.questionText,
        category: q.category,
        difficulty: interviewDifficulty,
        idealAnswerSummary: q.idealAnswerSummary,
      });
      createdQuestions.push(qDoc);
    }

    res.status(201).json({
      success: true,
      interview,
      currentQuestion: createdQuestions[0],
      totalQuestions: createdQuestions.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview session by ID
// @route   GET /api/interviews/:id
// @access  Private
exports.getInterview = async (req, res, next) => {
  try {
    const interview = await MockInterview.findOne({ _id: req.params.id, user: req.user.id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const questions = await InterviewQuestion.find({ interview: interview._id }).sort({ questionNumber: 1 });
    const answers = await InterviewAnswer.find({ interview: interview._id }).populate('question');

    res.status(200).json({
      success: true,
      interview,
      questions,
      answers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit an answer to an interview question
// @route   POST /api/interviews/:id/answer
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const interviewId = req.params.id;
    const { questionId, answerText, audioRecorded } = req.body;

    if (!answerText || answerText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an answer.' });
    }

    const interview = await MockInterview.findOne({ _id: interviewId, user: req.user.id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    const question = await InterviewQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    // Call Python AI service for comprehensive evaluation or use deterministic rubric scoring
    let evalResult = null;
    try {
      const aiResp = await axios.post(`${AI_SERVICE_URL}/ai/evaluate-interview-answer`, {
        job_role: interview.jobRole,
        question: question.questionText,
        ideal_answer: question.idealAnswerSummary,
        user_answer: answerText,
        difficulty: interview.difficulty,
      }, { timeout: 8000 });

      if (aiResp.data && aiResp.data.scores) {
        evalResult = aiResp.data;
      }
    } catch (aiErr) {
      console.warn('[AI Service Warning] Interview evaluation fallback engaged:', aiErr.message);
    }

    if (!evalResult) {
      // Deterministic Rubric Evaluator
      const length = answerText.trim().split(/\s+/).length;
      const lower = answerText.toLowerCase();

      // Check for technical keyword relevance
      let techScore = 65;
      let relevanceScore = 70;
      let completenessScore = 65;
      let clarityScore = 75;

      if (length < 15) {
        techScore = 45;
        completenessScore = 40;
        clarityScore = 60;
      } else if (length >= 40) {
        techScore = Math.min(95, 75 + Math.min(20, Math.floor(length / 10)));
        completenessScore = 85;
      }

      // Check ideal answer keywords
      const idealWords = (question.idealAnswerSummary || '').toLowerCase().split(/\s+/).filter(w => w.length > 4);
      let matchCount = 0;
      idealWords.forEach(w => {
        if (lower.includes(w)) matchCount++;
      });

      if (matchCount > 0) {
        relevanceScore = Math.min(95, 70 + matchCount * 8);
        techScore = Math.min(95, techScore + matchCount * 5);
      }

      const overall = Math.round((techScore + relevanceScore + completenessScore + clarityScore) / 4);

      evalResult = {
        scores: {
          technical: techScore,
          relevance: relevanceScore,
          completeness: completenessScore,
          clarity: clarityScore,
          overall,
        },
        feedback: length < 25
          ? 'Your answer addresses the core topic, but elaborate more on specific real-world tradeoffs and underlying architecture.'
          : 'Solid response! You communicated the key concept clearly and articulated relevant technical factors.',
        strengths: length >= 25 ? ['Clear articulation of primary concept', 'Good technical terminology'] : ['Direct and to the point'],
        suggestions: length < 25 ? ['Elaborate on real-world production tradeoffs', 'Mention specific implementation examples'] : ['Could briefly mention edge cases or performance metrics'],
        followUpQuestion: question.category === 'technical'
          ? 'How would this design change if we needed to support 1 million concurrent users?'
          : 'Can you give a brief example from a past project where you applied this principle?'
      };
    }

    // Save Answer
    const answerDoc = await InterviewAnswer.create({
      interview: interview._id,
      question: question._id,
      user: req.user.id,
      answerText,
      audioRecorded: !!audioRecorded,
      score: evalResult.scores.overall,
      criteriaScores: evalResult.scores,
      feedback: evalResult.feedback,
      strengths: evalResult.strengths,
      suggestions: evalResult.suggestions,
      followUpQuestion: evalResult.followUpQuestion || '',
    });

    // Advance question index
    interview.currentQuestionIndex += 1;
    const questions = await InterviewQuestion.find({ interview: interview._id }).sort({ questionNumber: 1 });

    const isComplete = interview.currentQuestionIndex >= questions.length;
    let nextQuestion = null;

    if (isComplete) {
      // Calculate final interview report
      interview.status = 'completed';
      interview.completedAt = new Date();

      const allAnswers = await InterviewAnswer.find({ interview: interview._id });
      let sumTech = 0, sumRel = 0, sumComp = 0, sumClar = 0, sumOver = 0;

      allAnswers.forEach(a => {
        sumTech += a.criteriaScores.technical || 70;
        sumRel += a.criteriaScores.relevance || 70;
        sumComp += a.criteriaScores.completeness || 70;
        sumClar += a.criteriaScores.clarity || 70;
        sumOver += a.score || 70;
      });

      const count = Math.max(1, allAnswers.length);
      interview.technicalScore = Math.round(sumTech / count);
      interview.relevanceScore = Math.round(sumRel / count);
      interview.completenessScore = Math.round(sumComp / count);
      interview.clarityScore = Math.round(sumClar / count);
      interview.overallScore = Math.round(sumOver / count);

      interview.feedbackSummary = interview.overallScore >= 80
        ? `Impressive interview performance for ${interview.jobRole}! You showed deep technical clarity and structured explanations.`
        : interview.overallScore >= 60
        ? `Solid foundation shown for ${interview.jobRole}. Continue polishing depth of explanation and system design details.`
        : `You completed the simulation. Focus on strengthening foundational terminology and structure answers using the STAR format.`;

      interview.strongPoints = [
        'Composed and structured communication',
        'Familiarity with core terminology',
      ];
      interview.weakPoints = [
        'Elaborate more on production scale tradeoffs',
        'Cite specific metrics and project precedents',
      ];
      interview.missedConcepts = [
        'Edge case handling and automated failure recovery',
      ];
      interview.recommendedStudyTopics = [
        'System Design Tradeoffs & Scalability',
        'Behavioral STAR Technique',
        'API Security Best Practices',
      ];

      await interview.save();

      // Record in progress
      await ProgressRecord.create({
        user: req.user.id,
        studyHours: 0.75,
        tasksCompleted: 1,
        assessmentsTaken: 0,
        avgScore: interview.overallScore,
        readinessScore: interview.overallScore,
      });

      await Notification.create({
        user: req.user.id,
        title: 'Mock Interview Completed',
        message: `Your interview report for ${interview.jobRole} is ready. Overall Score: ${interview.overallScore}%.`,
        type: 'interview',
        link: `/interviews/${interview._id}`,
      });
    } else {
      nextQuestion = questions[interview.currentQuestionIndex];
      await interview.save();
    }

    res.status(200).json({
      success: true,
      answer: answerDoc,
      evaluation: evalResult,
      isComplete,
      nextQuestion,
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's mock interview history
// @route   GET /api/interviews/history/my
// @access  Private
exports.getMyInterviews = async (req, res, next) => {
  try {
    const interviews = await MockInterview.find({ user: req.user.id }).sort({ startedAt: -1 });
    res.status(200).json({ success: true, count: interviews.length, interviews });
  } catch (error) {
    next(error);
  }
};
