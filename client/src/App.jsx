import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './store';

import HomePage from './pages/public/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/layout/DashboardLayout';

import StudentDashboard from './pages/student/StudentDashboard';
import CourseCatalog from './pages/courses/CourseCatalog';
import CourseDetail from './pages/courses/CourseDetail';
import LearningPlayer from './pages/student/LearningPlayer';
import MyCoursesPage from './pages/student/MyCoursesPage';
import PersonalNotesPage from './pages/student/PersonalNotesPage';
import BookmarksPage from './pages/student/BookmarksPage';
import MyCertificatesPage from './pages/student/MyCertificatesPage';
import QuizPlayer from './pages/quizzes/QuizPlayer';
import FlashcardsPage from './pages/student/FlashcardsPage';
import CertificateVerificationPage from './pages/certificates/CertificateVerificationPage';

import AITutorPage from './pages/ai/AITutorPage';
import AILearningPathPage from './pages/ai/AILearningPathPage';
import AICareerAdvisorPage from './pages/ai/AICareerAdvisorPage';
import AIMockInterviewPage from './pages/ai/AIMockInterviewPage';
import AIQuizGeneratorPage from './pages/ai/AIQuizGeneratorPage';

import MentoringPage from './pages/community/MentoringPage';
import UserProfilePage from './pages/user/UserProfilePage';

import MentorDashboard from './pages/mentor/MentorDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import InstructorCoursesPage from './pages/instructor/InstructorCoursesPage';
import InstructorAnalyticsPage from './pages/instructor/InstructorAnalyticsPage';
import InstructorCourseStudioPage from './pages/instructor/InstructorCourseStudioPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import CategorySettingsPage from './pages/admin/CategorySettingsPage';
import ReviewQueuePage from './pages/reviewer/ReviewQueuePage';

import ProtectedRoute from './components/common/ProtectedRoute';
import PublicPortfolioPage from './pages/public/PublicPortfolioPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/certificates/verify/:certificateId" element={<CertificateVerificationPage />} />
            <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />

            {/* Protected Routes (Requires Auth) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
              </Route>

              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/courses" element={<CourseCatalog />} />
                <Route path="/course/:slug" element={<CourseDetail />} />
                <Route path="/learn/:courseId" element={<LearningPlayer />} />
                <Route path="/quiz/:quizId" element={<QuizPlayer />} />

              {/* Student Ecosystem Pages */}
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/notes" element={<PersonalNotesPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/certificates" element={<MyCertificatesPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />

              {/* AI Features */}
              <Route path="/ai/tutor" element={<AITutorPage />} />
              <Route path="/ai/learning-path" element={<AILearningPathPage />} />
              <Route path="/ai/career" element={<AICareerAdvisorPage />} />
              <Route path="/ai/interview" element={<AIMockInterviewPage />} />
              <Route path="/ai/quiz-generator" element={<AIQuizGeneratorPage />} />

              {/* Mentoring & Community */}
              <Route path="/mentor/dashboard" element={<MentorDashboard />} />
              <Route path="/mentoring" element={<MentoringPage />} />
              <Route path="/profile" element={<UserProfilePage />} />

              {/* Instructor */}
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
              <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
              <Route path="/instructor/analytics" element={<InstructorAnalyticsPage />} />
              <Route path="/instructor/course/:courseId/studio" element={<InstructorCourseStudioPage />} />

              {/* Reviewer */}
              <Route path="/reviewer/queue" element={<ReviewQueuePage />} />

              {/* Admin */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/admin/categories" element={<CategorySettingsPage />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
