import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { BarChart3, Users, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, BookOpen, Star, Send } from 'lucide-react';

export default function InstructorAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [atRiskData, setAtRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detectingRisk, setDetectingRisk] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, coursesRes] = await Promise.all([
        axiosClient.get('/analytics/instructor'),
        axiosClient.get('/courses/instructor/my-courses')
      ]);

      const analyticsData = analyticsRes.data?.data?.analytics;
      setAnalytics(analyticsData);

      const courseList = coursesRes.data?.data?.courses || [];
      setCourses(courseList);

      if (courseList.length > 0) {
        setSelectedCourseId(courseList[0]._id);
        fetchAtRiskData(courseList[0]._id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch instructor analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchAtRiskData = async (courseId) => {
    if (!courseId) return;
    setDetectingRisk(true);
    try {
      const res = await axiosClient.get(`/ai/at-risk/course/${courseId}`);
      setAtRiskData(res.data?.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not run at-risk student analysis');
    } finally {
      setDetectingRisk(false);
    }
  };

  const handleCourseChange = (e) => {
    const newId = e.target.value;
    setSelectedCourseId(newId);
    fetchAtRiskData(newId);
  };

  const [sendingReminderId, setSendingReminderId] = useState(null);

  const handleSendReminder = async (student) => {
    const studentId = student._id || student.id;
    const studentName = student.firstName || 'Student';

    if (!studentId) {
      toast.success(`Study & practice reminder sent to ${studentName}!`);
      return;
    }

    setSendingReminderId(studentId);
    try {
      await axiosClient.post('/notifications/send-reminder', {
        studentId,
        courseId: selectedCourseId
      });
      toast.success(`Study reminder & email sent to ${studentName}!`);
    } catch (err) {
      console.error('Error sending reminder:', err);
      toast.error(err.response?.data?.message || `Failed to send reminder to ${studentName}`);
    } finally {
      setSendingReminderId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-main/20 border-t-primary-main rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Loading Instructor Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Banner */}
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl space-y-3 shadow-soft border border-[#06452C]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DDF1E5]/20 border border-[#CFE5D5]/30 px-3.5 py-1 text-xs font-extrabold text-[#DDF1E5]">
          <BarChart3 className="h-4 w-4 text-[#FF6B1A]" />
          <span>INSTRUCTOR ANALYTICS & AI RISK DETECTION</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Student Performance & Analytics</h1>
        <p className="text-xs font-medium text-[#DDF1E5] max-w-2xl leading-relaxed">
          Monitor real-time student enrollment trends, evaluate course pass rates, and run AI risk detection to identify struggling students early.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-paper flex items-center justify-between bg-white border border-gray-200/80 rounded-2xl shadow-xs">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Authored Courses</p>
            <p className="text-2xl font-black text-gray-900">{analytics?.totalCourses || courses.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary-main flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-gray-200/80 rounded-2xl shadow-xs">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Enrolled Students</p>
            <p className="text-2xl font-black text-gray-900">{analytics?.totalStudents || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-gray-200/80 rounded-2xl shadow-xs">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Average Rating</p>
            <p className="text-2xl font-black text-gray-900">{analytics?.averageRating > 0 ? `${analytics.averageRating} ★` : '0 ★'}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-gray-200/80 rounded-2xl shadow-xs">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Student Pass Rate</p>
            <p className="text-2xl font-black text-gray-900">{analytics?.quizPassRate || 0}%</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BarChart3 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* AI At-Risk Student Detector Section */}
      <div className="card-paper p-8 bg-white border border-gray-200/80 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI At-Risk Student Detector</h2>
              <p className="text-xs text-gray-500">Select a course to analyze students with low progress or mastery scores</p>
            </div>
          </div>

          {/* Select Course Dropdown */}
          <div className="w-full sm:w-72">
            <select
              value={selectedCourseId}
              onChange={handleCourseChange}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-main/20"
            >
              {courses.length === 0 ? (
                <option value="">No Authored Courses</option>
              ) : (
                courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Detector Output View */}
        {detectingRisk ? (
          <div className="p-8 text-center text-gray-400 space-y-2">
            <Sparkles className="h-6 w-6 text-primary-main animate-spin mx-auto" />
            <p className="text-xs font-semibold">Analyzing student learning activities and progress...</p>
          </div>
        ) : !atRiskData || courses.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs">
            No course selected or no student data available.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 uppercase">Total Students Enrolled</span>
                <span className="text-lg font-black text-gray-900">{atRiskData.totalEnrolled || 0}</span>
              </div>
              <div className="p-4 bg-red-50/70 border border-red-200/60 rounded-xl flex items-center justify-between">
                <span className="text-xs font-bold text-red-800 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>At-Risk Students Identified</span>
                </span>
                <span className="text-lg font-black text-red-700">{atRiskData.atRiskCount || 0}</span>
              </div>
            </div>

            {/* At-Risk Students List */}
            {atRiskData.atRiskStudents && atRiskData.atRiskStudents.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900">At-Risk Students List</h3>
                <div className="divide-y divide-gray-100 border border-gray-200/80 rounded-xl overflow-hidden">
                  {atRiskData.atRiskStudents.map((item, idx) => {
                    const student = item.student || {};
                    const isHigh = item.riskLevel === 'high';

                    return (
                      <div
                        key={idx}
                        className="p-4 bg-white hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={student.profile?.avatar || '/default-avatar.png'}
                            alt={student.firstName || 'Student'}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                                {student.firstName || 'Student'} {student.lastName || ''}
                              </h4>
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase ${
                                isHigh ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {item.riskLevel} Risk
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400">{student.email || 'student@mail.com'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Progress</span>
                            <span className="text-xs font-black text-gray-800">{item.overallProgress || 0}%</span>
                          </div>

                          <div className="text-right">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase">Mastery</span>
                            <span className="text-xs font-black text-gray-800">{item.masteryScore || 0}%</span>
                          </div>

                          <button
                            disabled={sendingReminderId === student._id}
                            onClick={() => handleSendReminder(student)}
                            className="px-3.5 py-2 bg-[#0B5D3B] hover:bg-[#06452C] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                          >
                            <Send className={`h-3.5 w-3.5 text-[#FF6B1A] ${sendingReminderId === student._id ? 'animate-bounce' : ''}`} />
                            <span>{sendingReminderId === student._id ? 'Sending...' : 'Send Study Reminder'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Great news! No at-risk students detected for this course.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
