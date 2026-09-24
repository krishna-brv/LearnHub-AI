import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, ShieldCheck, GraduationCap, BookOpen, Users } from 'lucide-react';
import Logo from '../../components/common/Logo';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ message: '', isAlreadyExists: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorInfo({ message: '', isAlreadyExists: false });

    const nameParts = fullName.trim().split(/\s+/);
    let firstName = nameParts[0] || 'Learner';
    let lastName = nameParts.slice(1).join(' ').trim() || nameParts[0] || 'Learner';

    if (firstName.length < 2) firstName = `${firstName}.`;
    if (lastName.length < 2) lastName = `${lastName}.`;

    const username = email.split('@')[0] || `user_${Date.now()}`;

    try {
      const res = await axiosClient.post('/auth/register', {
        firstName,
        lastName,
        username,
        email: email.trim(),
        password,
        role
      });
      toast.success(res.data.message || 'Registration successful!');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      const isAlreadyExists = err.response?.status === 400 && (
        msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already taken')
      );
      setErrorInfo({ message: msg, isAlreadyExists });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const rolesList = [
    { id: 'student', label: 'Student', desc: 'Learner & AI Tools', icon: GraduationCap },
    { id: 'instructor', label: 'Instructor', desc: 'Create & Teach', icon: BookOpen },
    { id: 'mentor', label: 'Peer Mentor', desc: 'Guide & Coach', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7F0] px-4 py-12 font-sans relative overflow-hidden">
      {/* Soft Background Accent Circles */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#DDF1E5]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#FFE4D2]/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-[#E2E5DF]">
        {/* Header Logo & Title */}
        <div className="text-center flex flex-col items-center space-y-2">
          <Link to="/">
            <Logo size="lg" />
          </Link>
          <h2 className="text-2xl font-black text-[#13201A] tracking-tight pt-2">Create Your Account</h2>
          <p className="text-xs font-semibold text-[#66736C]">Join thousands of learners and start learning smarter today!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorInfo.message && (
            <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-xs space-y-2">
              <p className="font-semibold">{errorInfo.message}</p>
              {errorInfo.isAlreadyExists && (
                <div className="pt-1">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B5D3B] text-white font-bold text-xs hover:bg-[#06452C] transition"
                  >
                    <span>Sign In Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-[#13201A] mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[#9BA29B]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-2xl border border-[#E2E5DF] bg-[#F8F7F0] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#13201A] focus:bg-white focus:border-[#0B5D3B] outline-none transition"
              />
            </div>
          </div>

          {/* College Email */}
          <div>
            <label className="block text-xs font-bold text-[#13201A] mb-1">College Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#9BA29B]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full rounded-2xl border border-[#E2E5DF] bg-[#F8F7F0] py-2.5 pl-10 pr-4 text-xs font-semibold text-[#13201A] focus:bg-white focus:border-[#0B5D3B] outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
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

          {/* Role Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-[#13201A] mb-1.5">Select Account Role</label>
            <div className="grid grid-cols-3 gap-2">
              {rolesList.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#DDF1E5] border-[#0B5D3B] text-[#0B5D3B] shadow-2xs font-extrabold ring-1 ring-[#0B5D3B]'
                        : 'bg-[#F8F7F0] border-[#E2E5DF] text-[#66736C] hover:bg-white hover:border-[#CFE5D5]'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${isSelected ? 'text-[#0B5D3B]' : 'text-[#66736C]'}`} />
                    <div>
                      <span className="block text-xs font-black text-[#13201A] leading-snug">{r.label}</span>
                      <span className="block text-[10px] font-semibold text-[#66736C] mt-0.5">{r.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create Account CTA Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-xs font-black flex items-center justify-center gap-2 shadow-xs mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer Link & Quote matching reference image */}
        <div className="pt-2 border-t border-[#E2E5DF] text-center space-y-2">
          <p className="text-xs font-bold text-[#66736C]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0B5D3B] font-black hover:underline">
              Log in
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
