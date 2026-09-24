import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { BookOpen, CheckCircle, Clock, Star, User, Play, FileText, Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axiosClient.get(`/courses/detail/${slug}`);
        const courseData = res.data?.data?.course;
        setCourse(courseData);

        if (isAuthenticated && user?.role === 'student' && courseData?._id) {
          try {
            const myRes = await axiosClient.get('/enrollments/my');
            const myCourses = myRes.data?.data?.enrollments || [];
            const enrolled = myCourses.some((e) => e.course?._id === courseData._id);
            setIsEnrolled(enrolled);
          } catch (enrollErr) {
            console.warn('Could not verify enrollment status:', enrollErr);
          }
        }
      } catch (err) {
        console.error('Course details fetch error:', err);
        toast.error(err.response?.data?.message || 'Could not load course details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDetails();
    }
  }, [slug, isAuthenticated, user]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to enroll in this course.');
      navigate('/login');
      return;
    }

    try {
      await axiosClient.post('/enrollments', { courseId: course._id });
      toast.success('Successfully enrolled in course!');
      setIsEnrolled(true);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading course...</div>;
  if (!course) return <div className="p-8 text-center text-gray-500">Course not found.</div>;

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="card-paper bg-gradient-to-r from-[#1C252E] to-[#141A21] text-white p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-soft-info">{course.category?.name || 'Web Dev'}</span>
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">• {course.level}</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white leading-tight">{course.title}</h1>
        <p className="text-base text-gray-300 max-w-3xl leading-relaxed">{course.shortDescription || course.description}</p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 pt-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary-main" />
            <span>Created by <strong className="text-white">{course.instructor?.firstName} {course.instructor?.lastName}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Star className="h-4 w-4 fill-amber-400" />
            <span>
              {course.averageRating > 0
                ? `${course.averageRating.toFixed(1)} (${course.totalRatings || 0} ratings)`
                : 'New (No ratings yet)'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{course.estimatedDuration || 20} hours</span>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
          {isEnrolled ? (
            <Link to={`/learn/${course._id}`} className="btn-primary flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Start Learning & Study Now</span>
            </Link>
          ) : (
            <button onClick={handleEnroll} className="btn-primary text-base px-6 py-3 flex items-center gap-2">
              <span>Enroll Now — FREE</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2/3: Learning Objectives & Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          {/* Learning Objectives */}
          <div className="card-paper space-y-4">
            <h3 className="text-lg font-bold text-gray-900">What You'll Learn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(course.learningObjectives || []).map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-primary-main shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus Modules */}
          <div className="card-paper space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Course Syllabus & Curriculum</h3>
            <div className="space-y-4">
              {(course.syllabus || []).map((mod, idx) => (
                <div key={mod._id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-100 p-4 flex justify-between items-center">
                    <h4 className="font-bold text-gray-900 text-sm">{mod.title}</h4>
                    <span className="text-xs text-gray-500 font-semibold">{mod.lessons?.length || 0} Lessons</span>
                  </div>
                  <div className="divide-y divide-gray-100 bg-white">
                    {(mod.lessons || []).map((lesson) => (
                      <div key={lesson._id} className="p-3.5 flex items-center justify-between text-sm hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          {lesson.type === 'video' ? <Play className="h-4 w-4 text-primary-main" /> : <FileText className="h-4 w-4 text-info-main" />}
                          <span className="font-medium text-gray-800">{lesson.title}</span>
                          {lesson.isPreview && <span className="badge-soft-success text-[10px]">Free Preview</span>}
                        </div>
                        <span className="text-xs text-gray-400">{lesson.duration || 10}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1/3: Instructor & Features Sidebar */}
        <div className="space-y-6">
          <div className="card-paper space-y-4">
            <h4 className="font-bold text-gray-900 text-base">Course Includes</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-primary-main" /> 100% Free Lifetime Access</li>
              <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-primary-main" /> Verifiable Completion Certificate with QR</li>
              <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-primary-main" /> AI Tutor Chat Assistant</li>
              <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-primary-main" /> Interactive Quizzes & Projects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
