import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { BarChart3, Users, BookOpen, Shield, Sparkles, TrendingUp, Cpu, Activity } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      const res = await axiosClient.get('/analytics/admin');
      setAnalytics(res.data?.data?.analytics);
    } catch (err) {
      console.error(err);
      toast.error('Could not load platform analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card-paper p-12 text-center text-gray-400">Loading system analytics...</div>;
  }

  const { overview, userDistribution, courseDistribution, recentUsers, aiUsageStats } = analytics || {};

  const totalUsers = overview?.totalUsers || 1;
  const totalCourses = overview?.totalCourses || 1;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="card-paper bg-gradient-to-r from-[#1C252E] via-[#16202A] to-[#0D131A] text-white p-8 rounded-2xl shadow-xl border border-gray-800 space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-main/20 rounded-xl text-primary-light">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Platform Intelligence & Analytics</h1>
        </div>
        <p className="text-sm text-gray-300">Global system metrics, role allocation breakdowns, course lifecycle status, and AI token consumption logs.</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-paper flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Total Users</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{overview?.totalUsers || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary-lighter/50 text-primary-main flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Total Courses</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{overview?.totalCourses || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-info-light/50 text-info-dark flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Active Enrollments</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{overview?.totalEnrollments || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-success-light/50 text-success-dark flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">AI Features Run</p>
            <p className="text-3xl font-black text-gray-900 mt-1">
              {(aiUsageStats || []).reduce((acc, curr) => acc + (curr.count || 0), 0)}
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-warning-light/50 text-warning-dark flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Distribution Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Role Distribution */}
        <div className="card-paper space-y-4">
          <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-main" />
            <span>User Role Distribution</span>
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(userDistribution || { student: 0, instructor: 0, reviewer: 0, mentor: 0, admin: 0 }).map(
              ([role, count]) => {
                const pct = Math.round((count / totalUsers) * 100) || 0;
                return (
                  <div key={role} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold capitalize text-gray-700">
                      <span>{role}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-main rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Course Status Distribution */}
        <div className="card-paper space-y-4">
          <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-info-dark" />
            <span>Course Lifecycle Status</span>
          </h3>

          <div className="space-y-3 pt-2">
            {Object.entries(courseDistribution || { draft: 0, submitted: 0, approved: 0, published: 0, archived: 0 }).map(
              ([status, count]) => {
                const pct = Math.round((count / totalCourses) * 100) || 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold capitalize text-gray-700">
                      <span>{status.replace('_', ' ')}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-info-main rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* AI Usage Logs */}
      <div className="card-paper space-y-4">
        <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-warning-dark" />
          <span>AI Power Tool Token Usage</span>
        </h3>

        {(!aiUsageStats || aiUsageStats.length === 0) ? (
          <p className="text-xs text-gray-500 italic py-4">No AI usage metrics recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {aiUsageStats.map((item) => (
              <div key={item._id} className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
                <p className="text-xs font-bold uppercase text-gray-500">{item._id || 'AI Tutor'}</p>
                <p className="text-xl font-black text-gray-900">{item.count || 0} executions</p>
                <p className="text-[11px] text-gray-500 font-semibold">{item.totalTokens || 0} total tokens</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent User Signups */}
      <div className="card-paper space-y-4">
        <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
          <Activity className="h-5 w-5 text-success-dark" />
          <span>Recent User Registration Stream</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 font-bold text-gray-500 uppercase">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(recentUsers || []).map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">{u.firstName} {u.lastName}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3"><span className="badge-soft-info capitalize">{u.role}</span></td>
                  <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
