import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, Search, User, LogOut, BookOpen, Sparkles, Award, CheckCircle2, MessageSquare, Calendar, X, Check } from 'lucide-react';
import { toggleSidebar } from '../../store/uiSlice';
import { logout } from '../../store/authSlice';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Notification State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setLoadingNotifications(true);
    try {
      const res = await axiosClient.get('/notifications');
      setNotifications(res.data?.data?.notifications || []);
      setUnreadCount(res.data?.data?.unreadCount || 0);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.warn('Could not fetch notifications');
      }
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    if (e) e.stopPropagation();
    try {
      await axiosClient.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosClient.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    toast.success('Logged out successfully');
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-[#F8F7F0]/90 px-6 backdrop-blur-xl border-b border-[#E2E5DF] shadow-2xs">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-xl p-2 text-[#48554E] hover:bg-[#DDF1E5] transition"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleGlobalSearch} className="relative hidden md:block w-80 sm:w-96">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#9BA29B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, topics, or quizzes..."
            className="w-full rounded-full bg-white border border-[#E2E5DF] hover:border-[#CFE5D5] py-2 pl-10 pr-12 text-xs font-semibold text-[#13201A] placeholder-[#9BA29B] focus:outline-none focus:bg-white focus:border-[#0B5D3B] focus:ring-2 focus:ring-[#0B5D3B]/10 transition-all shadow-xs"
          />
        </form>
      </div>

      <div className="flex items-center gap-3.5">
        {/* AI Tutor Quick Access Button */}
        <Link
          to="/ai/tutor"
          className="flex items-center gap-2 rounded-full bg-[#DDF1E5] text-[#0B5D3B] px-4 py-1.5 text-xs font-extrabold hover:bg-[#CFE5D5] border border-[#CFE5D5] transition-all shadow-2xs group"
        >
          <Sparkles className="h-4 w-4 text-[#0B5D3B] group-hover:rotate-12 transition-transform" />
          <span>AI Tutor</span>
        </Link>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserMenuOpen(false);
              if (!notificationsOpen) fetchNotifications();
            }}
            className="relative rounded-full p-2 text-[#48554E] bg-white border border-[#E2E5DF] hover:bg-[#DDF1E5] transition focus:outline-none shadow-2xs"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B1A] text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-4 shadow-dropdown border border-[#E2E5DF] z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[#13201A] text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="badge-soft-error text-[10px]">{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-bold text-[#0B5D3B] hover:underline flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {loadingNotifications ? (
                  <p className="text-center text-xs text-[#66736C] py-6">Loading notifications...</p>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 space-y-1">
                    <Bell className="h-8 w-8 mx-auto text-[#9BA29B]" />
                    <p className="text-xs font-bold text-[#13201A]">No Notifications Yet</p>
                    <p className="text-[11px] text-[#66736C]">Updates on courses, quizzes & mentoring will appear here.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        if (!n.isRead) handleMarkAsRead(n._id);
                        if (n.link) {
                          setNotificationsOpen(false);
                          navigate(n.link);
                        }
                      }}
                      className={`p-3 rounded-xl text-xs space-y-1 transition cursor-pointer flex items-start gap-3 ${
                        n.isRead ? 'bg-[#F8F7F0] text-[#66736C]' : 'bg-[#DDF1E5]/40 border-l-4 border-[#0B5D3B] text-[#13201A] font-medium'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'course' ? <BookOpen className="h-4 w-4 text-[#0B5D3B]" /> :
                         n.type === 'quiz' ? <CheckCircle2 className="h-4 w-4 text-[#0B5D3B]" /> :
                         n.type === 'mentoring' ? <Calendar className="h-4 w-4 text-[#3182CE]" /> :
                         <MessageSquare className="h-4 w-4 text-[#FF6B1A]" />}
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-[#13201A] text-xs">{n.title}</h4>
                          <span className="text-[10px] text-[#9BA29B]">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[#66736C] line-clamp-2 text-[11px]">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Trigger with Avatar & Role */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 rounded-full bg-white p-1 pr-3 border border-[#E2E5DF] hover:border-[#CFE5D5] transition shadow-2xs focus:outline-none"
            >
              <img
                src={user.profile?.avatar || '/default-avatar.png'}
                alt={user.firstName}
                className="h-8 w-8 rounded-full object-cover border border-[#CFE5D5]"
              />
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-black text-[#13201A]">{user.firstName}</span>
                <span className="text-[9px] font-bold text-[#66736C] capitalize">{user.role || 'Student'}</span>
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-dropdown border border-[#E2E5DF] z-50">
                <div className="px-3 py-2 border-b border-[#E2E5DF]">
                  <p className="text-sm font-bold text-[#13201A]">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-[#66736C]">{user.email}</p>
                  <span className="mt-1 inline-block badge-mint capitalize">{user.role}</span>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#48554E] hover:bg-[#DDF1E5] hover:text-[#0B5D3B]"
                  >
                    <User className="h-4 w-4 text-[#66736C]" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to={`/portfolio/${user.username || user._id}`}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#48554E] hover:bg-[#DDF1E5] hover:text-[#0B5D3B]"
                  >
                    <BookOpen className="h-4 w-4 text-[#66736C]" />
                    <span>Public Portfolio</span>
                  </Link>
                </div>
                <div className="pt-1 border-t border-[#E2E5DF]">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn-primary">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
