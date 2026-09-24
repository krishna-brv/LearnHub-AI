import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout() {
  const { isSidebarOpen } = useSelector((state) => state.ui);
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const storedToken = localStorage.getItem('accessToken');

  const isAuthed = (isAuthenticated || !!token) && !!storedToken;

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8F7F0] flex font-sans text-gray-900">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Right Content Area - adjusts padding based on sidebar open state */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
          isSidebarOpen ? 'lg:pl-[280px]' : 'pl-0'
        }`}
      >
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
