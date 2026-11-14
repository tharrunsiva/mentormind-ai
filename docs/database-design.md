# MentorMind AI — Database Architecture & Schema Design

MentorMind AI utilizes MongoDB with 22 Mongoose collections designed for high consistency, relational integrity, and rapid analytical aggregation.

---

## 1. Collections Overview

| # | Collection Name | Purpose | Key Relationships |
|---|-----------------|---------|-------------------|
| **1** | `users` | User credentials, roles, and account status | Root identity |
| **2** | `learnerprofiles` | Extended learner profiles, skills, and goals | `user -> users._id` |
| **3** | `skills` | Master dictionary of skills and proficiency levels | Referenced across roles & roadmaps |
| **4** | `careerpaths` | Defined industry roles, skill requirements, and weights | `requiredTechnicalSkills.skill` |
| **5** | `skillassessments` | Assessment suites with questions & rubrics | `skill -> skills._id` |
| **6** | `assessmentresults` | Completed test records with scores & rubrics | `user`, `assessment`, `skill` |
| **7** | `skillgapreports` | Diagnostic gap records (strong, partial, missing) | `user`, `careerPath` |
| **8** | `learningroadmaps` | Phased multi-milestone personalized roadmaps | `user`, `careerPath`, `tasks` |
| **9** | `roadmaptasks` | Granular tasks with status, hours, and resources | `user`, `roadmap` |
| **10** | `learningresources` | Curated tutorials, articles, and documentation | Categorized by `skillName` |
| **11** | `resourcebookmarks` | User-saved bookmarks and completion flags | `user`, `resource` |
| **12** | `aiconversations` | Conversation threads for AI Mentor | `user` |
| **13** | `aimessages` | Chat messages with prompt suggestions | `conversation`, `user` |
| **14** | `peerconnections` | Reciprocal peer connections with match scores | `requester`, `recipient` |
| **15** | `studygroups` | Collaborative study circles and team challenges | `creator`, `members` |
| **16** | `groupmessages` | Group room discussions | `group`, `sender` |
| **17** | `mockinterviews` | Mock interview sessions & performance reports | `user` |
| **18** | `interviewquestions` | Question pool for interview sessions | `interview` |
| **19** | `interviewanswers` | Submitted answers with criteria scores | `interview`, `question`, `user` |
| **20** | `progressrecords` | Daily time-series telemetry for analytics charts | `user`, `date` |
| **21** | `notifications` | System, peer, and adaptive alerts | `user` |
| **22** | `agentexecutionlogs` | Audit trail of AI agent decisions and runtimes | `user`, `agentName` |

---

## 2. Key Collection Schemas & Indices

### `User`
- `email`: `String` (Indexed, unique, lowercase)
- `password`: `String` (Bcrypt salted hash, selected out by default)
- `role`: `String` (`learner` | `admin`)
- `profileCompleted`: `Boolean`

### `LearnerProfile`
- `user`: `ObjectId` (Ref: `User`, unique index)
- `existingTechnicalSkills`: Array of `{ skill, name, proficiencyLevel, score, verified, lastAssessed }`
- `targetCareer`: `ObjectId` (Ref: `CareerPath`)
- `careerReadinessScore`: `Number` (0 - 100)
- `streakDays`: `Number`

### `PeerConnection`
- `requester`: `ObjectId` (Ref: `User`)
- `recipient`: `ObjectId` (Ref: `User`)
- Compound unique index: `{ requester: 1, recipient: 1 }`
- `status`: `String` (`pending` | `accepted` | `rejected`)
- `compatibilityScore`: `Number`

### `MockInterview`
- `user`: `ObjectId` (Ref: `User`, index)
- `jobRole`: `String`
- `category`: `String` (`technical` | `hr` | `behavioral` | `scenario` | `mixed`)
- `overallScore`: `Number`
- `criteriaScores`: `{ technical, relevance, completeness, clarity }`
