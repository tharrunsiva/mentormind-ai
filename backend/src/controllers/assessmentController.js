const { SkillAssessment, AssessmentResult, LearnerProfile, LearningRoadmap, ProgressRecord, Notification, Skill } = require('../models');

// @desc    Get all available assessments
// @route   GET /api/assessments
// @access  Public
exports.getAssessments = async (req, res, next) => {
  try {
    const assessments = await SkillAssessment.find().select('-questions.correctAnswer -questions.explanation');
    res.status(200).json({ success: true, count: assessments.length, assessments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assessment for a specific skill (or generate standard assessment)
// @route   GET /api/assessments/skill/:skillName
// @access  Private
exports.getAssessmentForSkill = async (req, res, next) => {
  try {
    const { skillName } = req.params;
    let assessment = await SkillAssessment.findOne({
      skillName: new RegExp(`^${skillName}$`, 'i'),
    }).select('-questions.correctAnswer -questions.explanation');

    if (!assessment) {
      // Dynamic fallback generator for any skill
      const questions = [
        {
          id: `${skillName.toLowerCase()}-1`,
          type: 'mcq',
          question: `In modern ${skillName} development, which architectural pattern is considered best practice?`,
          options: [
            'Separation of concerns, modular structure, and single-responsibility components',
            'Placing all logic and styling into a single monolithic file',
            'Hardcoding all credentials and variables in client scripts',
            'Bypassing automated testing in production releases'
          ],
          points: 25,
        },
        {
          id: `${skillName.toLowerCase()}-2`,
          type: 'scenario',
          question: `When debugging an unexpected runtime issue or bottleneck in ${skillName}, what is the recommended diagnostic approach?`,
          options: [
            'Inspect logs, profile CPU/memory usage, isolate reproducible test cases, and analyze error stack traces',
            'Restart the machine and hope the error does not recur',
            'Delete all configuration files without checking version control',
            'Immediately downgrade dependencies without reading release notes'
          ],
          points: 25,
        },
        {
          id: `${skillName.toLowerCase()}-3`,
          type: 'technical',
          question: `Which fundamental principle is vital for writing maintainable, reusable ${skillName} code?`,
          options: [
            'DRY (Don\'t Repeat Yourself) and clear interfaces/contracts between modules',
            'Using arbitrary global variables across all functions',
            'Avoiding code documentation and typing',
            'Ignoring asynchronous error propagation'
          ],
          points: 25,
        },
        {
          id: `${skillName.toLowerCase()}-4`,
          type: 'short_answer',
          question: `How do you handle security vulnerabilities and input sanitization when working with ${skillName}?`,
          options: [
            'Validate and sanitize all untrusted user inputs, enforce least privilege, and use verified libraries with regular audits',
            'Trust client-provided headers and body payloads unconditionally',
            'Disable CORS and SSL encryption for higher throughput',
            'Store API tokens directly in public repository commits'
          ],
          points: 25,
        }
      ];

      return res.status(200).json({
        success: true,
        assessment: {
          _id: 'dynamic_' + skillName,
          title: `${skillName} Core Proficiency Assessment`,
          skillName,
          targetLevel: 'Intermediate',
          timeLimitMinutes: 15,
          totalPoints: 100,
          questions,
        }
      });
    }

    res.status(200).json({ success: true, assessment });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assessment and evaluate deterministic scores
// @route   POST /api/assessments/submit
// @access  Private
exports.submitAssessment = async (req, res, next) => {
  try {
    const { assessmentId, skillName, answers } = req.body;
    // answers format: [{ questionId: 'js-1', selectedAnswer: '...' }]

    let assessment = null;
    if (assessmentId && !assessmentId.startsWith('dynamic_')) {
      assessment = await SkillAssessment.findById(assessmentId);
    }

    // Default rubric answer keys if dynamic or standard
    let questionsPool = assessment ? assessment.questions : null;

    let totalPoints = 0;
    let earnedPoints = 0;
    const evaluatedAnswers = [];
    const strengths = [];
    const weaknesses = [];

    if (questionsPool && questionsPool.length > 0) {
      questionsPool.forEach((q) => {
        totalPoints += q.points || 20;
        const userAnswer = answers.find((a) => a.questionId === q.id);
        const selected = userAnswer ? userAnswer.selectedAnswer : '';
        const isCorrect = selected && selected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

        const points = isCorrect ? q.points || 20 : 0;
        earnedPoints += points;

        if (isCorrect) {
          strengths.push(`Demonstrated clear understanding on ${q.question.slice(0, 45)}...`);
        } else {
          weaknesses.push(`Needs review on ${q.question.slice(0, 45)}...`);
        }

        evaluatedAnswers.push({
          questionId: q.id,
          questionText: q.question,
          selectedAnswer: selected,
          isCorrect,
          pointsAwarded: points,
          feedback: isCorrect
            ? 'Correct! ' + (q.explanation || 'Solid grasp of core concept.')
            : 'Incorrect. ' + (q.explanation || `Expected: ${q.correctAnswer}`),
        });
      });
    } else {
      // For dynamic evaluations
      totalPoints = 100;
      const ptsPerQ = Math.round(100 / Math.max(1, answers.length));
      answers.forEach((ans, idx) => {
        // First option in dynamic questions is designed as the optimal choice
        const isCorrect = ans.selectedAnswer && (
          ans.selectedAnswer.includes('Separation of concerns') ||
          ans.selectedAnswer.includes('Inspect logs') ||
          ans.selectedAnswer.includes('DRY') ||
          ans.selectedAnswer.includes('Validate and sanitize') ||
          ans.selectedAnswer.length > 25
        );
        const pts = isCorrect ? ptsPerQ : 0;
        earnedPoints += pts;

        if (isCorrect) {
          strengths.push(`Strong rationale on Question ${idx + 1}`);
        } else {
          weaknesses.push(`Concept revision recommended for Question ${idx + 1}`);
        }

        evaluatedAnswers.push({
          questionId: ans.questionId,
          selectedAnswer: ans.selectedAnswer,
          isCorrect,
          pointsAwarded: pts,
          feedback: isCorrect ? 'Optimal technical approach chosen.' : 'Sub-optimal approach chosen. Review standard practices.',
        });
      });
    }

    const percentage = Math.round((earnedPoints / Math.max(1, totalPoints)) * 100);

    // Assign proficiency level
    let proficiencyAssigned = 'Beginner';
    if (percentage >= 85) proficiencyAssigned = 'Expert';
    else if (percentage >= 75) proficiencyAssigned = 'Advanced';
    else if (percentage >= 55) proficiencyAssigned = 'Intermediate';
    else if (percentage >= 40) proficiencyAssigned = 'Basic';

    // Construct constructive feedback
    let feedback = '';
    let adaptiveRecommendation = '';
    if (percentage >= 75) {
      feedback = `Excellent performance! You scored ${percentage}%, demonstrating advanced proficiency in ${skillName}. You are ready for complex project implementations.`;
      adaptiveRecommendation = 'Unlocked advanced topics on your roadmap.';
    } else if (percentage >= 50) {
      feedback = `Good foundational grasp! You scored ${percentage}%. Review the highlighted weakness areas to reach the advanced mastery threshold.`;
      adaptiveRecommendation = 'Targeted practice exercises queued in your learning path.';
    } else {
      feedback = `Score: ${percentage}%. You have encountered some foundational stumbling blocks. Our adaptive engine has queued prerequisite refresher materials to help solidify these concepts.`;
      adaptiveRecommendation = 'Prerequisite revision resources added to roadmap.';
    }

    // Save AssessmentResult
    const resultDoc = await AssessmentResult.create({
      user: req.user.id,
      assessment: assessment ? assessment._id : null,
      skillName,
      score: earnedPoints,
      maxScore: totalPoints,
      percentage,
      proficiencyAssigned,
      strengths: strengths.length ? strengths : ['General technical awareness'],
      weaknesses: weaknesses.length ? weaknesses : ['None identified'],
      feedback,
      answers: evaluatedAnswers,
    });

    // Update Learner Profile skill score & verification
    const profile = await LearnerProfile.findOne({ user: req.user.id });
    if (profile) {
      const existingSkill = profile.existingTechnicalSkills.find(
        (s) => s.name.toLowerCase() === skillName.toLowerCase()
      );
      if (existingSkill) {
        existingSkill.score = percentage;
        existingSkill.proficiencyLevel = proficiencyAssigned;
        existingSkill.verified = true;
        existingSkill.lastAssessed = new Date();
      } else {
        const skillDoc = await Skill.findOne({ name: new RegExp(`^${skillName}$`, 'i') });
        profile.existingTechnicalSkills.push({
          skill: skillDoc ? skillDoc._id : null,
          name: skillName,
          proficiencyLevel: proficiencyAssigned,
          score: percentage,
          verified: true,
          lastAssessed: new Date(),
        });
      }
      await profile.save();
    }

    // Adaptive Roadmap Adjustment
    const roadmap = await LearningRoadmap.findOne({ user: req.user.id });
    if (roadmap) {
      if (percentage < 50) {
        roadmap.isAdaptiveAdjusted = true;
        roadmap.lastAdaptedReason = `Score ${percentage}% on ${skillName}: Added prerequisite revision modules.`;
        await roadmap.save();
      } else if (percentage >= 75) {
        roadmap.isAdaptiveAdjusted = true;
        roadmap.lastAdaptedReason = `Mastered ${skillName} (${percentage}%): Advanced milestone unlocked.`;
        await roadmap.save();
      }
    }

    // Record Progress
    await ProgressRecord.create({
      user: req.user.id,
      studyHours: 0.5,
      tasksCompleted: 1,
      assessmentsTaken: 1,
      avgScore: percentage,
      streakCount: profile ? profile.streakDays : 1,
      readinessScore: profile ? profile.careerReadinessScore : percentage,
    });

    // Send Notification
    await Notification.create({
      user: req.user.id,
      title: `${skillName} Assessment Completed`,
      message: `You earned ${percentage}% (${proficiencyAssigned} level). ${adaptiveRecommendation}`,
      type: 'assessment',
      link: '/assessment',
    });

    res.status(200).json({
      success: true,
      result: resultDoc,
      percentage,
      proficiencyAssigned,
      feedback,
      adaptiveRecommendation,
      strengths,
      weaknesses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's previous assessment results
// @route   GET /api/assessments/results/my
// @access  Private
exports.getMyResults = async (req, res, next) => {
  try {
    const results = await AssessmentResult.find({ user: req.user.id }).sort({ completedAt: -1 });
    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    next(error);
  }
};
