import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Clock,
  Globe,
  X,
  Play,
  Check,
  Send,
  AlertCircle
} from 'lucide-react';

export default function InstructorCourseStudioPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});

  // Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('video'); // video, text, quiz
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonDuration, setLessonDuration] = useState(10);
  const [isFreePreview, setIsFreePreview] = useState(false);

  // AI Quiz Generation State
  const [generatingQuizModuleId, setGeneratingQuizModuleId] = useState(null);
  const [isAiQuizModalOpen, setIsAiQuizModalOpen] = useState(false);
  const [aiQuizTargetModule, setAiQuizTargetModule] = useState(null);
  const [aiQuizTopic, setAiQuizTopic] = useState('');
  const [aiQuizDifficulty, setAiQuizDifficulty] = useState('medium');
  const [aiQuizCount, setAiQuizCount] = useState(5);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const [courseRes, modulesRes] = await Promise.all([
        axiosClient.get(`/courses/${courseId}`),
        axiosClient.get(`/courses/${courseId}/modules`)
      ]);

      const courseData = courseRes.data?.data?.course;
      setCourse(courseData);

      const modulesData = modulesRes.data?.data?.modules || [];
      setModules(modulesData);

      // Expand all modules by default
      const expandedState = {};
      modulesData.forEach((m) => {
        expandedState[m._id] = true;
      });
      setExpandedModules(expandedState);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Could not fetch course studio details');
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleExpand = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Submit Course to Content Reviewer
  const handleSubmitForReview = async () => {
    if (!course) return;
    if (!modules || modules.length === 0) {
      toast.error('Please create at least one module before submitting your course.');
      return;
    }
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons ? m.lessons.length : 0), 0);
    if (totalLessons === 0) {
      toast.error('Please add at least one lesson to your modules before submitting.');
      return;
    }

    try {
      const res = await axiosClient.put(`/courses/${courseId}/submit`);
      const updatedCourse = res.data?.data?.course || { ...course, status: 'submitted' };
      setCourse(updatedCourse);
      toast.success('Course submitted to Content Reviewers for evaluation!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit course for review');
    }
  };

  // Create or Update Module
  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    try {
      if (editingModuleId) {
        // Update
        const res = await axiosClient.put(`/courses/${courseId}/modules/${editingModuleId}`, {
          title: moduleTitle.trim(),
          description: moduleDescription.trim()
        });
        toast.success('Module updated');
      } else {
        // Create
        await axiosClient.post(`/courses/${courseId}/modules`, {
          title: moduleTitle.trim(),
          description: moduleDescription.trim()
        });
        toast.success('Module created successfully');
      }

      setIsModuleModalOpen(false);
      setModuleTitle('');
      setModuleDescription('');
      setEditingModuleId(null);
      await fetchCourseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save module');
    }
  };

  const handleOpenEditModule = (mod) => {
    setEditingModuleId(mod._id);
    setModuleTitle(mod.title || '');
    setModuleDescription(mod.description || '');
    setIsModuleModalOpen(true);
  };

  const handleDeleteModule = async (modId) => {
    if (!window.confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      await axiosClient.delete(`/courses/${courseId}/modules/${modId}`);
      toast.success('Module deleted');
      await fetchCourseData();
    } catch (err) {
      toast.error('Failed to delete module');
    }
  };

  // Open Lesson Modal for Create or Edit
  const handleOpenAddLesson = (modId) => {
    setTargetModuleId(modId);
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonType('video');
    setLessonVideoUrl('');
    setLessonContent('');
    setLessonDuration(10);
    setIsFreePreview(false);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (modId, les) => {
    setTargetModuleId(modId);
    setEditingLessonId(les._id);
    setLessonTitle(les.title || '');
    setLessonType(les.type || 'video');
    setLessonVideoUrl(les.videoUrl || '');
    setLessonContent(les.content || '');
    setLessonDuration(les.duration || 10);
    setIsFreePreview(Boolean(les.isFreePreview));
    setIsLessonModalOpen(true);
  };

  // Create or Update Lesson
  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !targetModuleId) return;

    try {
      const payload = {
        title: lessonTitle.trim(),
        type: lessonType,
        videoUrl: lessonVideoUrl.trim(),
        content: lessonContent.trim(),
        duration: Number(lessonDuration) || 10,
        isFreePreview
      };

      if (editingLessonId) {
        await axiosClient.put(`/courses/${courseId}/modules/${targetModuleId}/lessons/${editingLessonId}`, payload);
        toast.success('Lesson updated');
      } else {
        await axiosClient.post(`/courses/${courseId}/modules/${targetModuleId}/lessons`, payload);
        toast.success('Lesson added to module');
      }

      setIsLessonModalOpen(false);
      await fetchCourseData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (modId, lesId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await axiosClient.delete(`/courses/${courseId}/modules/${modId}/lessons/${lesId}`);
      toast.success('Lesson deleted');
      await fetchCourseData();
    } catch (err) {
      toast.error('Failed to delete lesson');
    }
  };

  // Open AI Quiz Setup Modal for Module
  const handleOpenAiQuizModal = (mod) => {
    setAiQuizTargetModule(mod);
    setAiQuizTopic(`${mod.title} (${course?.title || ''})`);
    setAiQuizDifficulty(course?.level || 'medium');
    setAiQuizCount(5);
    setIsAiQuizModalOpen(true);
  };

  // Generate AI Quiz for Module with Custom Topic
  const handleGenerateAIQuizForModule = async (e) => {
    e.preventDefault();
    if (!aiQuizTargetModule || !aiQuizTopic.trim()) return;

    setGeneratingQuizModuleId(aiQuizTargetModule._id);
    try {
      const quizRes = await axiosClient.post('/ai/quiz-generator/generate', {
        topic: aiQuizTopic.trim(),
        difficulty: aiQuizDifficulty,
        count: parseInt(aiQuizCount, 10),
        type: 'mcq'
      });

      const questions = quizRes.data?.data?.questions || [];
      if (questions.length === 0) {
        toast.error('Could not generate AI quiz questions');
        return;
      }

      // Add as a quiz lesson to module
      await axiosClient.post(`/courses/${courseId}/modules/${aiQuizTargetModule._id}/lessons`, {
        title: `AI Assessment Quiz: ${aiQuizTargetModule.title}`,
        type: 'quiz',
        duration: 15,
        content: JSON.stringify(questions),
        isFreePreview: false
      });

      toast.success(`Generated ${questions.length} AI Quiz Questions & added lesson to ${aiQuizTargetModule.title}!`);
      setIsAiQuizModalOpen(false);
      await fetchCourseData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate AI quiz lesson');
    } finally {
      setGeneratingQuizModuleId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-main/20 border-t-primary-main rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Loading Authoring Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner Header */}
      <div className="card-paper bg-gradient-to-r from-[#1C252E] via-[#16202A] to-[#0D131A] text-white p-8 rounded-2xl shadow-xl space-y-4 border border-gray-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              to="/instructor/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Instructor Dashboard</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{course?.title}</h1>
              <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                course?.status === 'published'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : course?.status === 'submitted' || course?.status === 'under_review'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : course?.status === 'changes_requested'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : course?.status === 'rejected'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
              }`}>
                ● {course?.status?.replace('_', ' ') || 'draft'}
              </span>
            </div>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">{course?.description}</p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {['draft', 'changes_requested', 'rejected'].includes(course?.status) && (
              <button
                onClick={handleSubmitForReview}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-md"
              >
                <Send className="h-4 w-4" />
                <span>{course?.status === 'draft' ? 'Submit for Review' : 'Re-submit for Review'}</span>
              </button>
            )}

            {['submitted', 'under_review'].includes(course?.status) && (
              <div className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-500/20 text-blue-200 border border-blue-500/30 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-300 animate-spin" />
                <span>Pending Reviewer Audit</span>
              </div>
            )}

            {course?.status === 'published' && (
              <div className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Live Course</span>
              </div>
            )}

            <Link
              to={`/course/${course?.slug || courseId}`}
              target="_blank"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              <Eye className="h-4 w-4 text-primary-light" />
              <span>Landing Page</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Review Feedback Alert Banners */}
      {course?.status === 'changes_requested' && (
        <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-amber-900 text-sm flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span>Content Reviewer Requested Changes</span>
            </h3>
            <button
              onClick={handleSubmitForReview}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Re-submit for Review</span>
            </button>
          </div>
          <p className="text-xs text-amber-800 font-medium bg-white/70 p-3 rounded-xl border border-amber-200">
            Reviewer Notes: "{course.reviewNotes || 'Please update course content and re-submit for review.'}"
          </p>
        </div>
      )}

      {course?.status === 'rejected' && (
        <div className="bg-rose-50 border-2 border-rose-300 p-5 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-rose-900 text-sm flex items-center gap-2">
              <X className="h-5 w-5 text-rose-600" />
              <span>Course Review Rejected</span>
            </h3>
            <button
              onClick={handleSubmitForReview}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Re-submit for Review</span>
            </button>
          </div>
          <p className="text-xs text-rose-800 font-medium bg-white/70 p-3 rounded-xl border border-rose-200">
            Rejection Reason: "{course.reviewNotes || 'Content did not meet curriculum quality guidelines.'}"
          </p>
        </div>
      )}

      {['submitted', 'under_review'].includes(course?.status) && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center gap-3 text-blue-900 text-xs font-semibold shadow-xs">
          <Clock className="h-5 w-5 text-blue-600 shrink-0 animate-spin" />
          <span>This course has been submitted to Content Reviewers for quality audit. Once approved, it will be published live automatically.</span>
        </div>
      )}

      {/* Curriculum & Modules Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Course Modules & Curriculum</h2>
          <p className="text-xs text-gray-500">Organize modules, video lectures, reading materials, and AI quizzes</p>
        </div>

        <button
          onClick={() => {
            setEditingModuleId(null);
            setModuleTitle('');
            setModuleDescription('');
            setIsModuleModalOpen(true);
          }}
          className="px-5 py-2.5 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-main/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Module</span>
        </button>
      </div>

      {/* Modules List Accordion */}
      {modules.length === 0 ? (
        <div className="card-paper p-12 text-center space-y-4 bg-white border border-gray-200/80 rounded-2xl shadow-xs">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-800">No Modules Added Yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Start structuring your course by creating your first module, then add video lessons and AI quizzes.
            </p>
          </div>
          <button
            onClick={() => setIsModuleModalOpen(true)}
            className="px-5 py-2.5 bg-primary-main text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Module</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod, modIdx) => {
            const isExpanded = Boolean(expandedModules[mod._id]);
            const isGeneratingQuiz = generatingQuizModuleId === mod._id;
            const lessonsList = mod.lessons || [];

            return (
              <div
                key={mod._id}
                className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden transition-all"
              >
                {/* Module Header Bar */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100">
                  <div
                    onClick={() => toggleModuleExpand(mod._id)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-main font-black text-xs flex items-center justify-center shrink-0">
                      {modIdx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <span>{mod.title}</span>
                        <span className="text-xs text-gray-400 font-normal">
                          ({lessonsList.length} {lessonsList.length === 1 ? 'lesson' : 'lessons'})
                        </span>
                      </h3>
                      {mod.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{mod.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenAiQuizModal(mod)}
                      disabled={isGeneratingQuiz}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                      title="Configure topic & generate AI Quiz Questions for this module"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{isGeneratingQuiz ? 'Generating AI Quiz...' : '+ AI Quiz'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenAddLesson(mod._id)}
                      className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-main font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Lesson</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModule(mod)}
                      className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Edit Module"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteModule(mod._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => toggleModuleExpand(mod._id)}
                      className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Lessons Body */}
                {isExpanded && (
                  <div className="p-5 space-y-3 bg-gray-50/50">
                    {lessonsList.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                        No lessons in this module yet. Click "+ Add Lesson" above to add videos or reading materials.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {lessonsList.map((les, lesIdx) => (
                          <div
                            key={les._id || lesIdx}
                            className="p-4 bg-white rounded-xl border border-gray-200/80 flex items-center justify-between gap-4 hover:border-primary-200 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg shrink-0">
                                {les.type === 'video' ? (
                                  <Video className="h-4 w-4 text-primary-main" />
                                ) : les.type === 'quiz' ? (
                                  <HelpCircle className="h-4 w-4 text-indigo-600" />
                                ) : (
                                  <FileText className="h-4 w-4 text-emerald-600" />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                                    {lesIdx + 1}. {les.title}
                                  </h4>
                                  {les.isFreePreview && (
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md">
                                      Free Preview
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                                  <span className="capitalize">{les.type}</span>
                                  <span>• {les.duration || 10} mins</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenEditLesson(mod._id, les)}
                                className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                                title="Edit Lesson"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(mod._id, les._id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Lesson"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Module Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {editingModuleId ? 'Edit Module' : 'Add New Module'}
              </h3>
              <button onClick={() => setIsModuleModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-gray-700">Module Title *</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Module 1: Foundations & Setup"
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={moduleDescription}
                  onChange={(e) => setModuleDescription(e.target.value)}
                  placeholder="Overview of what students will learn in this module..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">
                {editingLessonId ? 'Edit Lesson' : 'Add Lesson to Module'}
              </h3>
              <button onClick={() => setIsLessonModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-gray-700">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Introduction to Async Flow"
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">Type</label>
                  <select
                    value={lessonType}
                    onChange={(e) => setLessonType(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="video">Video Lecture</option>
                    <option value="text">Reading / Article</option>
                    <option value="quiz">Assessment Quiz</option>
                    <option value="coding">Coding Challenge / Exercise</option>
                    <option value="pdf">PDF Document / External Resource</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">Duration (Mins)</label>
                  <input
                    type="number"
                    min={1}
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              {lessonType === 'video' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">Video URL (YouTube / Vimeo / MP4)</label>
                  <input
                    type="url"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                  />
                </div>
              )}

              {lessonType === 'coding' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">Starter Code Template</label>
                  <textarea
                    rows={3}
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    placeholder="// Write starter function signature here&#10;function solution() {&#10;  return true;&#10;}"
                    className="w-full p-3 bg-gray-900 text-emerald-400 border border-gray-800 rounded-xl text-xs font-mono outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-gray-700">Lesson Content / Notes</label>
                <textarea
                  rows={4}
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  placeholder="Lesson notes, code examples, markdown or quiz data..."
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main resize-y font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="free-preview-checkbox"
                  checked={isFreePreview}
                  onChange={(e) => setIsFreePreview(e.target.checked)}
                  className="w-4 h-4 text-primary-main rounded border-gray-300"
                />
                <label htmlFor="free-preview-checkbox" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Allow Free Preview (Students can view before enrolling)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Quiz Prompt Setup Modal */}
      {isAiQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <span>Generate AI Quiz Questions</span>
              </h3>
              <button onClick={() => setIsAiQuizModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateAIQuizForModule} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-gray-700">Topic / Subject Focus *</label>
                <input
                  type="text"
                  required
                  value={aiQuizTopic}
                  onChange={(e) => setAiQuizTopic(e.target.value)}
                  placeholder="e.g. React Hooks & State Lifecycle"
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">Difficulty</label>
                  <select
                    value={aiQuizDifficulty}
                    onChange={(e) => setAiQuizDifficulty(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-gray-700">Questions Count</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={aiQuizCount}
                    onChange={(e) => setAiQuizCount(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAiQuizModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingQuizModuleId !== null}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{generatingQuizModuleId !== null ? 'Generating Quiz...' : 'Generate & Add Quiz'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
