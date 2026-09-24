import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { BookOpen, Users, Star, BarChart3, Plus, Sparkles, X, Trash2, ShieldAlert, ArrowRight } from 'lucide-react';

export default function InstructorDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Course Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('beginner');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const fetchInstructorData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, coursesRes, categoriesRes] = await Promise.all([
        axiosClient.get('/analytics/instructor'),
        axiosClient.get('/courses/instructor/my-courses'),
        axiosClient.get('/categories')
      ]);
      setAnalytics(analyticsRes.data?.data?.analytics);
      setCourses(coursesRes.data?.data?.courses || []);
      setCategories(categoriesRes.data?.data?.categories || []);
      if (categoriesRes.data?.data?.categories?.length > 0) {
        setCategory(categoriesRes.data.data.categories[0]._id);
      }
    } catch (err) {
      console.error('Error fetching instructor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category) return;

    try {
      const res = await axiosClient.post('/courses', {
        title,
        category,
        level,
        description,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
        learningObjectives: ['Master core concepts', 'Build real hands-on projects']
      });
      toast.success('Course created as draft!');
      setCourses([res.data?.data?.course, ...courses]);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleSubmitForReview = async (courseId) => {
    try {
      await axiosClient.put(`/courses/${courseId}/submit`);
      toast.success('Course submitted to Content Reviewers for evaluation!');
      fetchInstructorData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit course for review. Make sure modules & lessons exist.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await axiosClient.delete(`/courses/${courseId}`);
      toast.success('Course deleted');
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      toast.error('Course deletion failed');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Banner */}
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl space-y-3 shadow-soft border border-[#06452C] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="badge-mint text-[10px] font-black uppercase tracking-wider">TEACHER & INSTRUCTOR STUDIO</span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">Instructor Authoring Studio</h1>
          <p className="text-xs font-medium text-[#DDF1E5]">
            Overview of your authored courses, student enrollments, quiz generation, and real-time pass rate metrics.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-orange text-xs py-3 px-6 flex items-center gap-2 font-black shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Authored Courses</p>
            <p className="text-2xl font-black text-[#13201A] mt-1">{analytics ? analytics.totalCourses : courses.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center font-bold">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Enrolled Students</p>
            <p className="text-2xl font-black text-[#13201A] mt-1">{analytics ? analytics.totalStudents : 0}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Average Rating</p>
            <p className="text-2xl font-black text-[#13201A] mt-1">{analytics && analytics.averageRating > 0 ? `${analytics.averageRating} ★` : '0 ★'}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#FFE4D2] text-[#FF6B1A] flex items-center justify-center font-bold">
            <Star className="h-6 w-6 fill-[#FF6B1A]" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Quiz Pass Rate</p>
            <p className="text-2xl font-black text-[#0B5D3B] mt-1">{analytics ? `${analytics.quizPassRate}%` : '0%'}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center font-bold">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* AI At-Risk Student Detector Quick Section */}
      <div className="card-paper p-6 bg-white border border-[#E2E5DF] rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#13201A] text-base">AI At-Risk Student Detector</h3>
            <p className="text-xs text-[#66736C] font-semibold mt-0.5">
              Analyze student mastery scores, flag struggling learners early, and send automated study reminders.
            </p>
          </div>
        </div>
        <Link
          to="/instructor/analytics"
          className="btn-primary text-xs py-2.5 px-5 font-extrabold shrink-0 flex items-center gap-2"
        >
          <span>Open Risk Analytics</span>
          <ArrowRight className="h-4 w-4 text-[#FF6B1A]" />
        </Link>
      </div>

      {/* Courses List */}
      <div className="card-paper p-6 bg-white border border-[#E2E5DF] rounded-3xl space-y-4 shadow-soft">
        <h3 className="font-black text-[#13201A] text-lg">My Authored Courses ({courses.length})</h3>

        {loading ? (
          <div className="p-8 text-center text-[#66736C] text-xs">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="py-8 text-center text-[#66736C]">
            <BookOpen className="h-10 w-10 mx-auto text-[#9BA29B] mb-2" />
            <p className="font-bold text-sm text-[#13201A]">No authored courses found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E5DF]">
            {courses.map((course) => (
              <div key={course._id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'}
                    alt={course.title}
                    className="h-14 w-20 object-cover rounded-xl shrink-0 border border-[#E2E5DF]"
                  />
                  <div>
                    <h4 className="font-extrabold text-[#13201A] text-base">{course.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-[#66736C] mt-0.5 font-semibold">
                      <span className="badge-mint capitalize">{course.status}</span>
                      <span>{course.enrollmentCount || 0} Students</span>
                      <span>★ {course.averageRating > 0 ? course.averageRating.toFixed(1) : 'New'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {course.status === 'draft' && (
                    <button
                      onClick={() => handleSubmitForReview(course._id)}
                      className="btn-orange text-xs py-2 px-3 flex items-center gap-1 font-bold shadow-2xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Submit for Review</span>
                    </button>
                  )}
                  <Link to={`/instructor/course/${course._id}/studio`} className="btn-primary text-xs py-2 px-4 flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Curriculum Studio</span>
                  </Link>
                  <Link to={`/course/${course.slug || course._id}`} className="btn-secondary text-xs py-2 px-4">
                    View Landing
                  </Link>
                  <button onClick={() => handleDeleteCourse(course._id)} className="text-[#66736C] hover:text-red-600 p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Creating Course */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#13201A]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg card-paper space-y-4 bg-white p-6 rounded-2xl shadow-dialog border border-[#E2E5DF]">
            <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-3">
              <h3 className="font-extrabold text-[#13201A] text-base">Create New Course</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#66736C] hover:text-[#13201A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#13201A] mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Full-Stack React & Node.js"
                  className="w-full rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] p-2.5 text-xs outline-none focus:border-[#0B5D3B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13201A] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] p-2.5 text-xs outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#13201A] mb-1">Difficulty Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] p-2.5 text-xs outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#13201A] mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] p-2.5 text-xs outline-none focus:border-[#0B5D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#13201A] mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive course overview and topics covered..."
                  className="w-full rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] p-3 text-xs outline-none focus:border-[#0B5D3B]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E5DF]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-2 px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-6">
                  Save Draft Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
