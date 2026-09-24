import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { FileCheck, Search, Eye, CheckCircle2, AlertCircle, Clock, MessageSquare, X } from 'lucide-react';

export default function ReviewQueuePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Review Modal State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/courses/reviewer/queue');
      setCourses(res.data?.data?.courses || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch review queue');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setSubmitting(true);
    try {
      const res = await axiosClient.put(`/courses/${selectedCourse._id}/review`, {
        status: reviewStatus,
        reviewNotes
      });
      toast.success(`Course status updated to '${reviewStatus}'!`);
      setCourses((prev) =>
        prev.map((c) => (c._id === selectedCourse._id ? res.data?.data?.course : c))
      );
      setSelectedCourse(null);
      setReviewNotes('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update review status');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl shadow-soft border border-[#06452C] space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#DDF1E5]/20 rounded-xl text-[#DDF1E5]">
            <FileCheck className="h-6 w-6 text-[#FF6B1A]" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Curriculum Review Queue</h1>
        </div>
        <p className="text-xs font-medium text-[#DDF1E5]">
          Evaluate submitted courses, audit syllabus quality, provide feedback, and approve content for student publishing.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search submitted courses..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-primary-main/20 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['all', 'submitted', 'under_review', 'changes_requested', 'rejected', 'published'].map((st) => (
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

      {/* Queue List */}
      {loading ? (
        <div className="card-paper p-12 text-center text-gray-400 bg-white border border-gray-200/80 rounded-2xl">
          Loading review queue...
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="card-paper p-12 text-center space-y-4 bg-white border border-gray-200/80 rounded-2xl shadow-xs">
          <FileCheck className="h-12 w-12 text-gray-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-800">No Courses Pending Review</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {search || statusFilter !== 'all'
                ? 'No courses match your current search or status filter.'
                : 'All instructor submissions have been evaluated.'}
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
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                        course.status === 'published' || course.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : course.status === 'submitted'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : course.status === 'under_review'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : course.status === 'changes_requested'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : course.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      ● {course.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#66736C]">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={course.instructor?.profile?.avatar || '/default-avatar.png'}
                        alt={course.instructor?.firstName || 'Instructor'}
                        className="w-5 h-5 rounded-full object-cover border border-[#CFE5D5]"
                      />
                      <span>Instructor: <strong>{course.instructor?.firstName} {course.instructor?.lastName}</strong> ({course.instructor?.email})</span>
                    </div>
                    <span>• Category: {course.category?.name || 'Computer Science'}</span>
                    <span>• Level: {course.level}</span>
                  </div>
                  {course.reviewNotes && (
                    <p className="text-xs italic text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 mt-1">
                      Reviewer Note: "{course.reviewNotes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/course/${course.slug || course._id}`}
                  target="_blank"
                  className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1 font-bold"
                >
                  <Eye className="h-3.5 w-3.5 text-[#66736C]" />
                  <span>Inspect Landing</span>
                </Link>

                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setReviewStatus(course.status === 'submitted' ? 'approved' : course.status);
                    setReviewNotes(course.reviewNotes || '');
                  }}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-extrabold shadow-2xs"
                >
                  <FileCheck className="h-3.5 w-3.5 text-[#FF6B1A]" />
                  <span>Review Content</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Curriculum Review & Audit</h3>
              <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500 uppercase font-bold">Course Title</p>
                <p className="text-base font-extrabold text-gray-900">{selectedCourse.title}</p>
                <p className="text-xs text-gray-500">Author: {selectedCourse.instructor?.firstName} {selectedCourse.instructor?.lastName}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">Set Review Decision *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'approved', label: 'Approve & Make Live', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
                    { id: 'changes_requested', label: 'Request Changes', color: 'border-amber-500 text-amber-700 bg-amber-50' },
                    { id: 'rejected', label: 'Reject Course', color: 'border-rose-500 text-rose-700 bg-rose-50' },
                    { id: 'under_review', label: 'Under Audit', color: 'border-blue-500 text-blue-700 bg-blue-50' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setReviewStatus(st.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${
                        reviewStatus === st.id ? `${st.color} shadow-sm ring-2 ring-primary-main/20` : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Feedback & Review Notes</label>
                <textarea
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Provide detailed constructive feedback or approval notes for the instructor..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs outline-none focus:border-primary-main resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setSelectedCourse(null)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary-main text-white font-bold rounded-xl text-xs shadow-md">
                  {submitting ? 'Updating...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
