import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Sparkles,
  BookOpen,
  Award,
  BrainCircuit,
  Users,
  CheckCircle2,
  ArrowRight,
  Play,
  FileText,
  HelpCircle,
  BarChart3,
  Star,
  Globe,
  Check,
  Zap,
  ChevronRight,
  GraduationCap,
  TrendingUp,
  Compass,
  Code,
  ShieldCheck,
  Layers,
  MessageSquare,
  Cpu,
  Laptop,
  ChevronDown,
  Clock,
  Flame,
  RefreshCw,
  Sliders,
  Menu,
  X
} from 'lucide-react';
import Logo from '../../components/common/Logo';

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('quiz');
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Fallback courses for high-impact visual presentation
  const defaultCourses = [
    {
      _id: 'c1',
      title: 'Deep Learning & Neural Networks Masterclass',
      category: 'Artificial Intelligence',
      level: 'Intermediate',
      rating: 4.9,
      reviewsCount: 342,
      duration: '18 hours',
      lessonsCount: 42,
      instructor: { name: 'Dr. Sarah Chen', avatar: '/default-avatar.png' },
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'c2',
      title: 'Full-Stack Modern Web Engineering 2026',
      category: 'Software Engineering',
      level: 'All Levels',
      rating: 4.9,
      reviewsCount: 512,
      duration: '26 hours',
      lessonsCount: 58,
      instructor: { name: 'Alex Rivera', avatar: '/default-avatar.png' },
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'c3',
      title: 'Data Structures & Algorithms: From Scratch to FAANG',
      category: 'Computer Science',
      level: 'Advanced',
      rating: 4.8,
      reviewsCount: 418,
      duration: '22 hours',
      lessonsCount: 48,
      instructor: { name: 'Priya Sharma', avatar: '/default-avatar.png' },
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'c4',
      title: 'Cloud DevOps & Kubernetes for Scale',
      category: 'Cloud Computing',
      level: 'Intermediate',
      rating: 4.9,
      reviewsCount: 289,
      duration: '16 hours',
      lessonsCount: 36,
      instructor: { name: 'Marcus Vance', avatar: '/default-avatar.png' },
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'c5',
      title: 'UI/UX Design Systems & Spatial Interfaces',
      category: 'Product Design',
      level: 'Beginner',
      rating: 4.8,
      reviewsCount: 310,
      duration: '14 hours',
      lessonsCount: 32,
      instructor: { name: 'Elena Rostova', avatar: '/default-avatar.png' },
      thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80'
    },
    {
      _id: 'c6',
      title: 'Prompt Engineering & Autonomous AI Agents',
      category: 'Artificial Intelligence',
      level: 'All Levels',
      rating: 5.0,
      reviewsCount: 620,
      duration: '12 hours',
      lessonsCount: 28,
      instructor: { name: 'LearnHub AI Labs', avatar: '/logo-icon.png' },
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80'
    }
  ];

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const coursesRes = await axiosClient.get('/courses?limit=6');
        const fetched = coursesRes.data?.data?.courses;
        if (fetched && fetched.length > 0) {
          setCourses(fetched);
        } else {
          setCourses(defaultCourses);
        }
      } catch (err) {
        setCourses(defaultCourses);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchPublicData();
  }, []);

  const handleQuizChoice = (idx) => {
    setQuizSelectedOption(idx);
    setQuizAnswered(true);
  };

  const resetQuiz = () => {
    setQuizSelectedOption(null);
    setQuizAnswered(false);
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const getCategoryName = (cat) => {
    if (!cat) return 'General';
    if (typeof cat === 'string') return cat;
    if (typeof cat === 'object') return cat.name || cat.slug || 'General';
    return 'General';
  };

  const getInstructorName = (inst) => {
    if (!inst) return 'Verified Expert';
    if (typeof inst === 'string') return inst;
    if (inst.firstName || inst.lastName) {
      return `${inst.firstName || ''} ${inst.lastName || ''}`.trim() || 'Verified Expert';
    }
    if (inst.name) return inst.name;
    return 'Verified Expert';
  };

  const getInstructorAvatar = (inst) => {
    if (!inst) return '/default-avatar.png';
    if (typeof inst === 'object') {
      return inst.profile?.avatar || inst.avatar || '/default-avatar.png';
    }
    return '/default-avatar.png';
  };

  const getThumbnailUrl = (thumb) => {
    if (!thumb) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
    if (typeof thumb === 'string') return thumb;
    if (typeof thumb === 'object' && thumb.url) return thumb.url;
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
  };

  const getCourseRating = (c) => {
    const r = c.averageRating ?? c.rating;
    if (typeof r === 'number' && r > 0) return r.toFixed(1);
    return '4.9';
  };

  const getCourseDuration = (c) => {
    if (c.duration) return c.duration;
    if (c.estimatedDuration) {
      return typeof c.estimatedDuration === 'number' ? `${c.estimatedDuration} hrs` : String(c.estimatedDuration);
    }
    return '16 hrs';
  };

  const getLessonsCount = (c) => {
    return c.lessonsCount || c.totalLessons || 24;
  };

  const getCourseLevel = (c) => {
    if (!c.level) return 'All Levels';
    if (typeof c.level === 'string') {
      return c.level.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return 'All Levels';
  };

  const faqs = [
    {
      q: 'How does LearnHub AI personalize my learning journey?',
      a: 'LearnHub AI analyzes your quiz performance, study notes, and pacing in real time. It identifies conceptual knowledge gaps and dynamically generates custom revision summaries, flashcards, and targeted quizzes tailored specifically to your weak areas.'
    },
    {
      q: 'Can I upload my own class notes, slides, and textbook chapters?',
      a: 'Yes! Simply upload your PDFs, DOCX, or text notes. Our AI parser extracts key concepts, generates concise bulleted summaries, builds spaced-repetition flashcards, and generates practice questions with instant step-by-step solutions.'
    },
    {
      q: 'How does the 24/7 AI Tutor differ from standard ChatGPT?',
      a: 'The LearnHub AI Tutor is purpose-built for education: it follows the Socratic teaching method to help you discover answers rather than just handing you raw text. It connects directly with your course curriculum, visual skill tree, and notes to deliver grounded, hallucination-free explanations.'
    },
    {
      q: 'Are certificates earned on LearnHub AI verified and shareable?',
      a: 'Absolutely. Every course completion certificate has a cryptographic verification hash and a permanent public URL that you can showcase on your LinkedIn profile, resume, or public LearnHub portfolio page.'
    },
    {
      q: 'Is LearnHub AI free to start?',
      a: 'Yes, you can register for free and explore the core platform, AI Tutor demo, course catalog, and notes summaries without providing a credit card.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F7F0] text-[#13201A] flex flex-col font-sans selection:bg-[#0B5D3B] selection:text-white">
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 bg-[#F8F7F0]/90 backdrop-blur-xl border-b border-[#E2E5DF] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <Logo size="md" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-[#66736C]">
            <a href="#features" className="hover:text-[#0B5D3B] transition-colors">AI Superpowers</a>
            <a href="#how-it-works" className="hover:text-[#0B5D3B] transition-colors">How It Works</a>
            <a href="#courses" className="hover:text-[#0B5D3B] transition-colors">Curriculum</a>
            <a href="#comparison" className="hover:text-[#0B5D3B] transition-colors">Why LearnHub</a>
            <a href="#faq" className="hover:text-[#0B5D3B] transition-colors">FAQs</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/ai/tutor"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#DDF1E5] text-[#0B5D3B] text-[11px] font-extrabold border border-[#CFE5D5] hover:bg-[#CFE5D5] transition shadow-2xs group"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0B5D3B] group-hover:rotate-12 transition-transform" />
              <span>AI Tutor</span>
            </Link>
            <Link to="/login" className="btn-secondary text-xs py-2 px-5 hover:bg-white font-extrabold">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-xs py-2 px-5 shadow-xs flex items-center gap-1.5 font-extrabold">
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#13201A] hover:bg-[#DDF1E5] rounded-xl transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#E2E5DF] space-y-3 pb-2 animate-fadeIn">
            <div className="flex flex-col space-y-2 text-sm font-bold text-[#48554E] px-2">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#0B5D3B]">AI Superpowers</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#0B5D3B]">How It Works</a>
              <a href="#courses" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#0B5D3B]">Curriculum</a>
              <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#0B5D3B]">Why LearnHub</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#0B5D3B]">FAQs</a>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-[#E2E5DF]">
              <Link to="/login" className="btn-secondary text-center text-xs py-2.5 font-bold">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-center text-xs py-2.5 font-bold">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 px-4 sm:px-6">
        {/* Ambient Gradient Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[700px] h-[500px] bg-gradient-to-tr from-[#00F298]/15 via-[#0B5D3B]/10 to-[#FF6B1A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-10 -z-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Main Hero Card Container */}
          <div className="relative rounded-3xl bg-gradient-to-br from-white/95 via-[#F8F7F0]/90 to-white/95 border border-[#CFE5D5] p-6 sm:p-10 lg:p-14 shadow-[0_20px_50px_rgba(11,93,59,0.06)] backdrop-blur-sm">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Hero Copy & Actions */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Status Announcement Pill */}
                <div className="inline-flex items-center gap-2 rounded-full bg-[#DDF1E5] px-3.5 py-1.5 text-xs font-black text-[#0B5D3B] border border-[#CFE5D5] shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B5D3B]"></span>
                  </span>
                  <span className="tracking-wide uppercase text-[10px] sm:text-[11px]">LearnHub AI 2.0 • Intelligent Learning Ecosystem</span>
                </div>

                {/* Primary Hero Heading */}
                <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#13201A] tracking-tight leading-[1.08]">
                  Learn Smarter.{' '}
                  <span className="block mt-1">Practice Better.</span>
                  <span className="block mt-1 bg-gradient-to-r from-[#0B5D3B] via-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    Grow Faster with AI.
                  </span>
                </h1>

                {/* Subtitle Description */}
                <p className="text-sm sm:text-base text-[#526058] font-medium leading-relaxed max-w-xl">
                  Turn study notes into instant summaries, master difficult concepts with your 24/7 personal AI Tutor, solve adaptive quizzes, and track your visual skill tree to career mastery.
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <Link
                    to="/register"
                    className="btn-primary py-3.5 px-7 text-xs sm:text-sm font-black flex items-center gap-2 shadow-[0_8px_20px_rgba(11,93,59,0.25)] hover:shadow-[0_12px_28px_rgba(11,93,59,0.35)] transition-all"
                  >
                    <span>Start Learning for Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <Link
                    to="/ai/tutor"
                    className="btn-secondary py-3.5 px-6 text-xs sm:text-sm font-black flex items-center gap-2 hover:border-[#0B5D3B] transition-all"
                  >
                    <Sparkles className="h-4 w-4 text-[#0B5D3B]" />
                    <span>Try AI Tutor Demo</span>
                  </Link>
                </div>

                {/* Genuine Platform Highlights */}
                <div className="pt-4 flex flex-wrap items-center gap-5 text-xs font-bold text-[#48554E] border-t border-[#E2E5DF]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0B5D3B]" />
                    <span>Free to get started</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0B5D3B]" />
                    <span>Private note analysis</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0B5D3B]" />
                    <span>Instant quiz generator</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive AI Studio Preview (Interactive Sandbox) */}
              <div className="lg:col-span-6 relative">
                {/* Floating Glow Behind Card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00F298]/20 to-[#0B5D3B]/20 rounded-3xl blur-xl -z-10" />

                {/* Interactive IDE / Studio Window */}
                <div className="rounded-2xl bg-[#0F1713] text-gray-100 border border-emerald-900/40 shadow-2xl overflow-hidden">
                  {/* Top Bar with Window Controls & Status */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#0A100D] border-b border-emerald-950/60">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                      <span className="text-[11px] font-mono font-medium text-emerald-400/80 ml-2">
                        learnhub-ai://session-live
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/40 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>AI Model Online</span>
                    </div>
                  </div>

                  {/* Interactive Tab Switcher */}
                  <div className="flex border-b border-emerald-950/60 bg-[#0C1410] px-3 pt-2 text-xs font-bold gap-2">
                    <button
                      onClick={() => setActivePreviewTab('quiz')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition-colors ${
                        activePreviewTab === 'quiz'
                          ? 'bg-[#14221A] text-emerald-400 border-t-2 border-emerald-400'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Adaptive Quiz</span>
                    </button>
                    <button
                      onClick={() => setActivePreviewTab('chat')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition-colors ${
                        activePreviewTab === 'chat'
                          ? 'bg-[#14221A] text-emerald-400 border-t-2 border-emerald-400'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>AI Tutor Chat</span>
                    </button>
                    <button
                      onClick={() => setActivePreviewTab('notes')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg transition-colors ${
                        activePreviewTab === 'notes'
                          ? 'bg-[#14221A] text-emerald-400 border-t-2 border-emerald-400'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Note Synthesizer</span>
                    </button>
                  </div>

                  {/* Tab Content Display */}
                  <div className="p-5 sm:p-6 bg-[#0E1A14] min-h-[300px] flex flex-col justify-between">
                    {/* TAB 1: INTERACTIVE QUIZ */}
                    {activePreviewTab === 'quiz' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="font-semibold text-emerald-400">Question 3 of 5 • Machine Learning</span>
                          <span className="bg-emerald-950 border border-emerald-800/40 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono">
                            Difficulty: Adaptive High
                          </span>
                        </div>

                        <p className="text-sm font-bold text-gray-100 leading-snug">
                          Which optimization technique dynamically adjusts learning rates based on past squared gradients?
                        </p>

                        <div className="space-y-2 pt-1">
                          {[
                            { id: 0, text: 'Standard Gradient Descent (SGD)', isCorrect: false },
                            { id: 1, text: 'Adam / RMSProp with Exponential Decay', isCorrect: true },
                            { id: 2, text: 'Linear Perceptron Weight Clamping', isCorrect: false },
                            { id: 3, text: 'Static Momentum Without Decay', isCorrect: false }
                          ].map((opt) => {
                            let stateClass = 'bg-[#14251D] hover:bg-[#1A3126] border-emerald-900/50 text-gray-200';
                            if (quizAnswered) {
                              if (opt.isCorrect) {
                                stateClass = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400';
                              } else if (quizSelectedOption === opt.id) {
                                stateClass = 'bg-red-950/80 border-red-500 text-red-200';
                              } else {
                                stateClass = 'bg-[#14251D]/50 border-transparent text-gray-500 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleQuizChoice(opt.id)}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${stateClass}`}
                              >
                                <span>{opt.text}</span>
                                {quizAnswered && opt.isCorrect && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizAnswered && (
                          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2.5 animate-fadeIn">
                            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-bold">
                                {quizSelectedOption === 1 ? '🎉 Brilliant! Correct Answer!' : '💡 Conceptual Explanation:'}
                              </p>
                              <p className="text-[11px] text-gray-300 leading-relaxed">
                                RMSProp and Adam compute moving averages of past squared gradients to prevent vanishing/exploding updates in sparse data.
                              </p>
                              <button
                                onClick={resetQuiz}
                                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-bold pt-1"
                              >
                                <RefreshCw className="h-3 w-3" />
                                <span>Try Another Question</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: AI TUTOR CHAT */}
                    {activePreviewTab === 'chat' && (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="h-7 w-7 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                            You
                          </div>
                          <div className="bg-[#15271E] rounded-2xl rounded-tl-none p-3 text-xs text-gray-200 border border-emerald-900/40">
                            Can you explain Backpropagation like I'm 15 and give me an analogy?
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <img
                            src="/logo-icon.png"
                            alt="AI Tutor"
                            className="h-7 w-7 rounded-lg object-contain bg-emerald-950 p-0.5 shrink-0 border border-emerald-500/30"
                          />
                          <div className="bg-[#1A3125] rounded-2xl rounded-tl-none p-3 text-xs text-gray-200 space-y-2 border border-emerald-800/40">
                            <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>AI Tutor Socratic Explanation:</span>
                            </p>
                            <p className="text-[11px] text-gray-200 leading-relaxed">
                              Imagine an archery team shooting at a bullseye. When an arrow lands 2 feet high and to the left:
                            </p>
                            <ul className="text-[11px] text-gray-300 list-disc list-inside space-y-1">
                              <li><strong>Loss:</strong> How far the arrow missed the target.</li>
                              <li><strong>Backprop:</strong> Walking backward from the target to the archer, telling each arm muscle exactly how much to adjust for the next shot!</li>
                            </ul>
                            <div className="pt-1">
                              <span className="inline-block bg-emerald-900/50 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-mono">
                                Chain Rule: dL/dw = (dL/dy) * (dy/dz) * (dz/dw)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: NOTE SYNTHESIZER */}
                    {activePreviewTab === 'notes' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-gray-400 pb-1 border-b border-emerald-950">
                          <span className="font-mono text-emerald-400">Input: cs229_lecture04.pdf (14 pages)</span>
                          <span className="text-emerald-300 text-[10px] font-bold bg-emerald-950 px-2 py-0.5 rounded">
                            Synthesized in 1.4s
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#14251D] border border-emerald-800/40 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Executive Summary Takeaways</span>
                          </div>
                          <ul className="text-[11px] text-gray-300 space-y-1.5 list-disc list-inside">
                            <li>Overfitting occurs when high-variance models memorize noise rather than generalizable signals.</li>
                            <li>L2 Regularization (Ridge) penalizes large weight magnitudes quadratically.</li>
                            <li>Early stopping halts training when validation loss stops improving.</li>
                          </ul>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between text-xs">
                          <span className="text-gray-300 text-[11px]">Auto-generated 8 Spaced Flashcards</span>
                          <Link to="/flashcards" className="text-emerald-400 text-[11px] font-bold hover:underline flex items-center gap-1">
                            <span>Open Cards</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Bottom Status bar */}
                    <div className="pt-4 border-t border-emerald-950/80 flex items-center justify-between text-[11px] text-gray-400">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Adaptive Knowledge Curve: <strong>+94% Retention</strong></span>
                      </div>
                      <Link to="/ai/tutor" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                        <span>Launch Full Studio</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Badge 1 (Bottom Left) */}
                <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white border border-[#E2E5DF] p-3 rounded-2xl shadow-xl items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-xl bg-[#DDF1E5] flex items-center justify-center text-[#0B5D3B]">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#13201A]">4.5 Hrs Saved/Week</p>
                    <p className="text-[10px] font-bold text-[#66736C]">Automated Note Summaries</p>
                  </div>
                </div>

                {/* Floating Metric Badge 2 (Top Right) */}
                <div className="hidden sm:flex absolute -top-5 -right-5 bg-white border border-[#E2E5DF] p-3 rounded-2xl shadow-xl items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#13201A]">Verified Credentials</p>
                    <p className="text-[10px] font-bold text-[#66736C]">Cryptographic Badges</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Strip */}
      <section className="bg-white border-y border-[#E2E5DF] py-7 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center font-bold shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-[#13201A]">Note Synthesizer</p>
              <p className="text-[10px] font-semibold text-[#66736C]">Instant summaries & flashcards</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#FFE4D2] text-[#FF6B1A] flex items-center justify-center font-bold shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-[#13201A]">Adaptive Quizzes</p>
              <p className="text-[10px] font-semibold text-[#66736C]">Targeted weak-spot practice</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#E9E3FF] text-[#5B44CE] flex items-center justify-center font-bold shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-[#13201A]">24/7 Socratic Tutor</p>
              <p className="text-[10px] font-semibold text-[#66736C]">Step-by-step concept guidance</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-[#13201A]">Verified Badges</p>
              <p className="text-[10px] font-semibold text-[#66736C]">Sharable public credentials</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Superpowers Bento Grid Section */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#DDF1E5] px-3.5 py-1 text-xs font-extrabold text-[#0B5D3B]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-POWERED ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#13201A] tracking-tight">
            Six Superpowers to Accelerate Your Career
          </h2>
          <p className="text-sm text-[#66736C] font-medium leading-relaxed">
            Everything you need to master technical skills, pass challenging exams, and prepare for high-impact job interviews.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: 24/7 AI Tutor */}
          <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl hover:border-[#CFE5D5] transition-all group hover:-translate-y-1 space-y-4 shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-[#13201A]">24/7 Socratic AI Tutor</h3>
            <p className="text-xs sm:text-sm text-[#66736C] font-medium leading-relaxed">
              Never get stuck on a homework problem or complex coding concept. Your AI tutor guides you step-by-step using proven Socratic inquiry.
            </p>
            <Link to="/ai/tutor" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0B5D3B] group-hover:underline pt-2">
              <span>Open AI Tutor</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2: Adaptive Quiz Engine */}
          <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl hover:border-[#CFE5D5] transition-all group hover:-translate-y-1 space-y-4 shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-[#FFE4D2] text-[#FF6B1A] flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-[#13201A]">Adaptive Quiz Generator</h3>
            <p className="text-xs sm:text-sm text-[#66736C] font-medium leading-relaxed">
              Turn any topic, chapter, or uploaded file into calibrated practice quizzes with instant grading, explanations, and weak-spot detection.
            </p>
            <Link to="/ai/quiz-generator" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#FF6B1A] group-hover:underline pt-2">
              <span>Generate Quizzes</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 3: Visual Skill Trees */}
          <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl hover:border-[#CFE5D5] transition-all group hover:-translate-y-1 space-y-4 shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-[#E9E3FF] text-[#5B44CE] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-[#13201A]">Visual Skill Trees</h3>
            <p className="text-xs sm:text-sm text-[#66736C] font-medium leading-relaxed">
              Experience an RPG-style mastery map. Watch nodes unlock as you practice, revealing prerequisites and optimal learning paths.
            </p>
            <Link to="/skill-tree" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5B44CE] group-hover:underline pt-2">
              <span>Explore Skill Map</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 4: AI Mock Interviewer */}
          <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl hover:border-[#CFE5D5] transition-all group hover:-translate-y-1 space-y-4 shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-[#13201A]">AI Mock Interviewer</h3>
            <p className="text-xs sm:text-sm text-[#66736C] font-medium leading-relaxed">
              Simulate high-stakes behavioral and technical coding interviews with instant feedback on clarity, structure, and technical depth.
            </p>
            <Link to="/ai/interview" className="inline-flex items-center gap-1 text-xs font-extrabold text-teal-700 group-hover:underline pt-2">
              <span>Practice Interview</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 5: Note & PDF Synthesizer */}
          <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl hover:border-[#CFE5D5] transition-all group hover:-translate-y-1 space-y-4 shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-[#13201A]">Smart Note Summarizer</h3>
            <p className="text-xs sm:text-sm text-[#66736C] font-medium leading-relaxed">
              Upload dense PDF lectures and study notes. Get bulleted summaries, flashcard decks, and core formula cheatsheets in seconds.
            </p>
            <Link to="/notes" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0369A1] group-hover:underline pt-2">
              <span>View Notes Engine</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 6: Verifiable Certificates & Portfolio */}
          <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl hover:border-[#CFE5D5] transition-all group hover:-translate-y-1 space-y-4 shadow-soft">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-[#13201A]">Verified Portfolio & Badges</h3>
            <p className="text-xs sm:text-sm text-[#66736C] font-medium leading-relaxed">
              Earn cryptographically signed certificates upon course and quiz completions. Showcase your public portfolio directly to hiring managers.
            </p>
            <Link to="/certificates" className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-700 group-hover:underline pt-2">
              <span>Verify Badges</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-[#F8F7F0] via-white to-[#F8F7F0] border-y border-[#E2E5DF]">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0B5D3B]">Step-by-Step Pacing</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#13201A]">How LearnHub AI Transforms Your Study Routine</h2>
            <p className="text-xs sm:text-sm text-[#66736C] font-semibold">
              Three simple steps from feeling overwhelmed to mastering any technical topic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl space-y-4 text-center relative shadow-soft">
              <div className="h-12 w-12 rounded-full bg-[#0B5D3B] text-white flex items-center justify-center font-black text-lg mx-auto shadow-md">
                01
              </div>
              <h3 className="text-base font-black text-[#13201A]">Input Your Study Goal</h3>
              <p className="text-xs text-[#66736C] font-medium leading-relaxed">
                Choose a career track from our catalog or upload your raw class slides, lecture PDFs, and syllabus notes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl space-y-4 text-center relative shadow-soft">
              <div className="h-12 w-12 rounded-full bg-[#FF6B1A] text-white flex items-center justify-center font-black text-lg mx-auto shadow-md">
                02
              </div>
              <h3 className="text-base font-black text-[#13201A]">AI Synthesizes & Tests</h3>
              <p className="text-xs text-[#66736C] font-medium leading-relaxed">
                The engine breaks down complex ideas, serves interactive flashcards, and generates adaptive quizzes to probe deep comprehension.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl space-y-4 text-center relative shadow-soft">
              <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-lg mx-auto shadow-md">
                03
              </div>
              <h3 className="text-base font-black text-[#13201A]">Mastery & Certification</h3>
              <p className="text-xs text-[#66736C] font-medium leading-relaxed">
                Identify and eliminate weak points, unlock your verified course credentials, and publish your verified portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section id="courses" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-[#0B5D3B] tracking-wide">Industry-Aligned Curriculum</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#13201A]">Explore Popular Career Tracks</h2>
            <p className="text-xs sm:text-sm text-[#66736C] font-semibold">
              Comprehensive interactive courses with quizzes, project labs, and verified certificates.
            </p>
          </div>
          <Link to="/courses" className="btn-secondary text-xs py-2.5 px-6 font-bold flex items-center gap-1.5 self-start sm:self-auto">
            <span>View All Courses</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.slice(0, 6).map((course) => (
            <div
              key={course._id}
              className="card-paper p-0 overflow-hidden bg-white border border-[#E2E5DF] rounded-3xl hover:border-[#CFE5D5] transition-all group hover:-translate-y-1 shadow-soft flex flex-col"
            >
              {/* Course Thumbnail */}
              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                <img
                  src={getThumbnailUrl(course.thumbnail)}
                  alt={course.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#13201A]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white">
                  {getCategoryName(course.category)}
                </div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-extrabold text-[#0B5D3B] flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{getCourseRating(course)}</span>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-[#13201A] line-clamp-2 leading-snug group-hover:text-[#0B5D3B] transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-[#66736C]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{getCourseDuration(course)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{getLessonsCount(course)} lessons</span>
                    </span>
                    <span className="bg-[#DDF1E5] text-[#0B5D3B] px-2 py-0.5 rounded text-[10px] font-bold">
                      {getCourseLevel(course)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E5DF] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={getInstructorAvatar(course.instructor)}
                      alt="Instructor"
                      className="h-7 w-7 rounded-full object-cover border border-[#CFE5D5]"
                    />
                    <span className="text-xs font-bold text-[#13201A] truncate max-w-[120px]">
                      {getInstructorName(course.instructor)}
                    </span>
                  </div>

                  <Link
                    to={`/courses/${course._id}`}
                    className="btn-primary text-[11px] py-1.5 px-3.5 font-bold flex items-center gap-1"
                  >
                    <span>View Course</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section: Traditional vs LearnHub */}
      <section id="comparison" className="py-20 px-4 sm:px-6 bg-[#F8F7F0]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black text-[#0B5D3B] uppercase">The Learning Evolution</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#13201A]">Why Students Learn 3x Faster with LearnHub AI</h2>
          </div>

          <div className="card-paper p-0 overflow-hidden bg-white border border-[#E2E5DF] rounded-3xl shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E2E5DF]">
              {/* Traditional Studying */}
              <div className="p-8 sm:p-10 space-y-6 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    ✕
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Traditional Studying</h3>
                    <p className="text-xs text-gray-500 font-medium">Static, slow & repetitive</p>
                  </div>
                </div>

                <ul className="space-y-4 text-xs font-semibold text-gray-600">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Re-reading dense 40-page chapters with low retention</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Waiting days for office hours or teaching assistants when stuck</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Guessing what to practice without knowing actual weak points</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Static multiple-choice questions without customized explanations</span>
                  </li>
                </ul>
              </div>

              {/* LearnHub AI */}
              <div className="p-8 sm:p-10 space-y-6 bg-gradient-to-br from-[#DDF1E5]/40 via-white to-white">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0B5D3B]">LearnHub AI Ecosystem</h3>
                    <p className="text-xs text-emerald-800 font-semibold">Active, personalized & immediate</p>
                  </div>
                </div>

                <ul className="space-y-4 text-xs font-bold text-[#13201A]">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                    <span>Instant executive summaries and flashcards generated from your notes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                    <span>24/7 Socratic AI Tutor answers questions in seconds with tailored analogies</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                    <span>Algorithmic diagnosis pinpoints knowledge gaps and creates targeted drills</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                    <span>Verifiable credentials and real-world mock interview simulations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-white border-t border-[#E2E5DF]">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase text-[#0B5D3B]">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#13201A]">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-[#E2E5DF] rounded-2xl p-4 transition-colors bg-[#F8F7F0]/40 hover:bg-[#F8F7F0]"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left flex items-center justify-between font-extrabold text-sm text-[#13201A]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#66736C] transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-180 text-[#0B5D3B]' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <p className="text-xs text-[#526058] font-medium pt-3 leading-relaxed animate-fadeIn">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Impact Bottom Call to Action */}
      <section className="py-20 px-4 sm:px-6 bg-[#0B5D3B] text-white relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black text-emerald-200 border border-white/20 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SUPERCHARGE YOUR LEARNING WITH AI</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Supercharge Your Learning Experience?
          </h2>

          <p className="text-xs sm:text-base text-emerald-100 max-w-2xl mx-auto font-medium leading-relaxed">
            Get instant access to adaptive quizzes, note summarization, your personal AI tutor, and verifiable career certificates today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="bg-white text-[#0B5D3B] hover:bg-emerald-50 font-black text-xs sm:text-sm px-8 py-4 rounded-full transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/courses"
              className="bg-transparent border border-white/40 hover:bg-white/10 text-white font-extrabold text-xs sm:text-sm px-8 py-4 rounded-full transition-all"
            >
              Explore Course Catalog
            </Link>
          </div>

          <p className="text-[11px] text-emerald-200 font-semibold pt-2">
            No credit card required • Instant free access • Cancel anytime
          </p>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-[#0B1510] text-[#9BA29B] pt-16 pb-12 px-6 border-t border-[#192A20]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#1A2C22]">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <Logo size="lg" inverted={true} showTagline={true} />
            </Link>
            <p className="text-xs text-gray-400 font-medium max-w-sm leading-relaxed">
              LearnHub AI is the next-generation intelligent learning platform designed to help students, developers, and professionals learn smarter, practice better, and grow faster.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-bold text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Column 1: AI Superpowers */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider">AI Superpowers</h4>
            <ul className="space-y-2 text-xs font-medium text-gray-400">
              <li><Link to="/ai/tutor" className="hover:text-emerald-400 transition-colors">24/7 AI Tutor</Link></li>
              <li><Link to="/ai/quiz-generator" className="hover:text-emerald-400 transition-colors">Quiz Generator</Link></li>
              <li><Link to="/ai/learning-path" className="hover:text-emerald-400 transition-colors">Learning Path</Link></li>
              <li><Link to="/ai/career" className="hover:text-emerald-400 transition-colors">Career Advisor</Link></li>
              <li><Link to="/ai/interview" className="hover:text-emerald-400 transition-colors">Mock Interviews</Link></li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider">Curriculum</h4>
            <ul className="space-y-2 text-xs font-medium text-gray-400">
              <li><Link to="/courses" className="hover:text-emerald-400 transition-colors">Course Catalog</Link></li>
              <li><Link to="/skill-tree" className="hover:text-emerald-400 transition-colors">Skill Trees</Link></li>
              <li><Link to="/flashcards" className="hover:text-emerald-400 transition-colors">Flashcards</Link></li>
              <li><Link to="/certificates" className="hover:text-emerald-400 transition-colors">Certificates</Link></li>
              <li><Link to="/mentoring" className="hover:text-emerald-400 transition-colors">Find a Mentor</Link></li>
            </ul>
          </div>

          {/* Column 3: Account & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-wider">Get Started</h4>
            <ul className="space-y-2 text-xs font-medium text-gray-400">
              <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Sign Up Free</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Log In</Link></li>
              <li><a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ & Help</a></li>
              <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-medium gap-4">
          <p>© {new Date().getFullYear()} LearnHub AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
