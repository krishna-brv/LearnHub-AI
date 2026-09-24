import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/uiSlice';
import Logo from '../common/Logo';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Award,
  Users,
  BrainCircuit,
  MessageSquare,
  FileCheck,
  Compass,
  Bookmark,
  FileText,
  Target,
  BarChart3,
  Settings,
  ChevronRight,
  HelpCircle,
  User,
  Brain
} from 'lucide-react';

export default function Sidebar() {
  const dispatch = useDispatch();
  const { isSidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isSidebarOpen) return null;

  const role = user?.role || 'student';

  const getDashboardPath = (userRole) => {
    if (userRole === 'admin') return '/admin/users';
    if (userRole === 'instructor') return '/instructor/dashboard';
    if (userRole === 'mentor') return '/mentor/dashboard';
    if (userRole === 'reviewer') return '/reviewer/queue';
    return '/dashboard';
  };

  // Nav items matching all platform capabilities
  const getNavItems = (userRole) => {
    switch (userRole) {
      case 'instructor':
        return [
          { name: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
          { name: 'Course Management', path: '/instructor/courses', icon: BookOpen },
          { name: 'Student Analytics', path: '/instructor/analytics', icon: BarChart3 },
        ];
      case 'mentor':
        return [
          { name: 'Dashboard', path: '/mentor/dashboard', icon: LayoutDashboard },
          { name: 'Mentoring Sessions', path: '/mentoring', icon: Users },
        ];
      case 'reviewer':
        return [
          { name: 'Review Queue', path: '/reviewer/queue', icon: FileCheck },
        ];
      case 'admin':
        return [
          { name: 'Admin Dashboard', path: '/admin/users', icon: LayoutDashboard },
          { name: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
          { name: 'Category Settings', path: '/admin/categories', icon: Settings },
        ];
      case 'student':
      default:
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'My Courses', path: '/my-courses', icon: BookOpen },
          { name: 'Course Catalog', path: '/courses', icon: Compass },
          { name: 'My Notes', path: '/notes', icon: FileText },
          { name: 'Flashcards', path: '/flashcards', icon: BrainCircuit },
          { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
          { name: 'Certificates', path: '/certificates', icon: Award },
          { name: 'AI Tutor', path: '/ai/tutor', icon: Sparkles },
          { name: 'AI Learning Path', path: '/ai/learning-path', icon: Target },
          { name: 'AI Quiz Generator', path: '/ai/quiz-generator', icon: HelpCircle },
          { name: 'AI Career Advisor', path: '/ai/career', icon: Brain },
          { name: 'AI Mock Interview', path: '/ai/interview', icon: MessageSquare },
          { name: 'Community', path: '/mentoring', icon: Users },
        ];
    }
  };

  const bottomItems = [
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const mainNavItems = getNavItems(role);

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      dispatch(toggleSidebar());
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => dispatch(toggleSidebar())}
          className="fixed inset-0 z-30 bg-[#13201A]/40 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside className="fixed left-0 top-0 z-40 h-screen w-[280px] bg-[#F8F7F0] border-r border-[#E2E5DF] text-[#13201A] flex flex-col transition-all duration-300 shadow-xs">
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-[#E2E5DF] bg-[#F8F7F0]">
          <NavLink to={getDashboardPath(role)} onClick={handleNavClick} className="flex items-center group">
            <Logo size="md" />
          </NavLink>

          {/* Close Sidebar Button on Mobile */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden rounded-full p-1.5 text-gray-400 hover:bg-[#CFE5D5] hover:text-[#0B5D3B] transition"
            aria-label="Close Sidebar"
          >
            <span className="font-bold text-base">✕</span>
          </button>
        </div>

        {/* Nav Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col justify-between custom-scrollbar">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#0B5D3B] text-white shadow-xs'
                      : 'text-[#313C36] hover:bg-[#DDF1E5] hover:text-[#0B5D3B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#66736C] group-hover:text-[#0B5D3B]'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-white" />}
                </NavLink>
              );
            })}
          </div>

          {/* Bottom Settings / Profile links matching reference UI */}
          <div className="pt-4 border-t border-[#E2E5DF] space-y-1 mt-6">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#0B5D3B] text-white shadow-xs'
                      : 'text-[#66736C] hover:bg-[#DDF1E5] hover:text-[#0B5D3B]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#66736C] group-hover:text-[#0B5D3B]'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 text-white" />}
                </NavLink>
              );
            })}
          </div>
        </div>



        {/* User Mini Profile Footer */}
        {user && (
          <div className="p-4 border-t border-[#E2E5DF] bg-[#F8F7F0]">
            <Link
              to="/profile"
              onClick={handleNavClick}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-[#DDF1E5] border border-[#E2E5DF] transition-all group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={user.profile?.avatar || '/default-avatar.png'}
                  alt={user.firstName}
                  className="h-9 w-9 rounded-full object-cover border border-[#CFE5D5] shrink-0"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-extrabold text-[#13201A] truncate">{user.firstName} {user.lastName}</h4>
                  <span className="inline-block px-2 py-0.5 mt-0.5 badge-mint text-[9px] uppercase font-bold">
                    {user.role}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#66736C] group-hover:text-[#0B5D3B] transition-colors" />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
