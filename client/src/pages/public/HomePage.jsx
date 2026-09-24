import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  BookOpen,
  Sparkles,
  Award,
  BrainCircuit,
  Users,
  CheckCircle,
  ArrowRight,
  Play,
  FileText,
  HelpCircle,
  BarChart3,
  Star,
  Globe,
  Check
} from 'lucide-react';
import Logo from '../../components/common/Logo';

export default function HomePage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const coursesRes = await axiosClient.get('/courses?limit=6');
        setCourses(coursesRes.data?.data?.courses || []);
      } catch (err) {
        console.error('Error fetching home page data:', err);
      }
    };
    fetchPublicData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F7F0] text-[#13201A] flex flex-col font-sans">
      {/* Public Header Navbar */}
      <header className="sticky top-0 z-50 bg-[#F8F7F0]/90 backdrop-blur-md border-b border-[#E2E5DF] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#66736C]">
            <Link to="/" className="text-[#0B5D3B] font-extrabold hover:text-[#0B5D3B] transition">Home</Link>
            <Link to="/courses" className="hover:text-[#0B5D3B] transition">Features</Link>
            <Link to="/courses" className="hover:text-[#0B5D3B] transition">For Educators</Link>
            <Link to="/courses" className="hover:text-[#0B5D3B] transition">Pricing</Link>
            <Link to="/courses" className="hover:text-[#0B5D3B] transition">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-xs py-2 px-5">
              Log in
            </Link>
            <Link to="/register" className="btn-primary text-xs py-2 px-5 shadow-xs">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 py-8 sm:py-12 max-w-7xl mx-auto w-full">
        <div className="card-paper p-8 sm:p-14 bg-gradient-to-br from-[#DDF1E5]/60 via-[#F8F7F0] to-[#FFE4D2]/40 border border-[#CFE5D5] rounded-3xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center shadow-soft">
          
          {/* Left Column: Hero Text & CTAs */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#DDF1E5] px-4 py-1.5 text-[11px] font-black text-[#0B5D3B] border border-[#CFE5D5]">
              <Sparkles className="h-3.5 w-3.5 text-[#FF6B1A]" />
              <span>LEARN + PRACTICE + GROW</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-[#13201A] tracking-tight leading-[1.12]">
              Your Learning Journey, Powered by <span className="text-[#0B5D3B]">AI.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#66736C] font-semibold leading-relaxed max-w-lg">
              Upload your notes, get AI summaries, practice with quizzes and discover your weak areas — all in one place. Learn smarter. Achieve more.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/register" className="btn-orange text-xs py-3.5 px-7 shadow-md flex items-center gap-2 font-extrabold">
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/courses" className="btn-secondary text-xs py-3.5 px-6 flex items-center gap-2 font-extrabold">
                <Play className="h-3.5 w-3.5 fill-[#13201A]" />
                <span>Watch Demo</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Student Illustration & Floating Feature Badges */}
          <div className="relative flex items-center justify-center p-6">
            {/* Center Graphic Frame */}
            <div className="relative w-full max-w-md h-80 rounded-3xl bg-gradient-to-br from-[#0B5D3B]/10 to-[#FF6B1A]/10 border border-[#CFE5D5] flex items-center justify-center p-6">
              <div className="text-center space-y-3">
                <div className="text-6xl">🧑‍💻 📚 🌿</div>
                <p className="text-xs font-black text-[#0B5D3B] italic">"Smarter Students Brighter Tomorrows."</p>
                <p className="text-[10px] font-bold text-[#66736C]">A better you, one note at a time.</p>
              </div>

              {/* Floating Feature Badge 1: Summarize Notes */}
              <div className="absolute -top-3 left-4 bg-white border border-[#E2E5DF] px-3.5 py-2 rounded-2xl shadow-card flex items-center gap-2 text-xs font-bold text-[#0B5D3B]">
                <FileText className="h-4 w-4 text-[#0B5D3B]" />
                <span>Summarize Notes</span>
              </div>

              {/* Floating Feature Badge 2: Generate Quizzes */}
              <div className="absolute top-8 -right-3 bg-white border border-[#E2E5DF] px-3.5 py-2 rounded-2xl shadow-card flex items-center gap-2 text-xs font-bold text-[#FF6B1A]">
                <HelpCircle className="h-4 w-4 text-[#FF6B1A]" />
                <span>Generate Quizzes</span>
              </div>

              {/* Floating Feature Badge 3: Find Weak Topics */}
              <div className="absolute bottom-12 -left-3 bg-white border border-[#E2E5DF] px-3.5 py-2 rounded-2xl shadow-card flex items-center gap-2 text-xs font-bold text-red-600">
                <BarChart3 className="h-4 w-4 text-red-600" />
                <span>Find Weak Topics</span>
              </div>

              {/* Floating Feature Badge 4: Learn Your Way */}
              <div className="absolute -bottom-3 right-6 bg-white border border-[#E2E5DF] px-3.5 py-2 rounded-2xl shadow-card flex items-center gap-2 text-xs font-bold text-[#5B44CE]">
                <Sparkles className="h-4 w-4 text-[#5B44CE]" />
                <span>Learn Your Way</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Icons Summary Strip matching Reference Image 1 */}
      <section className="bg-white border-y border-[#E2E5DF] py-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-[#13201A]">AI Summaries</p>
              <p className="text-[10px] font-semibold text-[#66736C]">Save time</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#FFE4D2] text-[#FF6B1A] flex items-center justify-center font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-[#13201A]">Multiple Learning Styles</p>
              <p className="text-[10px] font-semibold text-[#66736C]">Tailored for you</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#E9E3FF] text-[#5B44CE] flex items-center justify-center font-bold">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-[#13201A]">Personalized Quizzes</p>
              <p className="text-[10px] font-semibold text-[#66736C]">Test recall</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-[#13201A]">Track Progress</p>
              <p className="text-[10px] font-semibold text-[#66736C]">Learn better</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Stats Strip */}
      <section className="py-12 px-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-black text-[#0B5D3B]">10K+</p>
            <p className="text-xs font-extrabold text-[#66736C] uppercase">Students</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-[#FF6B1A]">500+</p>
            <p className="text-xs font-extrabold text-[#66736C] uppercase">Study Materials</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-[#0B5D3B] flex items-center justify-center gap-1">
              4.8 <Star className="h-5 w-5 fill-[#FF6B1A] text-[#FF6B1A]" />
            </p>
            <p className="text-xs font-extrabold text-[#66736C] uppercase">User Rating</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#13201A] text-[#9BA29B] py-10 px-6 border-t border-[#1F2823]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="md" className="brightness-150" />
          <p className="text-xs font-semibold">© 2026 LearnHub AI Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
