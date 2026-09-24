import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import {
  User,
  Globe,
  Github,
  Linkedin,
  Award,
  BookOpen,
  CheckCircle2,
  Share2,
  Sparkles,
  ExternalLink,
  Code2,
  Briefcase,
  Flame,
  Lock,
  ArrowLeft,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  FileText
} from 'lucide-react';

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    headline: '',
    bio: '',
    careerGoal: '',
    skills: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    projects: []
  });

  useEffect(() => {
    if (username) {
      fetchPortfolio(username);
    }
  }, [username]);

  const fetchPortfolio = async (targetUsername) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axiosClient.get(`/portfolio/${targetUsername}`);
      const port = res.data?.data?.portfolio;
      setPortfolio(port);

      if (port && port.user) {
        const u = port.user;
        const initialForm = {
          headline: u.headline || '',
          bio: u.bio || '',
          careerGoal: u.careerGoal || '',
          skills: Array.isArray(u.skills) ? u.skills.join(', ') : '',
          githubUrl: u.githubUrl || '',
          linkedinUrl: u.linkedinUrl || '',
          portfolioUrl: u.portfolioUrl || '',
          projects: Array.isArray(port.projects)
            ? port.projects.map((p) => ({
                title: p.title || '',
                description: p.description || '',
                technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || ''),
                url: p.url || '',
                githubUrl: p.githubUrl || ''
              }))
            : []
        };
        setFormData(initialForm);

        // Check if user has details
        const hasAnyDetails = Boolean(
          u.headline ||
          u.bio ||
          u.careerGoal ||
          (u.skills && u.skills.length > 0) ||
          (port.projects && port.projects.length > 0)
        );

        // If current logged in user is owner and has NO details yet, open form by default
        const isUserOwner = Boolean(
          currentUser &&
          (currentUser._id === u._id || currentUser.username?.toLowerCase() === u.username?.toLowerCase())
        );

        if (isUserOwner && !hasAnyDetails) {
          setIsEditing(true);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Could not load public portfolio');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = Boolean(
    currentUser &&
    portfolio?.user &&
    (currentUser._id === portfolio.user._id ||
     currentUser.username?.toLowerCase() === portfolio.user.username?.toLowerCase())
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Public portfolio link copied to clipboard!');
  };

  const handleAddProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: '', description: '', technologies: '', url: '', githubUrl: '' }
      ]
    }));
  };

  const handleRemoveProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  const handleProjectChange = (index, field, value) => {
    setFormData((prev) => {
      const newProjects = [...prev.projects];
      newProjects[index] = { ...newProjects[index], [field]: value };
      return { ...prev, projects: newProjects };
    });
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const formattedProjects = formData.projects
        .filter((p) => p.title.trim())
        .map((p) => ({
          title: p.title.trim(),
          description: p.description.trim(),
          technologies: typeof p.technologies === 'string'
            ? p.technologies.split(',').map((t) => t.trim()).filter(Boolean)
            : p.technologies,
          url: p.url.trim(),
          githubUrl: p.githubUrl.trim()
        }));

      const payload = {
        profile: {
          headline: formData.headline.trim(),
          bio: formData.bio.trim(),
          githubUrl: formData.githubUrl.trim(),
          linkedinUrl: formData.linkedinUrl.trim(),
          portfolioUrl: formData.portfolioUrl.trim()
        },
        studentProfile: {
          careerGoal: formData.careerGoal.trim(),
          skills: skillsArray
        },
        portfolioSettings: {
          isPublic: true,
          projects: formattedProjects
        }
      };

      await axiosClient.put('/users/profile', payload);
      toast.success('Portfolio updated & published successfully!');
      setIsEditing(false);
      await fetchPortfolio(username);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-main/20 border-t-primary-main rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-600">Loading student public portfolio...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md text-center space-y-5 border border-gray-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Portfolio Unavailable</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{errorMsg || 'Student portfolio not found.'}</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-main text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const { user, projects = [], certificates = [], courses = [], skillProgress = [] } = portfolio;
  const hasDetails = Boolean(
    user?.headline ||
    user?.bio ||
    user?.careerGoal ||
    (user?.skills && user.skills.length > 0) ||
    (projects && projects.length > 0)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 pb-16">
      {/* Top Banner Hero */}
      <div className="bg-gradient-to-r from-[#1C252E] via-[#16202A] to-[#0D131A] text-white py-12 px-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary-main/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          {/* User Profile Card Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
              alt={user?.firstName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-primary-main/30 shadow-2xl shrink-0"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {user?.firstName} {user?.lastName}
                </h1>
                <span className="px-3 py-1 bg-primary-main/20 border border-primary-main/30 text-primary-light text-xs font-bold rounded-full">
                  @{user?.username}
                </span>
              </div>

              {user?.headline && (
                <p className="text-sm font-semibold text-gray-300">{user.headline}</p>
              )}

              {user?.bio && (
                <p className="text-xs text-gray-400 max-w-lg leading-relaxed">{user.bio}</p>
              )}

              {/* Social Links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                {user?.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    title="GitHub Profile"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {user?.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {user?.portfolioUrl && (
                  <a
                    href={user.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    title="External Website"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Actions & Gamification Stats */}
          <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
            <div className="flex items-center flex-wrap justify-center md:justify-end gap-2">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4 text-primary-light" />
                <span>Back to Dashboard</span>
              </Link>

              {isOwner && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2"
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4 text-primary-light" />}
                  <span>{isEditing ? 'Cancel Editing' : 'Edit Portfolio'}</span>
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-primary-main/20"
              >
                <Share2 className="h-4 w-4" />
                <span>Share Portfolio</span>
              </button>
            </div>

            <div className="flex items-center gap-3 bg-white/10 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
              <div className="text-center px-3 border-r border-white/10">
                <span className="block text-xs text-gray-400 font-medium">Level</span>
                <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                  <Award className="h-4 w-4" />
                  {user?.level || 1}
                </span>
              </div>
              <div className="text-center px-3 border-r border-white/10">
                <span className="block text-xs text-gray-400 font-medium">XP</span>
                <span className="text-lg font-black text-primary-light flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  {user?.xp || 0}
                </span>
              </div>
              <div className="text-center px-3">
                <span className="block text-xs text-gray-400 font-medium">Streak</span>
                <span className="text-lg font-black text-red-400 flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4" />
                  {user?.streak?.current || 0}d
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-8">
        {/* EDIT FORM (Visible when isEditing === true) */}
        {isEditing && isOwner && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-50 text-primary-main rounded-xl">
                  <Edit3 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Portfolio Setup & Edit Form</h2>
                  <p className="text-xs text-gray-500">Provide your target career goal, skills, links, and featured projects</p>
                </div>
              </div>
              {hasDetails && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                >
                  Close Form
                </button>
              )}
            </div>

            <form onSubmit={handleSavePortfolio} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Professional Headline</label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="e.g. MERN Stack Developer & Open Source Contributor"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Short Bio / About Me</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief intro about your experience, interests, and background..."
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main resize-y"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Target Career Goal <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.careerGoal}
                    onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                    placeholder="e.g. Full-Stack Web Engineer"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">Technical Skills (Comma Separated)</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g. React, Node.js, MongoDB, TypeScript, Tailwind"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase">External Portfolio / Website URL</label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://myportfolio.dev"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main"
                  />
                </div>
              </div>

              {/* Projects Section Editor */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-primary-main" />
                    <span>Featured Portfolio Projects ({formData.projects.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {formData.projects.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">Click "+ Add Project" to feature your work.</p>
                ) : (
                  <div className="space-y-4">
                    {formData.projects.map((proj, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(index)}
                          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove Project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <h4 className="text-xs font-bold text-primary-main uppercase">Project #{index + 1}</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                              placeholder="Project Title *"
                              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold"
                              required
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={proj.technologies}
                              onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                              placeholder="Technologies (e.g. React, Node, Express)"
                              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <textarea
                              rows={2}
                              value={proj.description}
                              onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                              placeholder="Short project description..."
                              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs resize-y"
                            />
                          </div>

                          <div>
                            <input
                              type="url"
                              value={proj.url}
                              onChange={(e) => handleProjectChange(index, 'url', e.target.value)}
                              placeholder="Live Demo URL (https://...)"
                              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <input
                              type="url"
                              value={proj.githubUrl}
                              onChange={(e) => handleProjectChange(index, 'githubUrl', e.target.value)}
                              placeholder="GitHub Repo URL (https://...)"
                              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-primary-main/20"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving & Publishing...' : 'Save & Publish Portfolio'}</span>
                </button>

                {hasDetails && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* PUBLIC VIEW (Visible when isEditing === false) */}
        {!isEditing && (
          <div className="space-y-8">
            {/* Owner Prompt Banner if No Details Provided Yet */}
            {isOwner && !hasDetails && (
              <div className="p-6 bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 bg-primary-100 text-primary-main rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Build & Publish Your Portfolio</h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  You haven't published your target career, skills, or portfolio projects yet. Fill in your details to showcase your profile to recruiters and peers.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-2 shadow-md"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Fill Portfolio Details Form</span>
                </button>
              </div>
            )}

            {/* Career Goal & Mastered Skills */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Target Career Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary-main tracking-wider">
                  <Briefcase className="h-4 w-4" />
                  <span>CAREER TARGET</span>
                </div>
                {user?.careerGoal ? (
                  <h3 className="text-lg font-bold text-gray-900">{user.careerGoal}</h3>
                ) : (
                  <p className="text-xs text-gray-400 italic">No target career goal specified yet.</p>
                )}
                <p className="text-xs text-gray-500">
                  Verified learning profile & project portfolio on LearnHub AI.
                </p>
              </div>

              {/* Technical Skills Showcase */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-3 md:col-span-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-600 tracking-wider">
                  <Code2 className="h-4 w-4" />
                  <span>TECHNICAL SKILLS & MASTERY</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillProgress.length > 0 ? (
                    skillProgress.map((sp, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                          sp.status === 'mastered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-primary-50 text-primary-800 border-primary-200'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        {sp.skill?.name || sp.skill}
                      </span>
                    ))
                  ) : user?.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 font-semibold text-xs rounded-xl border border-gray-200">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 italic">No public skills listed yet.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Projects Showcase */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-primary-main" />
                  <span>Featured Portfolio Projects ({projects.length})</span>
                </h3>
              </div>

              {projects.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 italic">No public projects featured yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-gray-50/70 hover:bg-white rounded-xl border border-gray-200/80 transition-all hover:shadow-md space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <h4 className="font-bold text-gray-900 text-sm">{proj.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{proj.description}</p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.technologies.map((tech, tIdx) => (
                              <span key={tIdx} className="px-2 py-0.5 bg-gray-200/70 text-gray-700 text-[10px] font-semibold rounded-md">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 pt-2 text-xs font-bold text-primary-main border-t border-gray-100">
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Live Demo</span>
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-gray-700">
                            <Github className="h-3.5 w-3.5" />
                            <span>GitHub Repo</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Verified Course Certificates */}
            {certificates.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span>Verified Certificates ({certificates.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certificates.map((cert, idx) => (
                    <div key={idx} className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/60 flex items-center gap-4">
                      <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                        <Award className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-900 text-xs line-clamp-1">{cert.course?.title || 'Verified Course'}</h4>
                        <p className="text-[11px] text-gray-500 font-mono">ID: {cert.certificateId || cert._id}</p>
                        <Link
                          to={`/certificates/verify/${cert.certificateId || cert._id}`}
                          className="text-[11px] font-bold text-primary-main hover:underline flex items-center gap-1 pt-0.5"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Verify Credential</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enrolled Courses */}
            {courses.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2 border-b border-gray-100 pb-3">
                  <BookOpen className="h-5 w-5 text-primary-main" />
                  <span>Courses Completed & Enrolled ({courses.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {courses.map((c, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200/70 space-y-2">
                      <h4 className="font-bold text-gray-900 text-xs line-clamp-1">{c.course?.title || 'Course'}</h4>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary-main h-full rounded-full" style={{ width: `${c.overallProgress || 0}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500 font-semibold">{c.overallProgress || 0}% Completed</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
