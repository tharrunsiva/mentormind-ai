# MentorMind AI — REST API Reference

The backend exposes a modular Express API under `/api`. All protected endpoints require a JWT token in the `Authorization` header: `Bearer <token>`.

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Registers a new learner and creates default profile. |
| `POST` | `/api/auth/login` | Public | Authenticates user credentials and returns JWT token. |
| `GET` | `/api/auth/me` | Private | Returns currently authenticated user and profile. |
| `POST` | `/api/auth/forgot-password` | Public | Generates password reset token. |
| `POST` | `/api/auth/reset-password` | Public | Updates user password using reset token. |

---

## 2. Profile Endpoints (`/api/profile`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/profile` | Private | Fetches current learner profile with target career. |
| `PUT` | `/api/profile` | Private | Updates profile details, skills, hours, and goals. |
| `POST` | `/api/profile/resume` | Private | Uploads PDF resume and parses data via PyMuPDF. |
| `POST` | `/api/profile/resume/confirm` | Private | Confirms and merges extracted resume skills into profile. |

---

## 3. Career & Intelligence Endpoints (`/api/careers`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/careers` | Public | Lists all career pathways with search & filter. |
| `GET` | `/api/careers/:slug` | Public | Returns detailed career path data and learner readiness. |
| `POST` | `/api/careers/compare` | Public | Compares two careers side-by-side with skill overlap. |
| `POST` | `/api/careers/set-target` | Private | Updates user target career and recalculates skill gaps. |

---

## 4. Skills & Assessment Endpoints (`/api/skills` & `/api/assessments`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/skills` | Public | Retrieves all standard skills dictionary items. |
| `POST` | `/api/skills/my-skills` | Private | Adds or updates a skill in learner profile. |
| `GET` | `/api/assessments` | Public | Lists pre-configured skill assessments. |
| `GET` | `/api/assessments/skill/:name` | Private | Retrieves or generates assessment for a skill. |
| `POST` | `/api/assessments/submit` | Private | Evaluates submitted answers and assigns proficiency. |
| `GET` | `/api/assessments/results/my` | Private | Retrieves learner's historical assessment results. |

---

## 5. Skill Gap & Roadmap Endpoints (`/api/skill-gap` & `/api/roadmap`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/skill-gap` | Private | Computes strong, developing, and missing skills. |
| `GET` | `/api/roadmap` | Private | Fetches current phased personalized roadmap. |
| `POST` | `/api/roadmap/generate` | Private | Generates a new personalized roadmap via AI service. |
| `PUT` | `/api/roadmap/tasks/:id` | Private | Updates task status (`todo`, `in_progress`, `completed`). |

---

## 6. Curated Resources Endpoints (`/api/resources`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/resources` | Public | Searches curated resources with platform filters. |
| `POST` | `/api/resources/:id/bookmark` | Private | Toggles bookmark for a resource. |
| `GET` | `/api/resources/bookmarks/my` | Private | Retrieves bookmarked resources for learner. |

---

## 7. AI Mentor Endpoints (`/api/mentor`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/mentor/conversations` | Private | Lists user's mentor conversation threads. |
| `GET` | `/api/mentor/conversations/:id/messages` | Private | Fetches conversation message history. |
| `POST` | `/api/mentor/chat` | Private | Sends message to AI Mentor Agent with full learner context. |

---

## 8. Peer Skill Matching & Study Groups (`/api/peers`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/peers/recommendations` | Private | Computes complementary peer compatibility scores. |
| `POST` | `/api/peers/connect/:userId` | Private | Sends peer connection request. |
| `PUT` | `/api/peers/requests/:id` | Private | Accepts or rejects a connection request. |
| `GET` | `/api/peers/connections` | Private | Retrieves accepted peer connections. |
| `GET` | `/api/peers/study-groups` | Private | Lists active collaborative study groups. |
| `POST` | `/api/peers/study-groups/:id/join` | Private | Joins a collaborative study group. |

---

## 9. AI Mock Interview Room (`/api/interviews`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/interviews/start` | Private | Initializes simulation with role, category, and questions. |
| `GET` | `/api/interviews/:id` | Private | Retrieves interview questions, answers, and report. |
| `POST` | `/api/interviews/:id/answer` | Private | Submits answer for rubric evaluation and advances. |
| `GET` | `/api/interviews/history/my` | Private | Retrieves history of completed interview reports. |

---

## 10. Analytics & Administration (`/api/analytics` & `/api/admin`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/analytics` | Private | Aggregates study hours, readiness curves, and task metrics. |
| `GET` | `/api/admin/stats` | Admin | Aggregate platform statistics and KPI summaries. |
| `GET` | `/api/admin/learners` | Admin | Paginated list of registered learners and progress. |
| `GET` | `/api/admin/system-health` | Admin | Node, MongoDB, and FastAPI AI service status check. |
