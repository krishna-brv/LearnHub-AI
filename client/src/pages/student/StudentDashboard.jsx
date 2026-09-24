import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { updateUser } from '../../store/authSlice';
import {
  FileText,
  HelpCircle,
  BarChart3,
  AlertTriangle,
  Upload,
  Brain,
  Sparkles,
  TrendingUp,
  Flame,
  Sun,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Compass,
  Award,
  Target,
  MessageSquare
} from 'lucide-react';

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [overview, setOverview] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, enrollmentsRes, notesRes, profileRes] = await Promise.all([
          axiosClient.get('/progress/overview').catch(() => ({ data: { data: { overview: null } } })),
          axiosClient.get('/enrollments/my').catch(() => ({ data: { data: { enrollments: [] } } })),
          axiosClient.get('/notes?limit=3').catch(() => ({ data: { data: { notes: [] } } })),
          axiosClient.get('/users/me').catch(() => ({ data: { data: { user: null } } }))
        ]);

        setOverview(overviewRes.data?.data?.overview);
        setEnrollments(enrollmentsRes.data?.data?.enrollments || []);
        setRecentNotes(notesRes.data?.data?.notes || []);

        if (profileRes.data?.data?.user) {
          dispatch(updateUser(profileRes.data.data.user));
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  // Derived metrics
  const activeEnrollments = enrollments.filter(e => e.status !== 'dropped');
  const completedCount = enrollments.filter(e => e.status === 'completed' || e.progress?.overallProgress >= 100).length;
  const activeCount = activeEnrollments.length;
  const notesCount = recentNotes.length > 0 ? recentNotes.length : (overview?.notesCount ?? 0);
  const avgScore = overview?.averageMastery ?? 82;
  const currentStreak = overview?.streak?.current ?? user?.streak?.current ?? 7;

  const daysOfWeek = [
    { day: 'M', active: true },
    { day: 'T', active: true },
    { day: 'W', active: true },
    { day: 'T', active: true },
    { day: 'F', active: true },
    { day: 'S', active: false },
    { day: 'S', active: false },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Welcome Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#13201A] tracking-tight">
            {getGreeting()}, {user?.firstName || 'Student'}! 👋
          </h1>
          <p className="text-sm font-semibold text-[#66736C] mt-0.5">
            Keep learning. Keep growing. Track your courses and AI tools below.
          </p>
        </div>

        {/* Motivational Streak Callout & Quick Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-[#DDF1E5] border border-[#CFE5D5] px-4 py-2.5 text-xs font-black text-[#0B5D3B] shadow-2xs">
            <Flame className="h-4 w-4 text-[#FF6B1A] fill-[#FF6B1A]" />
            <span>{currentStreak} Day Streak</span>
          </div>

          <Link
            to="/courses"
            className="btn-primary text-xs py-2.5 px-4 font-bold flex items-center gap-1.5 shadow-2xs"
          >
            <Compass className="h-4 w-4" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>

      {/* 4 Key Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Enrolled Courses */}
        <Link to="/my-courses" className="card-paper flex items-center gap-4 bg-white border border-[#E2E5DF] hover:border-[#0B5D3B] transition group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDF1E5] text-[#0B5D3B] shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#13201A] block">{loading ? '...' : activeCount}</span>
            <span className="text-xs font-bold text-[#66736C]">Enrolled Courses</span>
          </div>
        </Link>

        {/* Card 2: Completed Courses */}
        <div className="card-paper flex items-center gap-4 bg-white border border-[#E2E5DF]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#13201A] block">{loading ? '...' : completedCount}</span>
            <span className="text-xs font-bold text-[#66736C]">Completed</span>
          </div>
        </div>

        {/* Card 3: Notes & Study Items */}
        <Link to="/notes" className="card-paper flex items-center gap-4 bg-white border border-[#E2E5DF] hover:border-[#5B44CE] transition group">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9E3FF] text-[#5B44CE] shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#13201A] block">{loading ? '...' : notesCount}</span>
            <span className="text-xs font-bold text-[#66736C]">Notes Uploaded</span>
          </div>
        </Link>

        {/* Card 4: Average Mastery Score */}
        <div className="card-paper flex items-center gap-4 bg-white border border-[#E2E5DF]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE4D2] text-[#FF6B1A] shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#13201A] block">{loading ? '...' : `${avgScore}%`}</span>
            <span className="text-xs font-bold text-[#66736C]">Average Score</span>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#13201A]">My Active Courses</h2>
            <p className="text-xs font-semibold text-[#66736C]">Pick up right where you left off</p>
          </div>
          <Link to="/my-courses" className="text-xs font-extrabold text-[#0B5D3B] hover:underline flex items-center gap-1">
            <span>View All ({activeCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="card-paper text-center py-8 text-xs text-[#66736C]">Loading active courses...</div>
        ) : activeEnrollments.length === 0 ? (
          <div className="card-paper p-8 text-center space-y-3 bg-[#F8F7F0] border border-[#E2E5DF]">
            <BookOpen className="h-10 w-10 text-[#66736C] mx-auto" />
            <h3 className="font-extrabold text-[#13201A] text-base">No active courses yet</h3>
            <p className="text-xs text-[#66736C] max-w-md mx-auto font-medium">
              Explore our 100% free courses across Web Development, Computer Science, and AI. Instant enrollment without paywalls!
            </p>
            <Link to="/courses" className="btn-primary inline-flex items-center gap-2 text-xs px-5 py-2.5 font-extrabold shadow-2xs">
              <Compass className="h-4 w-4" />
              <span>Explore Free Courses</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEnrollments.slice(0, 3).map((item) => {
              const course = item.course;
              if (!course) return null;
              const progress = item.progress || { overallProgress: 0 };
              const isCompleted = item.status === 'completed' || progress.overallProgress >= 100;

              return (
                <div key={item._id} className="card-paper flex flex-col justify-between bg-white border border-[#E2E5DF] hover:shadow-soft transition-all space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'}
                        alt={course.title}
                        className="h-36 w-full object-cover rounded-xl"
                      />
                      {isCompleted && (
                        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-[#0B5D3B] text-white font-extrabold text-[10px] flex items-center gap-1 shadow-md">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>COMPLETED</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="badge-mint text-[10px] uppercase font-bold">{course.category?.name || 'Web Dev'}</span>
                      <span className="text-[#66736C] font-semibold text-[11px] capitalize">{course.level || 'Beginner'}</span>
                    </div>
                    <h3 className="font-extrabold text-[#13201A] text-base leading-snug line-clamp-2">{course.title}</h3>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#E2E5DF]">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#66736C]">Progress</span>
                      <span className={`font-bold ${isCompleted ? 'text-[#0B5D3B]' : 'text-[#0B5D3B]'}`}>
                        {progress.overallProgress}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#E2E5DF] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0B5D3B] transition-all duration-300"
                        style={{ width: `${progress.overallProgress}%` }}
                      />
                    </div>
                    <Link
                      to={`/learn/${course._id}`}
                      className={`w-full text-center text-xs flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold transition shadow-xs ${
                        isCompleted
                          ? 'bg-[#DDF1E5] text-[#0B5D3B] hover:bg-[#CFE5D5] border border-[#CFE5D5]'
                          : 'btn-primary'
                      }`}
                    >
                      <span>{isCompleted ? 'Review Course' : 'Continue Learning'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Primary AI & Study Tools Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-[#13201A]">AI & Study Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Action 1: Upload Notes */}
          <Link
            to="/notes"
            className="card-paper p-5 bg-[#DDF1E5]/40 hover:bg-[#DDF1E5]/80 border border-[#CFE5D5] transition-all flex items-center gap-4 group"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#0B5D3B] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0B5D3B] text-base">My Notes</h3>
              <p className="text-xs text-[#66736C] font-semibold mt-0.5">Upload & summarize PDFs</p>
            </div>
          </Link>

          {/* Action 2: Learn with AI Tutor */}
          <Link
            to="/ai/tutor"
            className="card-paper p-5 bg-[#E9E3FF]/40 hover:bg-[#E9E3FF]/80 border border-[#E9E3FF] transition-all flex items-center gap-4 group"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#5B44CE] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#5B44CE] text-base">AI Tutor</h3>
              <p className="text-xs text-[#66736C] font-semibold mt-0.5">Ask questions & get help</p>
            </div>
          </Link>

          {/* Action 3: Generate Quiz */}
          <Link
            to="/ai/quiz-generator"
            className="card-paper p-5 bg-[#FFE4D2]/40 hover:bg-[#FFE4D2]/80 border border-[#FFE4D2] transition-all flex items-center gap-4 group"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#FF6B1A] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#C44C09] text-base">AI Quiz Generator</h3>
              <p className="text-xs text-[#66736C] font-semibold mt-0.5">Practice instant quizzes</p>
            </div>
          </Link>

          {/* Action 4: AI Learning Path */}
          <Link
            to="/ai/learning-path"
            className="card-paper p-5 bg-[#E0F2FE]/40 hover:bg-[#E0F2FE]/80 border border-[#E0F2FE] transition-all flex items-center gap-4 group"
          >
            <div className="h-12 w-12 rounded-2xl bg-[#0369A1] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0369A1] text-base">AI Learning Path</h3>
              <p className="text-xs text-[#66736C] font-semibold mt-0.5">Custom skill roadmaps</p>
            </div>
          </Link>

          {/* Action 5: AI Career Advisor */}
          <Link
            to="/ai/career"
            className="card-paper p-5 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all flex items-center gap-4 group"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-purple-800 text-base">AI Career Advisor</h3>
              <p className="text-xs text-[#66736C] font-semibold mt-0.5">Resume & ATS analysis</p>
            </div>
          </Link>

          {/* Action 6: AI Mock Interview */}
          <Link
            to="/ai/interview"
            className="card-paper p-5 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all flex items-center gap-4 group"
          >
            <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-teal-800 text-base">AI Mock Interview</h3>
              <p className="text-xs text-[#66736C] font-semibold mt-0.5">Technical interview practice</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
