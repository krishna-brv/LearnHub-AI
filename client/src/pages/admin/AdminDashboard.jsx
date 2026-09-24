import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Users, BookOpen, Shield, Search, CheckCircle, XCircle, Trash2, UserCheck, Award } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseMentorMap, setCourseMentorMap] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Assign Student-Mentor Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [search, roleFilter]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, analyticsRes, coursesRes, assignmentsRes] = await Promise.all([
        axiosClient.get('/users', { params: { search, role: roleFilter } }),
        axiosClient.get('/analytics/admin').catch(() => ({ data: { data: { analytics: null } } })),
        axiosClient.get('/courses', { params: { status: 'all', limit: 100 } }),
        axiosClient.get('/mentors/course-assignments').catch(() => ({ data: { data: { assignments: [] } } }))
      ]);

      setUsers(usersRes.data?.data?.users || []);
      setAnalytics(analyticsRes.data?.data?.analytics);
      setCourses(coursesRes.data?.data?.courses || []);

      // Build map of courseId -> mentorId
      const map = {};
      const assignments = assignmentsRes.data?.data?.assignments || [];
      assignments.forEach((a) => {
        if (a.course && a.mentor) {
          const cId = typeof a.course === 'object' ? a.course._id : a.course;
          const mId = typeof a.mentor === 'object' ? a.mentor._id : a.mentor;
          map[cId] = mId;
        }
      });
      setCourseMentorMap(map);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      toast.error('Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Assign or Update Course Mentor directly from Course List
  const handleAssignCourseMentor = async (courseId, mentorId) => {
    try {
      await axiosClient.post('/mentors/assign', {
        courseId,
        mentorId: mentorId || null
      });
      
      setCourseMentorMap((prev) => ({
        ...prev,
        [courseId]: mentorId
      }));

      const mentorObj = users.find((u) => u._id === mentorId);
      const mentorName = mentorObj ? `${mentorObj.firstName} ${mentorObj.lastName}` : 'None';
      toast.success(mentorId ? `Assigned ${mentorName} as course mentor!` : 'Removed mentor assignment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign mentor to course');
    }
  };

  // Direct Student-Mentor Assign Modal Submit
  const handleAssignStudentMentor = async (e) => {
    e.preventDefault();
    if (!selectedMentorId || !selectedStudentId) return;

    try {
      await axiosClient.post('/mentors/assign', {
        mentorId: selectedMentorId,
        studentId: selectedStudentId
      });
      toast.success('Mentor assigned to student successfully!');
      setIsAssignModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign mentor');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await axiosClient.put(`/users/${userId}/status`, { isActive: !currentStatus });
      toast.success(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosClient.put(`/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      toast.error('Role update failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await axiosClient.delete(`/users/${userId}`);
      toast.success('User account deleted');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      toast.error('Delete user failed');
    }
  };

  const mentorsList = users.filter((u) => u.role === 'mentor' || u.role === 'admin');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl space-y-2 shadow-soft border border-[#06452C]">
        <span className="badge-mint text-[10px] font-black uppercase tracking-wider">PLATFORM ADMINISTRATION</span>
        <h1 className="text-3xl font-black text-white tracking-tight mt-1">Platform Administration & Analytics</h1>
        <p className="text-xs font-medium text-[#DDF1E5]">
          Manage courses, assign course mentors, control user accounts, and monitor platform activity.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Registered Users</p>
            <p className="text-2xl font-black text-[#13201A] mt-1">{analytics?.overview?.totalUsers || users.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center font-bold">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Total Platform Courses</p>
            <p className="text-2xl font-black text-[#13201A] mt-1">{courses.length || analytics?.overview?.totalCourses || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Active Enrollments</p>
            <p className="text-2xl font-black text-[#0B5D3B] mt-1">{analytics?.overview?.totalEnrollments || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center font-bold">
            <Shield className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: COURSE & MENTOR ASSIGNMENT (ADMIN VIEW) */}
      {/* ======================================================== */}
      <div className="card-paper space-y-4 border-2 border-primary-main/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-gray-900 text-xl flex items-center gap-2">
              <Award className="h-6 w-6 text-primary-main" />
              <span>Course & Mentor Management</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select a dedicated mentor for each course. All enrolled students will automatically report to and schedule 1-on-1 sessions with the assigned course mentor.
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No courses found on the platform.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                  <th className="p-3">Course Title</th>
                  <th className="p-3">Instructor</th>
                  <th className="p-3">Category / Level</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assigned Mentor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => {
                  const currentMentorId = courseMentorMap[course._id] || '';
                  const instructorName = course.instructor
                    ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`
                    : 'Instructor';

                  return (
                    <tr key={course._id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3 font-bold text-gray-900 flex items-center gap-3">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <BookOpen className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900">{course.title}</div>
                          <div className="text-xs text-gray-400">{course.totalLessons || 0} Lessons</div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-700 font-medium">{instructorName}</td>
                      <td className="p-3 text-xs text-gray-600">
                        <div className="font-semibold text-gray-800">{course.category?.name || 'General'}</div>
                        <div className="capitalize text-gray-400">{course.level || 'Beginner'}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            course.status === 'published'
                              ? 'bg-success-light/40 text-success-dark'
                              : 'bg-warning-light/40 text-warning-dark'
                          }`}
                        >
                          {course.status || 'Draft'}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={currentMentorId}
                          onChange={(e) => handleAssignCourseMentor(course._id, e.target.value)}
                          className={`w-full max-w-xs rounded-xl border p-2 text-xs font-bold transition outline-none shadow-xs ${
                            currentMentorId
                              ? 'border-primary-main bg-primary-lighter/20 text-primary-dark font-extrabold'
                              : 'border-gray-300 bg-gray-50 text-gray-600'
                          }`}
                        >
                          <option value="">-- No Mentor Assigned --</option>
                          {mentorsList.map((m) => (
                            <option key={m._id} value={m._id}>
                              👤 {m.firstName} {m.lastName} ({m.role})
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: USER ACCOUNT CONTROL */}
      {/* ======================================================== */}
      <div className="card-paper space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-gray-700" />
              <span>User Account Control</span>
            </h3>
            <button
              onClick={() => {
                setSelectedMentorId('');
                setSelectedStudentId('');
                setIsAssignModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Users className="h-4 w-4" />
              <span>Direct 1-on-1 Student Pairing</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl bg-gray-100 py-2 pl-9 pr-4 text-sm text-gray-800 outline-none"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-gray-200 py-2 px-3 text-sm text-gray-700 outline-none"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="reviewer">Reviewer</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="rounded-lg border border-gray-200 py-1 px-2 text-xs font-bold capitalize outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="reviewer">Reviewer</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    {u.isActive ? (
                      <span className="badge-soft-success flex items-center gap-1 w-fit">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="badge-soft-error flex items-center gap-1 w-fit">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleStatusToggle(u._id, u.isActive)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                        u.isActive
                          ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          : 'border-success-dark text-success-dark hover:bg-success-light/30'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="text-xs font-bold px-2 py-1.5 rounded-lg text-error-main hover:bg-error-light/30"
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Direct Student-Mentor Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md card-paper bg-white p-6 space-y-4 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base">Direct 1-on-1 Student Pairing</h3>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignStudentMentor} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Select Mentor</label>
                <select
                  required
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium text-gray-800"
                >
                  <option value="">-- Choose Mentor --</option>
                  {mentorsList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.firstName} {m.lastName} ({m.email}) [{m.role}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Select Student</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium text-gray-800"
                >
                  <option value="">-- Choose Student --</option>
                  {users
                    .filter((u) => u.role === 'student' || u.role === 'user')
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName} ({s.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="btn-secondary text-xs px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 bg-primary-main hover:bg-primary-dark"
                >
                  Confirm Mentor Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
