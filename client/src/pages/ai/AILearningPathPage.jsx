import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Compass, Sparkles, CheckCircle2, Clock, Calendar, ArrowRight, ExternalLink, Loader2, Globe } from 'lucide-react';

function resolveRoadmapUrl(careerGoal = '') {
  const goal = (careerGoal || '').toLowerCase().trim();
  if (!goal) return 'https://roadmap.sh';

  if (goal.includes('backend') || goal.includes('back end') || goal.includes('node') || goal.includes('express') || goal.includes('java') || goal.includes('spring') || goal.includes('django') || goal.includes('fastapi') || goal.includes('nest')) {
    return 'https://roadmap.sh/backend';
  }
  if (goal.includes('frontend') || goal.includes('front end') || goal.includes('react') || goal.includes('vue') || goal.includes('angular') || goal.includes('html') || goal.includes('css')) {
    return 'https://roadmap.sh/frontend';
  }
  if (goal.includes('fullstack') || goal.includes('full-stack') || goal.includes('full stack') || goal.includes('mern') || goal.includes('mean') || goal.includes('software engineer') || goal.includes('software developer') || goal.includes('web developer')) {
    return 'https://roadmap.sh/full-stack';
  }
  if (goal.includes('devops') || goal.includes('cloud') || goal.includes('aws') || goal.includes('kubernetes') || goal.includes('sre')) {
    return 'https://roadmap.sh/devops';
  }
  if (goal.includes('ai') || goal.includes('data science') || goal.includes('machine learning') || goal.includes('data scientist') || goal.includes('artificial intelligence') || goal.includes('deep learning')) {
    return 'https://roadmap.sh/ai-data-scientist';
  }
  if (goal.includes('data engineer') || goal.includes('etl') || goal.includes('big data')) {
    return 'https://roadmap.sh/data-engineer';
  }
  if (goal.includes('android') || goal.includes('kotlin')) {
    return 'https://roadmap.sh/android';
  }
  if (goal.includes('ios') || goal.includes('swift')) {
    return 'https://roadmap.sh/ios';
  }
  if (goal.includes('cyber') || goal.includes('security') || goal.includes('hacker')) {
    return 'https://roadmap.sh/cyber-security';
  }
  if (goal.includes('computer science') || goal.includes('cs') || goal.includes('dsa') || goal.includes('algorithm')) {
    return 'https://roadmap.sh/computer-science';
  }
  if (goal.includes('system design') || goal.includes('architect')) {
    return 'https://roadmap.sh/system-design';
  }
  if (goal.includes('qa') || goal.includes('test') || goal.includes('automation')) {
    return 'https://roadmap.sh/qa';
  }
  if (goal.includes('ux') || goal.includes('ui') || goal.includes('design')) {
    return 'https://roadmap.sh/ux-design';
  }
  if (goal.includes('game') || goal.includes('unity') || goal.includes('unreal')) {
    return 'https://roadmap.sh/game-developer';
  }
  if (goal.includes('blockchain') || goal.includes('web3') || goal.includes('solidity')) {
    return 'https://roadmap.sh/blockchain';
  }
  if (goal.includes('python')) return 'https://roadmap.sh/python';
  if (goal.includes('javascript') || goal.includes('js')) return 'https://roadmap.sh/javascript';
  if (goal.includes('typescript') || goal.includes('ts')) return 'https://roadmap.sh/typescript';
  if (goal.includes('golang') || goal.includes('go')) return 'https://roadmap.sh/golang';
  if (goal.includes('docker')) return 'https://roadmap.sh/docker';
  if (goal.includes('sql') || goal.includes('postgres') || goal.includes('database')) return 'https://roadmap.sh/sql';

  return 'https://roadmap.sh/roadmaps';
}

export default function AILearningPathPage() {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [careerGoal, setCareerGoal] = useState('');

  const handleGenerate = async () => {
    if (!careerGoal.trim()) {
      toast.error('Please enter a target role or career goal');
      return;
    }
    setLoading(true);
    try {
      const res = await axiosClient.post('/ai/learning-path/generate', { careerGoal });
      setLearningPath(res.data?.data?.learningPath);
      toast.success('Personalized AI Learning Path & Roadmap.sh resources ready!');
    } catch (err) {
      console.error('Learning path generation error:', err);
      const errMsg = err.response?.data?.message || 'Could not generate learning path. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const directRoadmapUrl = learningPath?.roadmapUrl || resolveRoadmapUrl(learningPath?.careerGoal || careerGoal);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Banner */}
      <div className="card-paper bg-[#0B5D3B] text-white p-8 space-y-4 rounded-3xl shadow-soft border border-[#06452C]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DDF1E5] px-3.5 py-1 text-xs font-black text-[#0B5D3B]">
          <Compass className="h-4 w-4" />
          <span>AI CAREER ROADMAP GENERATOR</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <span>AI Personalized Learning Roadmap</span>
        </h1>
        <p className="text-xs font-medium text-[#DDF1E5] max-w-2xl">
          Get a dynamically generated step-by-step curriculum customized for your career goal, paired with direct interactive resources from <span className="text-white font-extrabold underline">roadmap.sh</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl">
          <input
            type="text"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="Target Role (e.g. Frontend React Developer, Python AI Engineer)"
            className="flex-1 rounded-2xl bg-white/10 px-4 py-3 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-white placeholder-[#CFE5D5] border border-white/20"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-orange py-3 px-6 text-xs font-extrabold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Searching & Building...</span>
              </>
            ) : (
              <>
                <span>Generate New Path</span>
                <Sparkles className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading / Generating State */}
      {loading && (
        <div className="card-paper p-8 text-center space-y-4 bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-primary-main">
            <Loader2 className="h-6 w-6 animate-spin text-primary-main" />
            <span className="font-semibold text-base text-gray-800">Generating AI Learning Path & Roadmap...</span>
          </div>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Analyzing <span className="font-medium text-gray-700">"{careerGoal}"</span> and matching live resources from roadmap.sh...
          </p>

          {/* Skeleton Loader */}
          <div className="space-y-4 pt-4 text-left max-w-2xl mx-auto opacity-60">
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-24 bg-gray-100 rounded-xl p-4 space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="h-24 bg-gray-100 rounded-xl p-4 space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      )}

      {/* Roadmap Output */}
      {!loading && learningPath ? (
        <div className="space-y-6">
          {/* Output Header with Clean Roadmap.sh Action Link */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-bold text-gray-900 capitalize">Roadmap: {learningPath.careerGoal}</h3>
              <p className="text-xs text-gray-500">AI-curated phases and step-by-step topics</p>
            </div>

            <a
              href={directRoadmapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs border border-emerald-200 transition-all shrink-0"
            >
              <Globe className="h-4 w-4 text-emerald-600" />
              <span>View Interactive Guide on Roadmap.sh</span>
              <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
            </a>
          </div>

          <div className="space-y-6">
            {(learningPath.roadmap?.phases || []).map((phase, idx) => (
              <div key={idx} className="card-paper space-y-4 border-l-4 border-primary-main">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-gray-900 text-lg">Phase {idx + 1}: {phase.name}</h4>
                  <span className="badge-soft-info flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{phase.duration}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(phase.topics || []).map((topic, tidx) => (
                    <div key={tidx} className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-gray-800 text-sm">{topic.name}</h5>
                        <span className="badge-soft-success capitalize text-[10px]">{topic.priority}</span>
                      </div>
                      <p className="text-xs text-gray-500">{topic.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                        <span>Est. {topic.estimatedHours} Hours</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : !loading ? (
        <div className="card-paper text-center py-12 space-y-3">
          <Compass className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">No Active Roadmap Selected</h3>
          <p className="text-xs text-gray-500">Enter your target role or career goal above and click "Generate New Path" to get a fresh curriculum.</p>
        </div>
      ) : null}
    </div>
  );
}
