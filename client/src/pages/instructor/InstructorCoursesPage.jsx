import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Search, Filter, Trash2, Eye, Edit3, Sparkles, CheckCircle2, X } from 'lucide-react';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, draft, published, archived

  // New Course Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('beginner');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  useEffect(() => {
    fetchCoursesAndCategories();
  }, []);

  const fetchCoursesAndCategories = async () => {
    setLoading(true);
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        axiosClient.get('/courses/instructor/my-courses'),
        axiosClient.get('/categories')
      ]);
      setCourses(coursesRes.data?.data?.courses || []);
      const cats = categoriesRes.data?.data?.categories || [];
      setCategories(cats);
      if (cats.length > 0) setCategory(cats[0]._id);
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch instructor courses');
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

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this draft course?')) return;
    try {
      await axiosClient.delete(`/courses/${courseId}`);
      toast.success('Course deleted');
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Course deletion failed');
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Banner Header */}
      <div className="card-paper bg-gradient-to-r from-[#1C252E] via-[#16202A] to-[#0D131A] text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-gray-800">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Course Management Studio</h1>
          <p className="text-sm text-gray-300 mt-1">Manage authored courses, draft curriculum, and publish live content.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-primary-main/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search authored courses..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-primary-main/20 outline-none"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['all', 'draft', 'submitted', 'changes_requested', 'rejected', 'published'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                statusFilter === st ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="card-paper p-12 text-center text-gray-400 bg-white border border-gray-200/80 rounded-2xl">
          Loading your authored courses...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="card-paper p-12 text-center space-y-4 bg-white border border-gray-200/80 rounded-2xl shadow-xs">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-800">No Authored Courses Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {search || statusFilter !== 'all'
                ? 'No courses match your current search or status filter.'
                : 'You have not created any courses yet. Click "Create New Course" to get started.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'}
                  alt={course.title}
                  className="h-16 w-24 object-cover rounded-xl shrink-0 border border-gray-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600';
                  }}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">{course.title}</h3>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                      course.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : course.status === 'submitted' || course.status === 'under_review'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : course.status === 'changes_requested'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : course.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      ● {course.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{course.category?.name || 'Computer Science'}</span>
                    <span>• {course.enrollmentCount || 0} Students Enrolled</span>
                    <span>• Level: {course.level}</span>
                  </div>
                  {course.reviewNotes && ['changes_requested', 'rejected'].includes(course.status) && (
                    <p className="text-xs italic text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 inline-block mt-0.5">
                      Reviewer Feedback: "{course.reviewNotes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/instructor/course/${course._id}/studio`}
                  className="px-4 py-2 bg-primary-main hover:bg-primary-dark text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Curriculum Studio</span>
                </Link>

                <Link
                  to={`/course/${course.slug || course._id}`}
                  target="_blank"
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                >
                  <Eye className="h-3.5 w-3.5 text-gray-500" />
                  <span>View Landing</span>
                </Link>

                {['draft', 'rejected'].includes(course.status) && (
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Create New Course</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Full-Stack React & Node.js Architecture"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm outline-none focus:border-primary-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Difficulty Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="e.g. https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm outline-none focus:border-primary-main"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive course overview and key topics covered..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs outline-none focus:border-primary-main resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-primary-main text-white font-bold rounded-xl text-xs shadow-md">
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
