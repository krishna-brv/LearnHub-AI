# LearnHub AI — Production-Quality AI-Powered LMS

> **Tagline:** *"Learn Smarter. Practice Better. Grow Faster."*

LearnHub AI is a state-of-the-art, production-ready AI-powered Learning Management and Skill Assessment Platform built with the full **MERN Stack** (MongoDB, Express.js, React, Node.js) and powered by **Groq AI Dual-Model LLM Architecture**.

---

## 🌟 Key Platform Features

- **Groq AI Dual-Model Engine**:
  - `GROQ_PRIMARY_MODEL` (`llama-3.3-70b-versatile`) for complex reasoning: AI Personalized Learning Path, AI Career Advisor, AI ATS Resume Analyzer, AI Mock Interview Simulator, Weakness Diagnosis, At-Risk Student Detection.
  - `GROQ_FAST_MODEL` (`llama-3.1-8b-instant`) for lightweight interactions: AI Tutor Assistant, AI Quiz Question Generator, AI Smart Notes Summarizer, AI Flashcard Deck Generator.
- **Minimals SaaS Design System**:
  - Emerald primary accent (`#00A76F`), dark sidebar (`#1C252E`), crisp typography (**Public Sans**), soft alert badges, and glassmorphic cards.
- **100% Free Course Access**:
  - No payment simulation or paywalls. Instant free enrollments across all Web Development & Computer Science courses.
- **Deterministic Quiz & Assessment Engine**:
  - 7 Question Types (`mcq`, `multiple_select`, `true_false`, `fill_blank`, `short_answer`, `coding`, `scenario`).
  - Real-time auto-save, negative marking calculation, topic-level performance breakdown, and automatic Mastery Score recalculation.
- **Learning Mastery Score Formula**:
  $$\text{Mastery Score} = 40\%(\text{Lesson Completion}) + 30\%(\text{Quiz Average}) + 30\%(\text{Assignment Average})$$
- **Verifiable Digital Certificates**:
  - UUID v4 validation with embedded QR code data URLs leading to public verification endpoints (`/certificates/verify/:id`).
- **Gamification & Social**:
  - XP progression, levels, badges, 20-tier leaderboard, GitHub-style learning activity heatmap calendar, and study streak tracker.
- **Role-Based Access Control (RBAC)**:
  - 5 distinct user roles: `student`, `instructor`, `reviewer`, `mentor`, `admin`.

---

## 🔑 Quick Demo Credentials

All test accounts use the password: `password123`

| Role | Email | Password |
| :--- | :--- | :--- |
| 🎓 **Student** | `student@learnhub.ai` | `password123` |
| 👩‍🏫 **Instructor** | `sarah@learnhub.ai` | `password123` |
| 🤝 **Mentor** | `mentor@learnhub.ai` | `password123` |
| 🔍 **Reviewer** | `reviewer@learnhub.ai` | `password123` |
| ⚡ **Admin** | `admin@learnhub.ai` | `password123` |

---

## 🚀 Quick Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance running on `mongodb://localhost:27017`

### 1. Clone & Setup Server

```bash
cd learnhub-ai/server
npm install
node seeds/index.js   # Seed database with initial courses, quizzes, and users
npm run dev           # Starts backend server on http://localhost:5000
```

### 2. Setup Client

```bash
cd learnhub-ai/client
npm install
npm run dev           # Starts Vite frontend on http://localhost:5173
```

---

## 📡 Core API Routes

- `/api/auth` — Registration, OTP verification, JWT login, token refresh, logout, password resets
- `/api/users` — User profile, Cloudinary avatar upload, student preferences, admin user management
- `/api/categories` — Parent-child category tree, slugify, admin CRUD
- `/api/courses` — Course catalog search, text index filtering, authoring status workflow
- `/api/enrollments` — Instant free enrollment, my enrolled courses, course dropping
- `/api/progress` — Learning progress, mastery score, GitHub heatmap aggregator, streak tracker
- `/api/quizzes` — Quiz management, time limits, passing scores
- `/api/questions` — Question bank (7 question types, bulk AI import)
- `/api/attempts` — Deterministic quiz attempt engine, topic breakdown, XP rewards
- `/api/assignments` — Rubric-based assignment management & submissions
- `/api/certificates` — Certificate generation & public QR code verification
- `/api/ai/*` — All 12 Groq AI features (Tutor, Learning Path, Career, Interview, Resume, Quiz Gen)
- `/api/analytics` — Admin & Instructor dashboard analytics
