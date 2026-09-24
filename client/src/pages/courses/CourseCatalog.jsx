import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import { Search, Filter, BookOpen, Star, Clock, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CourseCatalog() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== search) {
      setSearch(q);
    }
  }, [searchParams]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const reqs = [
          axiosClient.get('/courses', {
            params: { search, category: selectedCategory, level: selectedLevel }
          }),
          axiosClient.get('/categories')
        ];

        if (isAuthenticated) {
          reqs.push(axiosClient.get('/enrollments/my'));
        }

        const resResults = await Promise.all(reqs);
        setCourses(resResults[0].data?.data?.courses || []);
        setCategories(resResults[1].data?.data?.categories || []);

        if (isAuthenticated && resResults[2]) {
          const myEnrollments = resResults[2].data?.data?.enrollments || [];
          const ids = myEnrollments.map((e) => e.course?._id || e.course);
          setEnrolledCourseIds(ids);
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [search, selectedCategory, selectedLevel, isAuthenticated]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Explore Free Courses</h1>
        <p className="text-sm text-gray-500">Master Web Development, Data Structures, Algorithms, DBMS, and CS fundamentals.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="card-paper flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by keyword, topic, or tech..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-primary-main/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-700 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-700 outline-none"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="card-paper text-center py-12 space-y-3">
          <BookOpen className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">No courses found matching your criteria.</h3>
          <button onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedLevel(''); }} className="btn-primary text-xs">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="card-paper flex flex-col justify-between hover:shadow-dropdown transition space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'}
                    alt={course.title}
                    className="h-44 w-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600';
                    }}
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-primary-dark">
                    FREE
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="badge-soft-info">{course.category?.name || 'Computer Science'}</span>
                  <span className="capitalize text-gray-500 font-medium">{course.level}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{course.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{course.shortDescription || course.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{course.averageRating > 0 ? course.averageRating.toFixed(1) : 'New'}</span>
                  </div>
                </div>

                {enrolledCourseIds.includes(course._id) ? (
                  <Link
                    to={`/learn/${course._id}`}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-success-main text-white hover:bg-success-dark transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Go to Course Page</span>
                  </Link>
                ) : (
                  <Link
                    to={`/course/${course.slug || course._id}`}
                    className="w-full btn-primary text-center text-xs flex items-center justify-center gap-1.5 py-2.5"
                  >
                    <span>View Course Details</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
