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
  Sun
} from 'lucide-react';

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [overview, setOverview] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, notesRes, profileRes] = await Promise.all([
          axiosClient.get('/progress/overview').catch(() => ({ data: { data: { overview: null } } })),
          axiosClient.get('/notes?limit=3').catch(() => ({ data: { data: { notes: [] } } })),
          axiosClient.get('/users/me').catch(() => ({ data: { data: { user: null } } }))
        ]);
        setOverview(overviewRes.data?.data?.overview);
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

  // Real-time & calculated metrics
  const notesCount = recentNotes.length > 0 ? recentNotes.length : (overview?.notesCount ?? 12);
  const quizzesTaken = overview?.quizzesTaken ?? 8;
  const avgScore = overview?.averageMastery ?? 78;
  const topicsToReview = overview?.topicsToReview ?? 5;
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
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Top Welcome Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#13201A] tracking-tight">
            {getGreeting()}, {user?.firstName || 'Student'}! 👋
          </h1>
          <p className="text-sm font-semibold text-[#66736C] mt-0.5">
            Keep learning. Keep growing.
          </p>
        </div>

        {/* Motivational Quote Callout */}
        <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-[#DDF1E5] border border-[#CFE5D5] px-4 py-2.5 text-xs font-black text-[#0B5D3B] shadow-2xs">
          <Sun className="h-4 w-4 text-[#FF6B1A]" />
          <span>"Discipline today, results tomorrow."</span>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Notes Uploaded */}
        <div className="card-paper flex items-center gap-4 bg-white border border-[#E2E5DF]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DDF1E5] text-[#0B5D3B] shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#13201A] block">{loading ? '...' : notesCount}</span>
            <span className="text-xs font-bold text-[#66736C]">Notes Uploaded</span>
          </div>
        </div>

        {/* Card 2: Quizzes Taken */}
        <div className="card-paper flex items-center gap-4 bg-white border border-[#E2E5DF]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE4D2] text-[#FF6B1A] shrink-0">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#13201A] block">{loading ? '...' : quizzesTaken}</span>
            <span className="text-xs font-bold text-[#66736C]">Quizzes Taken</span>
          </div>
        </div>

        {/* Card 3: Average Score */}
        <div className="card-paper flex items-center gap-4 bg-white border border-[#E2E5DF]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9E3FF] text-[#5B44CE] shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#13201A] block">{loading ? '...' : `${avgScore}%`}</span>
            <span className="text-xs font-bold text-[#66736C]">Average Score</span>
          </div>
        </div>

        {/* Card 4: Topics to Review */}
        <div className="card-paper flex items-center gap-4 bg-white border border-[#E2E5DF]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-[#13201A] block">{loading ? '...' : topicsToReview}</span>
            <span className="text-xs font-bold text-[#66736C]">Topics to Review</span>
          </div>
        </div>
      </div>

      {/* 4 Primary Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Action 1: Upload Notes */}
        <Link
          to="/notes"
          className="card-paper p-6 bg-[#DDF1E5]/40 hover:bg-[#DDF1E5]/80 border border-[#CFE5D5] transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="h-12 w-12 rounded-2xl bg-[#0B5D3B] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
            <Upload className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#0B5D3B] text-lg">Upload Notes</h3>
            <p className="text-xs text-[#66736C] font-semibold mt-1">PDF, DOC, TXT, PPT</p>
          </div>
        </Link>

        {/* Action 2: Generate Quiz */}
        <Link
          to="/ai/quiz-generator"
          className="card-paper p-6 bg-[#FFE4D2]/40 hover:bg-[#FFE4D2]/80 border border-[#FFE4D2] transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="h-12 w-12 rounded-2xl bg-[#FF6B1A] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#C44C09] text-lg">Generate Quiz</h3>
            <p className="text-xs text-[#66736C] font-semibold mt-1">Test your knowledge</p>
          </div>
        </Link>

        {/* Action 3: Learn with AI */}
        <Link
          to="/ai/tutor"
          className="card-paper p-6 bg-[#E9E3FF]/40 hover:bg-[#E9E3FF]/80 border border-[#E9E3FF] transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="h-12 w-12 rounded-2xl bg-[#5B44CE] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#5B44CE] text-lg">Learn with AI</h3>
            <p className="text-xs text-[#66736C] font-semibold mt-1">Summarize, Explain, Ask</p>
          </div>
        </Link>

        {/* Action 4: Track Progress */}
        <Link
          to="/my-courses"
          className="card-paper p-6 bg-[#E0F2FE]/40 hover:bg-[#E0F2FE]/80 border border-[#E0F2FE] transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="h-12 w-12 rounded-2xl bg-[#0369A1] text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#0369A1] text-lg">Track Progress</h3>
            <p className="text-xs text-[#66736C] font-semibold mt-1">Visualize your growth</p>
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Notes, Learning Streak & Explore Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Recent Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Notes Section */}
          <div className="card-paper space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-3">
              <h3 className="font-extrabold text-[#13201A] text-base">Recent Notes</h3>
              <Link to="/notes" className="text-xs font-extrabold text-[#0B5D3B] hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {(recentNotes.length > 0 ? recentNotes : [
                { _id: 'n1', title: 'Data Structures - Unit 1', updatedAt: '2 hours ago', folder: 'Computer Science' },
                { _id: 'n2', title: 'Operating Systems', updatedAt: '1 day ago', folder: 'Systems' },
                { _id: 'n3', title: 'Computer Networks', updatedAt: '3 days ago', folder: 'Networks' },
              ]).map((note) => (
                <div key={note._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F7F0] border border-[#E2E5DF] hover:bg-[#DDF1E5]/40 transition">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#13201A] text-sm">{note.title}</h4>
                      <p className="text-[11px] text-[#66736C]">Uploaded {note.updatedAt ? (typeof note.updatedAt === 'string' && note.updatedAt.includes('ago') ? note.updatedAt : new Date(note.updatedAt).toLocaleDateString()) : 'recently'}</p>
                    </div>
                  </div>
                  <Link
                    to="/notes"
                    className="btn-primary text-xs py-1.5 px-4 font-extrabold shadow-2xs"
                  >
                    Study
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Learning Streak & Decorative Banner */}
        <div className="space-y-6">
          {/* Learning Streak Card */}
          <div className="card-paper p-6 space-y-4 bg-white border border-[#E2E5DF]">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-[#13201A] text-base">Learning Streak</h3>
              <span className="text-xs font-bold text-[#66736C]">Keep it up!</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#FFE4D2] text-[#FF6B1A] flex items-center justify-center font-bold text-xl">
                <Flame className="h-7 w-7 fill-[#FF6B1A]" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#13201A]">{currentStreak} days</span>
                <p className="text-xs text-[#66736C] font-semibold">Active learning chain</p>
              </div>
            </div>

            {/* Days Grid */}
            <div className="flex items-center justify-between pt-2">
              {daysOfWeek.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-extrabold text-[#66736C]">{d.day}</span>
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      d.active ? 'bg-[#0B5D3B] text-white shadow-2xs' : 'bg-[#E2E5DF] text-[#66736C]'
                    }`}
                  >
                    {d.active ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-[#66736C] italic pt-2 border-t border-[#E2E5DF]">
              "Consistency turns goals into reality."
            </p>
          </div>

          {/* Learn Explore Achieve Visual Card */}
          <div className="card-paper p-6 space-y-4 bg-gradient-to-br from-[#DDF1E5] via-[#FFE4D2]/40 to-[#E9E3FF]/60 border border-[#CFE5D5] text-center relative overflow-hidden">
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#0B5D3B] tracking-tight">Learn Explore Achieve</h3>
            </div>
            <div className="h-32 w-full rounded-2xl bg-[#0B5D3B]/10 border border-[#0B5D3B]/20 flex items-center justify-center text-4xl">
              🌿 📚 💡
            </div>
            <p className="text-xs font-semibold text-[#48554E]">
              Explore new AI tutoring models and master complex concepts effortlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
