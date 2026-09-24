import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { BookOpen, CheckCircle, Clock, ArrowRight, Star } from 'lucide-react';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await axiosClient.get('/enrollments/my');
      setEnrollments(res.data?.data?.enrollments || []);
    } catch (err) {
      console.error('Error loading enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl space-y-2 shadow-soft border border-[#06452C]">
        <h1 className="text-3xl font-black text-white tracking-tight">My Enrolled Courses</h1>
        <p className="text-xs font-medium text-[#DDF1E5]">Track your progress and continue learning your active courses.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading enrolled courses...</div>
      ) : enrollments.length === 0 ? (
        <div className="card-paper text-center py-12 space-y-4">
          <BookOpen className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">No Enrolled Courses Found</h3>
          <p className="text-xs text-gray-500">Explore our free course catalog and enroll to start learning.</p>
          <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
            <span>Browse Free Courses</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((item) => {
            const course = item.course;
            if (!course) return null;
            const progress = item.progress || { overallProgress: 0, masteryScore: 0 };
            const isCompleted = item.status === 'completed' || progress.overallProgress >= 100;

            return (
              <div key={item._id} className="card-paper flex flex-col justify-between hover:shadow-dropdown transition space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'}
                      alt={course.title}
                      className="h-40 w-full object-cover rounded-xl"
                    />
                    {isCompleted && (
                      <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-md">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>COMPLETED</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="badge-soft-info">{course.category?.name || 'Web Dev'}</span>
                    <span className="text-gray-500 font-semibold capitalize">{course.level}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{course.title}</h3>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500">Overall Progress</span>
                    <span className={`font-bold ${isCompleted ? 'text-emerald-600' : 'text-primary-main'}`}>
                      {progress.overallProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-primary-main'}`}
                      style={{ width: `${progress.overallProgress}%` }}
                    ></div>
                  </div>
                  <Link
                    to={`/learn/${course._id}`}
                    className={`w-full text-center text-xs flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold transition shadow-xs ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'btn-primary'
                    }`}
                  >
                    <span>{isCompleted ? 'Review Finished Course' : 'Continue Learning'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
