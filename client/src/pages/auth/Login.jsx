import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/authSlice';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import Logo from '../../components/common/Logo';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ message: '', isNotFound: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorInfo({ message: '', isNotFound: false });
    try {
      const res = await axiosClient.post('/auth/login', { email: email.trim(), password });
      const { user, accessToken } = res.data.data;
      dispatch(setCredentials({ user, accessToken }));
      toast.success(`Welcome back, ${user.firstName}!`);

      if (user.role === 'admin') navigate('/admin/users');
      else if (user.role === 'instructor') navigate('/instructor/dashboard');
      else if (user.role === 'mentor') navigate('/mentor/dashboard');
      else if (user.role === 'reviewer') navigate('/reviewer/queue');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      const isNotFound = err.response?.status === 404 || msg.toLowerCase().includes('no account found');
      setErrorInfo({ message: msg, isNotFound });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F0] px-4 py-12 font-sans relative overflow-hidden">
      {/* Soft Background Accent Circles */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#DDF1E5]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#FFE4D2]/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-[#E2E5DF]">
        {/* Logo & Header */}
        <div className="text-center flex flex-col items-center space-y-2">
          <Link to="/">
            <Logo size="lg" />
          </Link>
          <h2 className="text-2xl font-black text-[#13201A] tracking-tight pt-2">Sign In to Your Account</h2>
          <p className="text-xs font-semibold text-[#66736C]">Join thousands of learners and start learning smarter today!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorInfo.message && (
            <div className="p-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-800 text-xs space-y-2">
              <p className="font-semibold">{errorInfo.message}</p>
              {errorInfo.isNotFound && (
                <div className="pt-1">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition"
                  >
                    <span>Create Account Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#13201A] mb-1">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#9BA29B]" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="College Email or Username"
                className="w-full rounded-2xl border border-[#E2E5DF] bg-[#F8F7F0] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#13201A] focus:bg-white focus:border-[#0B5D3B] outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#13201A] mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#9BA29B]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-[#E2E5DF] bg-[#F8F7F0] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#13201A] focus:bg-white focus:border-[#0B5D3B] outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Quote matching reference image */}
        <div className="pt-2 border-t border-[#E2E5DF] text-center space-y-2">
          <p className="text-xs font-bold text-[#66736C]">
            Already have an account?{' '}
            <Link to="/register" className="text-[#0B5D3B] font-black hover:underline">
              Create Account
            </Link>
          </p>

          <p className="text-[11px] text-[#66736C] italic font-semibold pt-1">
            "Small steps every day lead to big results."
          </p>
        </div>
      </div>
    </div>
  );
}
