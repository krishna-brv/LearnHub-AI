/**
 * Application Constants & Enums
 */

const ROLES = {
  GUEST: 'guest',
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  REVIEWER: 'reviewer',
  MENTOR: 'mentor',
  ADMIN: 'admin'
};

const COURSE_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

const LESSON_TYPES = {
  VIDEO: 'video',
  TEXT: 'text',
  MARKDOWN: 'markdown',
  PDF: 'pdf',
  EXTERNAL_RESOURCE: 'external_resource',
  YOUTUBE: 'youtube',
  CODING: 'coding',
  INTERACTIVE: 'interactive',
  PRACTICE: 'practice'
};

const QUESTION_TYPES = {
  MCQ: 'mcq',
  MULTIPLE_SELECT: 'multiple_select',
  TRUE_FALSE: 'true_false',
  FILL_BLANK: 'fill_blank',
  SHORT_ANSWER: 'short_answer',
  CODING: 'coding',
  SCENARIO: 'scenario'
};

const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ALL_LEVELS: 'all_levels'
};

const AI_MODEL_TIERS = {
  PRIMARY: 'primary',
  FAST: 'fast'
};

const AI_FEATURES = {
  TUTOR: 'tutor',
  LEARNING_PATH: 'learning_path',
  QUIZ_GENERATOR: 'quiz_generator',
  WEAKNESS_DETECTION: 'weakness_detection',
  ASSIGNMENT_FEEDBACK: 'assignment_feedback',
  CAREER_ADVISOR: 'career_advisor',
  RESUME_ANALYZER: 'resume_analyzer',
  MOCK_INTERVIEW: 'mock_interview',
  SMART_NOTES: 'smart_notes',
  FLASHCARDS: 'flashcards',
  DAILY_CHALLENGE: 'daily_challenge',
  RISK_DETECTION: 'risk_detection',
  QUALITY_REVIEW: 'quality_review'
};

module.exports = {
  ROLES,
  COURSE_STATUS,
  LESSON_TYPES,
  QUESTION_TYPES,
  DIFFICULTY_LEVELS,
  AI_MODEL_TIERS,
  AI_FEATURES
};
