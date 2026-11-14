const { LearningRoadmap, RoadmapTask, LearnerProfile, CareerPath, LearningResource, ProgressRecord, Notification } = require('../models');
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Get current user's personalized roadmap
// @route   GET /api/roadmap
// @access  Private
exports.getRoadmap = async (req, res, next) => {
  try {
    let roadmap = await LearningRoadmap.findOne({ user: req.user.id })
      .populate({
        path: 'phases.tasks',
        model: 'RoadmapTask',
      });

    if (!roadmap) {
      // Auto-generate roadmap if none exists
      return exports.generateRoadmap(req, res, next);
    }

    res.status(200).json({ success: true, roadmap });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate personalized AI learning roadmap
// @route   POST /api/roadmap/generate
// @access  Private
exports.generateRoadmap = async (req, res, next) => {
  try {
    const profile = await LearnerProfile.findOne({ user: req.user.id })
      .populate('targetCareer');

    let career = profile ? profile.targetCareer : null;
    if (!career) {
      career = await CareerPath.findOne({ slug: 'full-stack-developer' });
    }

    const careerTitle = career ? career.title : 'Full Stack Developer';

    // Delete older roadmap if replacing
    const oldRoadmap = await LearningRoadmap.findOne({ user: req.user.id });
    if (oldRoadmap) {
      await RoadmapTask.deleteMany({ roadmap: oldRoadmap._id });
      await LearningRoadmap.deleteOne({ _id: oldRoadmap._id });
    }

    // Try Python AI service for LangGraph dynamic roadmap generation
    let generatedPhases = null;
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/generate-roadmap`, {
        user_name: req.user.name,
        target_career: careerTitle,
        skills: profile ? profile.existingTechnicalSkills.map(s => ({ name: s.name, level: s.proficiencyLevel, score: s.score })) : [],
        weekly_hours: profile ? profile.weeklyHoursAvailable : 10,
        learning_style: profile ? profile.preferredLearningStyle : 'Hands-on',
      }, { timeout: 6000 });

      if (aiResponse.data && aiResponse.data.phases) {
        generatedPhases = aiResponse.data.phases;
      }
    } catch (aiErr) {
      console.warn('[AI Service Warning] Roadmap generation fallback engaged:', aiErr.message);
    }

    // Fallback phased template if AI service offline
    if (!generatedPhases || generatedPhases.length === 0) {
      generatedPhases = [
        {
          phaseNumber: 1,
          title: `Phase 1: Foundations & Core Architecture for ${careerTitle}`,
          description: 'Establish rock-solid programming syntax, modular thinking, and developer environment.',
          estimatedDurationWeeks: 2,
          tasks: [
            {
              topic: 'Version Control, Git Workflows & Repository Hygiene',
              skillName: 'Git & GitHub',
              description: 'Branching strategies, pull requests, resolving merge conflicts, and conventional commits.',
              estimatedHours: 4,
              priority: 'High',
            },
            {
              topic: 'Modern Language Specifications & Asynchronous Programming',
              skillName: 'JavaScript',
              description: 'Async/await, promise chaining, closures, and modern ES6+ functional utilities.',
              estimatedHours: 6,
              priority: 'High',
            }
          ]
        },
        {
          phaseNumber: 2,
          title: `Phase 2: Core Framework Specialization`,
          description: 'Deep dive into primary web/mobile frameworks and state management mechanisms.',
          estimatedDurationWeeks: 3,
          tasks: [
            {
              topic: 'Component Lifecycle, Hooks & Reactive State',
              skillName: 'React.js',
              description: 'Custom hooks, memoization with useMemo/useCallback, and Context API patterns.',
              estimatedHours: 8,
              priority: 'High',
            },
            {
              topic: 'Responsive UI Architecture & Design Systems',
              skillName: 'HTML5 & CSS3',
              description: 'Flexbox, CSS Grid, mobile-first layouts, and accessible semantic markup.',
              estimatedHours: 5,
              priority: 'Medium',
            }
          ]
        },
        {
          phaseNumber: 3,
          title: `Phase 3: Backend Services, API Design & Data Persistence`,
          description: 'Construct resilient server endpoints, authentication protocols, and schema designs.',
          estimatedDurationWeeks: 3,
          tasks: [
            {
              topic: 'RESTful API Engineering & Express Middleware',
              skillName: 'Express.js',
              description: 'Route handlers, validation with express-validator, and centralized error logging.',
              estimatedHours: 7,
              priority: 'High',
            },
            {
              topic: 'Document Database Schema Modeling & Indexing',
              skillName: 'MongoDB',
              description: 'NoSQL collections, Mongoose relationships, aggregation pipelines, and query optimization.',
              estimatedHours: 6,
              priority: 'High',
            }
          ]
        },
        {
          phaseNumber: 4,
          title: `Phase 4: Capstone Integration, Deployment & Interview Readiness`,
          description: 'Combine all layers into production deployable applications and simulate interviews.',
          estimatedDurationWeeks: 2,
          tasks: [
            {
              topic: 'Full-Stack Monorepo Integration & Production Cloud Deploy',
              skillName: 'Docker',
              description: 'Containerization, environment isolation, and continuous deployment to hosting tiers.',
              estimatedHours: 10,
              priority: 'High',
            },
            {
              topic: 'Comprehensive Technical Mock Interview & Code Defense',
              skillName: 'REST APIs',
              description: 'Simulate system design questioning and explain architectural tradeoffs.',
              estimatedHours: 4,
              priority: 'Medium',
            }
          ]
        }
      ];
    }

    // Create the LearningRoadmap document
    const newRoadmap = await LearningRoadmap.create({
      user: req.user.id,
      careerPath: career ? career._id : null,
      careerTitle,
      title: `${careerTitle} Adaptive Career Roadmap`,
      overallProgress: 10,
      phases: generatedPhases.map((p) => ({
        phaseNumber: p.phaseNumber,
        title: p.title,
        description: p.description,
        estimatedDurationWeeks: p.estimatedDurationWeeks || 2,
        status: p.phaseNumber === 1 ? 'in_progress' : 'pending',
        milestones: p.milestones || [`Phase ${p.phaseNumber} completion checkpoint`],
        tasks: [],
      })),
    });

    // Populate tasks and resources for each phase
    for (let i = 0; i < generatedPhases.length; i++) {
      const p = generatedPhases[i];
      for (const t of p.tasks) {
        // Try finding matching learning resources in DB
        const resources = await LearningResource.find({
          skillName: new RegExp(`^${t.skillName}$`, 'i'),
        }).limit(2);

        const taskDoc = await RoadmapTask.create({
          user: req.user.id,
          roadmap: newRoadmap._id,
          phaseNumber: p.phaseNumber,
          topic: t.topic,
          description: t.description || `Master essential competencies in ${t.skillName}.`,
          skillName: t.skillName,
          estimatedHours: t.estimatedHours || 5,
          priority: t.priority || 'Medium',
          status: p.phaseNumber === 1 && i === 0 ? 'in_progress' : 'todo',
          resources: resources.map(r => ({
            title: r.title,
            url: r.url,
            type: r.platform === 'YouTube' ? 'Video' : 'Documentation',
            platform: r.platform,
            duration: r.estimatedDuration,
          }))
        });

        newRoadmap.phases[i].tasks.push(taskDoc._id);
      }
    }

    await newRoadmap.save();

    // Re-query with populated tasks
    const populated = await LearningRoadmap.findById(newRoadmap._id).populate({
      path: 'phases.tasks',
      model: 'RoadmapTask',
    });

    res.status(201).json({
      success: true,
      message: 'Personalized AI learning roadmap generated successfully.',
      roadmap: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update roadmap task status (todo, in_progress, completed, paused)
// @route   PUT /api/roadmap/tasks/:taskId
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await RoadmapTask.findOne({ _id: taskId, user: req.user.id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or access denied.' });
    }

    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    }
    await task.save();

    // Recalculate roadmap progress
    const allTasks = await RoadmapTask.find({ roadmap: task.roadmap });
    const completedCount = allTasks.filter((t) => t.status === 'completed').length;
    const progressPercent = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

    const roadmap = await LearningRoadmap.findById(task.roadmap);
    if (roadmap) {
      roadmap.overallProgress = progressPercent;

      // Check phase completion status
      roadmap.phases.forEach((ph) => {
        const phaseTasks = allTasks.filter((t) => t.phaseNumber === ph.phaseNumber);
        const allDone = phaseTasks.length > 0 && phaseTasks.every((t) => t.status === 'completed');
        const anyActive = phaseTasks.some((t) => t.status === 'in_progress' || t.status === 'completed');

        if (allDone) ph.status = 'completed';
        else if (anyActive) ph.status = 'in_progress';
        else ph.status = 'pending';
      });

      await roadmap.save();
    }

    // Record learning progress
    if (status === 'completed') {
      await ProgressRecord.create({
        user: req.user.id,
        studyHours: task.estimatedHours || 1,
        tasksCompleted: 1,
        assessmentsTaken: 0,
        readinessScore: progressPercent,
      });

      await Notification.create({
        user: req.user.id,
        title: 'Task Completed!',
        message: `Great job completing "${task.topic}". Your roadmap is now ${progressPercent}% complete.`,
        type: 'roadmap',
        link: '/roadmap',
      });
    }

    res.status(200).json({
      success: true,
      message: `Task marked as ${status}.`,
      task,
      overallProgress: progressPercent,
    });
  } catch (error) {
    next(error);
  }
};
