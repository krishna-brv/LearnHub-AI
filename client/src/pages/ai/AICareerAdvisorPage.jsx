import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import {
  Target,
  Globe,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Compass,
  Code2,
  BookOpen
} from 'lucide-react';

export default function AICareerAdvisorPage() {
  const [step, setStep] = useState('portfolio'); // 'portfolio' | 'resume'
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [guidance, setGuidance] = useState(null);

  const handleAnalyzePortfolio = async (e) => {
    e.preventDefault();
    if (!portfolioUrl.trim()) {
      toast.error('Please enter a valid portfolio website URL');
      return;
    }
    await runAnalysis({ portfolioUrl: portfolioUrl.trim() });
  };

  const handleAnalyzeResume = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      toast.error('Please paste your resume text or experience summary');
      return;
    }
    await runAnalysis({ resumeText: resumeText.trim() });
  };

  const runAnalysis = async (payload) => {
    setLoading(true);
    setGuidance(null);
    try {
      const res = await axiosClient.post('/ai/career/guidance', payload);
      const data = res.data?.data?.guidance;
      if (data) {
        setGuidance(data);
        toast.success('Career analysis complete!');
      } else {
        toast.error('Could not generate career guidance');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate career guidance');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGuidance(null);
    setStep('portfolio');
    setPortfolioUrl('');
    setResumeText('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl space-y-3 shadow-soft border border-[#06452C]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DDF1E5] px-3.5 py-1 text-xs font-black text-[#0B5D3B]">
          <Target className="h-4 w-4" />
          <span>AI CAREER CONSULTANT</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          AI Career Advisor & Portfolio Analyst
        </h1>
        <p className="text-xs font-medium text-[#DDF1E5] max-w-2xl leading-relaxed">
          Submit your public portfolio website for an intelligent code & project review, or provide your resume to receive AI-curated target roles, skill gap analysis, and a personalized career roadmap.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card-paper p-12 text-center space-y-6 bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl shadow-sm">
          <div className="relative inline-flex">
            <div className="w-16 h-16 rounded-full border-4 border-primary-main/20 border-t-primary-main animate-spin mx-auto" />
            <Sparkles className="h-6 w-6 text-primary-main absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              {step === 'portfolio' ? 'Analyzing Portfolio Website...' : 'Evaluating Resume Content...'}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Our AI is parsing your technical background, identifying project strengths, missing skills, and generating career milestones.
            </p>
          </div>
        </div>
      )}

      {/* Inputs Form Step 1: Portfolio URL */}
      {!loading && !guidance && step === 'portfolio' && (
        <div className="card-paper p-8 space-y-6 bg-white border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="p-3 bg-primary-50 rounded-xl text-primary-main">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Public Portfolio Website</h2>
              <p className="text-xs text-gray-500">Provide your live website or GitHub portfolio link for AI inspection</p>
            </div>
          </div>

          <form onSubmit={handleAnalyzePortfolio} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="portfolio-url-input" className="block text-sm font-semibold text-gray-700">
                Portfolio URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="portfolio-url-input"
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://myportfolio.com or https://github.com/username"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-primary-main text-white font-semibold rounded-xl text-sm hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-main/20"
              >
                <Sparkles className="h-4 w-4" />
                <span>Analyze Portfolio Website</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('resume')}
                className="text-xs text-gray-500 hover:text-primary-main font-medium flex items-center gap-1 transition-colors py-2"
              >
                <span>I don't have a portfolio website</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inputs Form Step 2: Resume Fallback */}
      {!loading && !guidance && step === 'resume' && (
        <div className="card-paper p-8 space-y-6 bg-white border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary-50 rounded-xl text-secondary-main">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Resume / Background Details</h2>
                <p className="text-xs text-gray-500">Paste your resume content or career summary for analysis</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep('portfolio')}
              className="text-xs text-gray-500 hover:text-primary-main font-medium flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Provide Portfolio URL</span>
            </button>
          </div>

          <form onSubmit={handleAnalyzeResume} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="resume-text-input" className="block text-sm font-semibold text-gray-700">
                Resume Content / Work Experience <span className="text-red-500">*</span>
              </label>
              <textarea
                id="resume-text-input"
                rows={7}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your education, skills, work experience, projects, or summary here..."
                className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main outline-none transition-all resize-y"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-start gap-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-secondary-main text-white font-semibold rounded-xl text-sm hover:bg-secondary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-secondary-main/20"
              >
                <Sparkles className="h-4 w-4" />
                <span>Analyze Resume for Guidance</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Results View */}
      {!loading && guidance && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Control Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Career Guidance Generated for {portfolioUrl ? 'Portfolio Site' : 'Submitted Resume'}</span>
            </div>
            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Analyze Another Link / Resume</span>
            </button>
          </div>

          {/* Profile Overview Card */}
          {guidance.profileOverview && (
            <div className="card-paper p-6 bg-gradient-to-br from-primary-50/50 via-white to-gray-50 border border-primary-100 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-primary-main font-bold text-sm">
                <Compass className="h-4 w-4" />
                <span>PROFILE OVERVIEW & ASSESSMENT</span>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed font-medium">
                {guidance.profileOverview}
              </p>
            </div>
          )}

          {/* Core Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommended Job Roles */}
            <div className="card-paper p-6 bg-white border border-gray-200/80 rounded-2xl space-y-4 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-main" />
                <span>Recommended Job Roles</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(guidance.recommendedRoles || []).map((role, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold text-xs rounded-xl shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills to Bridge */}
            <div className="card-paper p-6 bg-white border border-gray-200/80 rounded-2xl space-y-4 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span>Skills to Bridge</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {(guidance.missingSkills || []).map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200/60 font-semibold text-xs rounded-xl shadow-xs"
                  >
                    <Code2 className="h-3.5 w-3.5 text-amber-500" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested Projects */}
            <div className="card-paper p-6 bg-white border border-gray-200/80 rounded-2xl space-y-4 shadow-sm md:col-span-2">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-500" />
                <span>Suggested Portfolio Projects to Build</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(guidance.suggestedProjects || []).map((proj, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200/60 text-gray-800 text-xs font-semibold flex items-center gap-3 hover:border-primary-200 transition-colors"
                  >
                    <div className="p-2 bg-primary-100/60 text-primary-main rounded-lg shrink-0">
                      <Code2 className="h-4 w-4" />
                    </div>
                    <span>{proj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Interview Preparation Topics */}
            {guidance.interviewTopics && guidance.interviewTopics.length > 0 && (
              <div className="card-paper p-6 bg-white border border-gray-200/80 rounded-2xl space-y-4 shadow-sm md:col-span-2">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  <span>Technical Interview Preparation Topics</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {guidance.interviewTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-medium text-xs rounded-xl"
                    >
                      • {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phased Career Action Roadmap */}
          {guidance.careerRoadmap && guidance.careerRoadmap.length > 0 && (
            <div className="card-paper p-6 bg-white border border-gray-200/80 rounded-2xl space-y-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-main" />
                <span>Career Action Roadmap</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guidance.careerRoadmap.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 space-y-2 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary-main text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-xs text-primary-main uppercase tracking-wider">
                        {item.phase}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-700 font-medium pl-8">
                      {item.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
