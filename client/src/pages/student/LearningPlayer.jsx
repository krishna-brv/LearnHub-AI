import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import {
  Play,
  CheckCircle,
  FileText,
  Code,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronRight,
  UserCheck,
  MessageSquare,
  Send,
  X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function LearningPlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Course Mentor Chat Drawer State
  const [showMentorDrawer, setShowMentorDrawer] = useState(false);
  const [courseMentor, setCourseMentor] = useState(null);
  const [conversationId, setConversationId] = useState('');
  const [mentorMessages, setMentorMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Quiz Engine State
  const [quizStepIndex, setQuizStepIndex] = useState(0);
  const [quizUserAnswers, setQuizUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    fetchCourseAndProgress();
  }, [courseId]);

  useEffect(() => {
    setQuizStepIndex(0);
    setQuizUserAnswers({});
    setQuizSubmitted(false);
  }, [activeLesson?._id]);

  useEffect(() => {
    if (showMentorDrawer && courseId) {
      fetchMentorAndConversation();
    }
  }, [showMentorDrawer, courseId]);

  // Poll mentor chat messages every 4 seconds when drawer is open
  useEffect(() => {
    let timer;
    if (showMentorDrawer && conversationId) {
      timer = setInterval(() => {
        fetchMessages(conversationId);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [showMentorDrawer, conversationId]);

  const helperExtractId = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    if (typeof item === 'object') {
      if (item._id) return String(item._id);
      if (item.id) return String(item.id);
    }
    return String(item);
  };

  const fetchCourseAndProgress = async () => {
    try {
      const [courseRes, modulesRes, progressRes] = await Promise.all([
        axiosClient.get(`/courses/${courseId}`),
        axiosClient.get(`/courses/${courseId}/modules`),
        axiosClient.get(`/progress/course/${courseId}`)
      ]);

      const loadedCourse = courseRes.data?.data?.course;
      const loadedModules = modulesRes.data?.data?.modules || [];
      const loadedProgress = progressRes.data?.data?.progress;

      setCourse(loadedCourse);
      setModules(loadedModules);

      if (loadedProgress) {
        const rawCompleted = loadedProgress.completedLessons || [];
        setCompletedLessonIds(rawCompleted.map(helperExtractId));
        setOverallProgress(loadedProgress.overallProgress || 0);
      }

      // Auto-select first lesson if none selected
      if (loadedModules.length > 0 && loadedModules[0].lessons?.length > 0) {
        setActiveLesson(loadedModules[0].lessons[0]);
      }
    } catch (err) {
      toast.error('Could not load learning player');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorAndConversation = async () => {
    try {
      const res = await axiosClient.get(`/mentors/courses/${courseId}/mentor-chat`);
      const { mentor, conversationId: convId } = res.data?.data || {};
      setCourseMentor(mentor);
      setConversationId(convId);
      if (convId) {
        fetchMessages(convId);
      }
    } catch (err) {
      toast.error('Could not load course mentor chat');
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await axiosClient.get(`/messages/conversations/${convId}`);
      setMentorMessages(res.data?.data?.messages || []);
    } catch (err) {
      // silent poll catch
    }
  };

  const handleSendMessageToMentor = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !conversationId) return;

    setSendingMsg(true);
    try {
      const res = await axiosClient.post(`/messages/conversations/${conversationId}/messages`, {
        content: chatInput.trim()
      });
      const newMsg = res.data?.data?.message;
      if (newMsg) {
        setMentorMessages((prev) => [...prev, newMsg]);
      }
      setChatInput('');
    } catch (err) {
      toast.error('Failed to send message to course mentor');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;

    try {
      const res = await axiosClient.post('/progress/complete-lesson', {
        courseId,
        lessonId: helperExtractId(activeLesson),
        timeSpent: (activeLesson.duration || 10) * 60
      });

      const updatedProgress = res.data?.data?.progress;
      if (updatedProgress) {
        const rawCompleted = updatedProgress.completedLessons || [];
        setCompletedLessonIds(rawCompleted.map(helperExtractId));
        setOverallProgress(updatedProgress.overallProgress || 0);
      }

      toast.success(`Lesson marked complete! +10 XP`);
      advanceNextLesson();
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  const advanceNextLesson = () => {
    let foundCurrent = false;
    for (const mod of modules) {
      for (const lesson of mod.lessons || []) {
        if (foundCurrent) {
          setActiveLesson(lesson);
          return;
        }
        if (helperExtractId(lesson._id) === helperExtractId(activeLesson?._id)) {
          foundCurrent = true;
        }
      }
    }
  };

  const getLessonTypeIcon = (type, isCompleted) => {
    if (isCompleted) return <CheckCircle className="h-4 w-4 text-[#0B5D3B]" />;
    switch (type) {
      case 'video':
      case 'youtube':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'coding':
        return <Code className="h-4 w-4 text-purple-500" />;
      case 'practice':
      case 'interactive':
      case 'quiz':
      case 'assessment':
        return <HelpCircle className="h-4 w-4 text-[#FF6B1A]" />;
      default:
        return <FileText className="h-4 w-4 text-[#66736C]" />;
    }
  };

  // Helper parser for AI-generated / DB stored Quiz Questions
  const parseQuizQuestions = (rawContent, lesson) => {
    if (lesson?.content?.testCases && lesson.content.testCases.length > 0) {
      return lesson.content.testCases.map((tc, idx) => ({
        _id: tc._id || `tc_${idx}`,
        text: tc.input || tc.text || `Question ${idx + 1}`,
        options: [
          { text: tc.optionA || tc.expectedOutput || 'Option A' },
          { text: tc.optionB || 'Option B' },
          { text: tc.optionC || 'Option C' },
          { text: tc.optionD || 'Option D' }
        ],
        correctAnswer: tc.expectedOutput,
        explanation: tc.explanation || ''
      }));
    }

    if (Array.isArray(lesson?.content?.quizQuestions) && lesson.content.quizQuestions.length > 0) {
      return lesson.content.quizQuestions;
    }

    const targets = [
      rawContent,
      lesson?.content?.text,
      lesson?.content?.instructions,
      lesson?.description
    ];

    for (const targetStr of targets) {
      if (typeof targetStr === 'string') {
        const trimmed = targetStr.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) return parsed.questions;
          } catch (e) {
            // Not valid JSON
          }
        }
      }
    }

    return null;
  };

  if (loading) {
    return <div className="p-12 text-center text-[#66736C] font-semibold text-xs">Loading course learning environment...</div>;
  }

  if (!course) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#13201A]">Course Not Found</h2>
        <Link to="/my-courses" className="btn-primary inline-block">Return to My Enrolled Courses</Link>
      </div>
    );
  }

  const currentLessonIdStr = helperExtractId(activeLesson?._id);
  const isCurrentCompleted = completedLessonIds.includes(currentLessonIdStr);

  const lessonText = activeLesson?.content?.text || activeLesson?.content?.instructions || activeLesson?.description || '';
  const lessonVideoUrl = activeLesson?.content?.videoUrl || '';
  const lessonExternalUrl = activeLesson?.content?.externalUrl || '';

  const parsedQuizQuestions = parseQuizQuestions(lessonText, activeLesson);

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-6 relative max-w-7xl mx-auto pb-10">
      {/* Main Lesson Content Player Area (Left 2/3) */}
      <div className="flex-1 space-y-6 flex flex-col justify-between">
        {/* Top Header Bar */}
        <div className="card-paper flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-[#E2E5DF] rounded-2xl shadow-soft">
          <div className="flex items-center gap-3">
            <Link to="/my-courses" className="p-2 rounded-xl bg-[#F8F7F0] hover:bg-[#DDF1E5] text-[#13201A] transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h2 className="font-black text-[#13201A] text-lg leading-tight">{course.title}</h2>
              <p className="text-xs text-[#66736C] font-semibold">
                Active Lesson: <span className="font-bold text-[#0B5D3B]">{activeLesson?.title || 'Select a lesson'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-[#66736C]">Course Progress</span>
              <div className="text-sm font-black text-[#0B5D3B]">{Math.round(overallProgress)}%</div>
            </div>
            <div className="w-24 h-2 bg-[#E2E5DF] rounded-full overflow-hidden">
              <div className="h-full bg-[#0B5D3B] rounded-full transition-all duration-300" style={{ width: `${overallProgress}%` }}></div>
            </div>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1">
          {activeLesson?.type === 'video' || activeLesson?.type === 'youtube' ? (
            <div className="card-paper p-0 overflow-hidden bg-black rounded-3xl shadow-soft aspect-video flex items-center justify-center">
              {lessonVideoUrl ? (
                <iframe
                  src={lessonVideoUrl.includes('watch?v=') ? lessonVideoUrl.replace('watch?v=', 'embed/') : lessonVideoUrl}
                  title={activeLesson?.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-center p-8 text-gray-400 space-y-2">
                  <Play className="h-12 w-12 mx-auto text-[#0B5D3B]" />
                  <p className="font-bold text-gray-200">{activeLesson?.title}</p>
                  <p className="text-xs text-gray-500">Video player stream unavailable. Read lesson guide below.</p>
                </div>
              )}
            </div>
          ) : parsedQuizQuestions ? (
            /* Interactive Quiz / Assessment UI for AI Quiz Lessons or JSON Question Datasets */
            <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl space-y-6 shadow-soft">
              {/* Quiz Header & Progress */}
              <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-[#FF6B1A]" />
                  <h3 className="font-black text-[#13201A] text-lg">{activeLesson?.title || 'Interactive Assessment Quiz'}</h3>
                </div>
                <span className="badge-mint text-xs uppercase font-extrabold px-3 py-1">
                  {quizSubmitted ? 'Assessment Submitted' : `Question ${quizStepIndex + 1} of ${parsedQuizQuestions.length}`}
                </span>
              </div>

              {quizSubmitted ? (
                /* Results View */
                <div className="space-y-6 text-center py-8 bg-[#F8F7F0] rounded-2xl p-6 border border-[#E2E5DF]">
                  <div className="h-14 w-14 mx-auto rounded-full bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center font-extrabold text-xl">
                    <Award className="h-7 w-7 text-[#0B5D3B]" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-2xl font-black text-[#13201A]">
                      Assessment Complete! 🎉
                    </h4>
                    <p className="text-xs font-semibold text-[#66736C]">
                      You answered all {parsedQuizQuestions.length} questions in this lesson module.
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setQuizStepIndex(0);
                        setQuizUserAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="btn-secondary text-xs py-2.5 px-5 font-bold"
                    >
                      Retake Quiz
                    </button>
                    <button
                      onClick={handleMarkComplete}
                      className="btn-primary text-xs py-2.5 px-6 font-extrabold flex items-center gap-2"
                    >
                      <span>Mark Complete & Next Lesson</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Question Display */
                (() => {
                  const currentQ = parsedQuizQuestions[quizStepIndex] || parsedQuizQuestions[0];
                  const totalQ = parsedQuizQuestions.length;
                  const userSelected = quizUserAnswers[quizStepIndex];

                  const optionsList = Array.isArray(currentQ.options)
                    ? currentQ.options.map((opt) => (typeof opt === 'object' ? opt.text : String(opt)))
                    : ['Option A', 'Option B', 'Option C', 'Option D'];

                  return (
                    <div className="space-y-6">
                      {/* Question Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black text-[#13201A]">
                          <span>Question {quizStepIndex + 1} of {totalQ}</span>
                          <span className="text-[#0B5D3B]">{Math.round(((quizStepIndex + 1) / totalQ) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full bg-[#E2E5DF] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0B5D3B] rounded-full transition-all duration-300"
                            style={{ width: `${((quizStepIndex + 1) / totalQ) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="pt-2">
                        <h4 className="font-extrabold text-[#13201A] text-lg leading-snug">{currentQ.text}</h4>
                        {currentQ.topic && (
                          <span className="inline-block px-2.5 py-0.5 mt-2 badge-mint text-[10px] uppercase font-bold">
                            Topic: {currentQ.topic}
                          </span>
                        )}
                      </div>

                      {/* MCQ Option Buttons */}
                      <div className="space-y-3">
                        {optionsList.map((optText, oIdx) => {
                          const letter = ['A', 'B', 'C', 'D', 'E'][oIdx] || `${oIdx + 1}`;
                          const isSelected = userSelected === optText;

                          return (
                            <button
                              key={oIdx}
                              onClick={() => {
                                setQuizUserAnswers((prev) => ({ ...prev, [quizStepIndex]: optText }));
                              }}
                              className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'border-2 border-[#0B5D3B] bg-[#DDF1E5]/60 text-[#0B5D3B] font-bold shadow-xs'
                                  : 'border-[#E2E5DF] bg-white hover:bg-[#F8F7F0] text-[#13201A]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-xs text-[#66736C]">{letter}.</span>
                                <span>{optText}</span>
                              </div>

                              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#0B5D3B] bg-[#0B5D3B]' : 'border-[#9BA29B]'
                              }`}>
                                {isSelected && <div className="h-2 w-2 rounded-full bg-white"></div>}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation (if available) */}
                      {userSelected && (currentQ.explanation || currentQ.correctAnswer) && (
                        <div className="p-4 rounded-2xl bg-[#DDF1E5]/40 border border-[#CFE5D5] text-xs space-y-1">
                          <span className="font-black text-[#0B5D3B] block">Explanation & Answer:</span>
                          <p className="text-[#313C36] font-medium leading-relaxed">
                            {currentQ.explanation || `Correct Answer: ${currentQ.correctAnswer}`}
                          </p>
                        </div>
                      )}

                      {/* Quiz Navigation Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#E2E5DF]">
                        <button
                          disabled={quizStepIndex === 0}
                          onClick={() => setQuizStepIndex((prev) => Math.max(0, prev - 1))}
                          className="btn-secondary text-xs py-2.5 px-5 flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                          <span>Previous</span>
                        </button>

                        {quizStepIndex < totalQ - 1 ? (
                          <button
                            onClick={() => setQuizStepIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                            className="btn-primary text-xs py-2.5 px-6 font-extrabold flex items-center gap-1.5 shadow-xs"
                          >
                            <span>Next Question</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setQuizSubmitted(true);
                              toast.success('Assessment completed!');
                            }}
                            className="btn-orange text-xs py-2.5 px-6 font-extrabold shadow-xs"
                          >
                            Submit Assessment
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          ) : activeLesson?.type === 'coding' ? (
            <div className="card-paper p-6 bg-[#13201A] text-[#F8F7F0] rounded-3xl space-y-4 shadow-soft font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[#313C36] pb-3">
                <span className="px-2.5 py-1 rounded-full bg-[#DDF1E5] text-[#0B5D3B] font-extrabold text-[10px] uppercase">
                  {activeLesson?.content?.codeLanguage || 'JavaScript'} Practice
                </span>
              </div>
              <p className="text-[#DDF1E5] font-sans text-sm">{lessonText}</p>
              <div className="bg-[#0B1410] p-4 rounded-2xl border border-[#313C36] font-mono text-xs text-[#DDF1E5] overflow-x-auto">
                <pre>{activeLesson?.content?.codeTemplate || '// Write your code solution here\nfunction solution() {\n  return true;\n}'}</pre>
              </div>
            </div>
          ) : (
            /* Text / Markdown / PDF / General Content Viewer */
            <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl text-[#13201A] space-y-4 shadow-soft min-h-[300px]">
              <div className="prose max-w-none text-sm leading-relaxed text-[#13201A]">
                <ReactMarkdown>
                  {lessonText || 'No text content available for this lesson.'}
                </ReactMarkdown>
              </div>

              {lessonExternalUrl && (
                <div className="pt-4 border-t border-[#E2E5DF]">
                  <a
                    href={lessonExternalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary inline-flex items-center gap-2 py-2.5 px-5 text-xs font-bold"
                  >
                    <span>Open External Resource</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="card-paper flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-[#E2E5DF] rounded-2xl shadow-soft">
          <button
            onClick={() => setShowMentorDrawer(!showMentorDrawer)}
            className="px-4 py-2.5 bg-[#DDF1E5] hover:bg-[#CFE5D5] text-[#0B5D3B] font-extrabold text-xs rounded-xl transition flex items-center gap-2 border border-[#CFE5D5] shadow-2xs"
          >
            <UserCheck className="h-4 w-4" />
            <span>Ask Course Mentor</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkComplete}
              className={`py-2.5 px-6 rounded-xl font-extrabold text-xs transition flex items-center gap-2 ${
                isCurrentCompleted
                  ? 'bg-[#DDF1E5] text-[#0B5D3B] border border-[#CFE5D5] shadow-2xs'
                  : 'btn-primary shadow-xs'
              }`}
            >
              <CheckCircle className="h-4 w-4 text-[#0B5D3B]" />
              <span>{isCurrentCompleted ? '✓ Completed (Re-sync)' : 'Mark as Complete & Next'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Syllabus Navigation (Right 1/3) */}
      <div className="w-full lg:w-80 card-paper p-4 overflow-y-auto flex flex-col space-y-4 shrink-0 bg-white border border-[#E2E5DF] rounded-3xl shadow-soft">
        <h3 className="font-extrabold text-[#13201A] text-base border-b border-[#E2E5DF] pb-3">
          Course Modules & Lessons
        </h3>

        <div className="space-y-4">
          {modules.map((mod, mIdx) => {
            const modLessons = mod.lessons || [];
            const completedInMod = modLessons.filter((l) =>
              completedLessonIds.includes(helperExtractId(l._id))
            ).length;
            const totalInMod = modLessons.length;
            const isModFullyCompleted = totalInMod > 0 && completedInMod === totalInMod;

            return (
              <div key={mod._id} className="space-y-2">
                <div
                  className={`p-2.5 rounded-xl font-bold text-xs flex justify-between items-center transition ${
                    isModFullyCompleted
                      ? 'bg-[#DDF1E5] text-[#0B5D3B] border border-[#CFE5D5]'
                      : completedInMod > 0
                      ? 'bg-[#FFE4D2] text-[#C44C09] border border-[#FFE4D2]'
                      : 'bg-[#F8F7F0] text-[#13201A]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {isModFullyCompleted ? (
                      <CheckCircle className="h-4 w-4 text-[#0B5D3B] shrink-0" />
                    ) : completedInMod > 0 ? (
                      <span className="text-[#FF6B1A] font-extrabold text-xs">✓</span>
                    ) : null}
                    <span className="truncate">Mod {mIdx + 1}: {mod.title}</span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 font-extrabold flex items-center gap-1 ${
                      isModFullyCompleted
                        ? 'bg-[#0B5D3B] text-white'
                        : completedInMod > 0
                        ? 'bg-[#FF6B1A] text-white'
                        : 'bg-[#E2E5DF] text-[#66736C]'
                    }`}
                  >
                    {isModFullyCompleted ? (
                      <>
                        <span>✓</span>
                        <span>COMPLETED</span>
                      </>
                    ) : (
                      <>
                        {completedInMod > 0 && <span>✓ </span>}
                        <span>{completedInMod}/{totalInMod} DONE</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-1 pl-2">
                  {modLessons.map((lesson) => {
                    const lessonIdStr = helperExtractId(lesson._id);
                    const isCompleted = completedLessonIds.includes(lessonIdStr);
                    const isSelected = helperExtractId(activeLesson?._id) === lessonIdStr;

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between group ${
                          isSelected
                            ? isCompleted
                              ? 'bg-[#DDF1E5] text-[#0B5D3B] font-black border-l-4 border-[#0B5D3B]'
                              : 'bg-[#0B5D3B] text-white font-black border-l-4 border-[#FF6B1A]'
                            : isCompleted
                            ? 'bg-[#DDF1E5]/40 text-[#0B5D3B] hover:bg-[#DDF1E5]'
                            : 'hover:bg-[#F8F7F0] text-[#13201A]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isCompleted ? (
                            <div className="p-0.5 bg-[#0B5D3B] rounded-full text-white shrink-0 shadow-2xs flex items-center justify-center">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            getLessonTypeIcon(lesson.type, false)
                          )}
                          <span className="truncate">
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCompleted ? (
                            <span className="px-2 py-0.5 text-[9px] font-black bg-[#0B5D3B] text-white rounded-md flex items-center gap-1">
                              <span>✓</span>
                              <span>DONE</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#66736C]">{lesson.duration || 10}m</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ask Course Mentor Drawer / 1-on-1 Direct Chat Panel */}
      {showMentorDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-dropdown border-l border-[#E2E5DF] flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#0B5D3B] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              {courseMentor?.profile?.avatar ? (
                <img src={courseMentor.profile.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white text-[#0B5D3B] font-extrabold flex items-center justify-center">
                  {courseMentor?.firstName?.[0] || 'M'}
                </div>
              )}
              <div>
                <h4 className="font-extrabold text-sm text-white">
                  {courseMentor ? `${courseMentor.firstName} ${courseMentor.lastName}` : 'Course Mentor'}
                </h4>
                <p className="text-[11px] text-[#DDF1E5] flex items-center gap-1 font-semibold">
                  <UserCheck className="h-3 w-3 text-[#DDF1E5] inline" /> Dedicated Course Mentor
                </p>
              </div>
            </div>
            <button onClick={() => setShowMentorDrawer(false)} className="text-[#DDF1E5] hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F7F0]">
            {mentorMessages.length === 0 ? (
              <div className="text-center py-12 text-[#66736C] space-y-2">
                <MessageSquare className="h-10 w-10 mx-auto text-[#9BA29B]" />
                <p className="text-xs font-bold text-[#13201A]">No messages yet with your Course Mentor.</p>
                <p className="text-[11px] text-[#66736C]">Ask any questions about {course?.title || 'this course'} or this lesson!</p>
              </div>
            ) : (
              mentorMessages.map((msg) => {
                const isMe = msg.sender?._id !== courseMentor?._id;
                return (
                  <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                      isMe ? 'bg-[#0B5D3B] text-white rounded-br-none font-medium' : 'bg-white border border-[#E2E5DF] text-[#13201A] rounded-bl-none shadow-2xs font-medium'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[9px] text-right ${isMe ? 'text-[#DDF1E5]' : 'text-[#9BA29B]'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessageToMentor} className="p-3 bg-white border-t border-[#E2E5DF] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask your course mentor a question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] py-2.5 px-3 text-xs outline-none focus:border-[#0B5D3B] text-[#13201A] font-semibold"
            />
            <button
              type="submit"
              disabled={sendingMsg || !chatInput.trim()}
              className="p-2.5 btn-primary text-white rounded-xl transition disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
