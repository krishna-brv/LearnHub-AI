import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ArrowLeft, Play, Sparkles, CheckCircle, AlertTriangle, Lightbulb, BookOpen, ArrowRight } from 'lucide-react';

export default function SkillTreePage() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState('Biology');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Topics breakdown map matching reference image
  const topicBreakdown = {
    Biology: {
      centralNode: 'Photosynthesis',
      nodes: [
        { name: 'Definition', status: 'strong', label: 'Strong', color: 'bg-[#DDF1E5] text-[#0B5D3B] border-[#0B5D3B]/20' },
        { name: 'Equation', status: 'strong', label: 'Strong', color: 'bg-[#DDF1E5] text-[#0B5D3B] border-[#0B5D3B]/20' },
        { name: 'Light Reactions', status: 'revision', label: 'Needs Revision', color: 'bg-[#FFE4D2] text-[#FF6B1A] border-[#FF6B1A]/20' },
        { name: 'Calvin Cycle', status: 'weak', label: 'Weak', color: 'bg-[#FED7D7] text-[#9B1C1C] border-[#E53E3E]/20' },
        { name: 'Factors Affecting', status: 'revision', label: 'Needs Revision', color: 'bg-[#FFE4D2] text-[#FF6B1A] border-[#FF6B1A]/20' },
      ],
      recommendations: [
        { title: 'Calvin Cycle', duration: '5 min', desc: 'Quick revision notes + example questions' },
        { title: 'Light Reactions', duration: '5 min', desc: 'Key points + diagram walkthrough' },
        { title: 'Practice Quiz', duration: '5 min', desc: 'Test your understanding again' },
      ]
    },
    'Computer Science': {
      centralNode: 'Data Structures',
      nodes: [
        { name: 'Arrays & Strings', status: 'strong', label: 'Strong', color: 'bg-[#DDF1E5] text-[#0B5D3B] border-[#0B5D3B]/20' },
        { name: 'Stack (LIFO)', status: 'strong', label: 'Strong', color: 'bg-[#DDF1E5] text-[#0B5D3B] border-[#0B5D3B]/20' },
        { name: 'Binary Trees', status: 'revision', label: 'Needs Revision', color: 'bg-[#FFE4D2] text-[#FF6B1A] border-[#FF6B1A]/20' },
        { name: 'Graph Traversal (DFS/BFS)', status: 'weak', label: 'Weak', color: 'bg-[#FED7D7] text-[#9B1C1C] border-[#E53E3E]/20' },
        { name: 'Heap & Priority Queue', status: 'revision', label: 'Needs Revision', color: 'bg-[#FFE4D2] text-[#FF6B1A] border-[#FF6B1A]/20' },
      ],
      recommendations: [
        { title: 'Graph Traversal (DFS/BFS)', duration: '5 min', desc: 'Quick revision notes + algorithm walkthrough' },
        { title: 'Binary Trees & BST', duration: '5 min', desc: 'Key traversal patterns & practice problems' },
        { title: 'Data Structures Quiz', duration: '5 min', desc: 'Re-test your problem solving skills' },
      ]
    }
  };

  const currentData = topicBreakdown[selectedSubject] || topicBreakdown['Biology'];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white border border-[#E2E5DF] text-[#13201A] hover:bg-[#DDF1E5] transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#13201A]">Find My Weakness</h1>
            <p className="text-xs font-semibold text-[#66736C]">
              Here's your knowledge map based on your quiz performance.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid (Knowledge Map + Next Steps) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Knowledge Map Diagram */}
        <div className="lg:col-span-2 card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl space-y-6 shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-4">
            <label className="text-xs font-bold text-[#13201A] uppercase tracking-wider">Subject Filter</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] py-2 px-4 text-xs font-bold text-[#13201A] outline-none focus:border-[#0B5D3B]"
            >
              <option value="Biology">Biology</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          {/* Interactive Knowledge Map Diagram */}
          <div className="py-8 px-4 relative flex flex-col items-center justify-center min-h-[360px] bg-[#F8F7F0]/60 rounded-2xl border border-[#E2E5DF]">
            {/* Center Central Topic Node */}
            <div className="z-10 bg-white border-2 border-[#0B5D3B] p-4 rounded-full shadow-card text-center font-black text-sm text-[#0B5D3B] px-6">
              🌱 {currentData.centralNode}
            </div>

            {/* Visual Node Diagram Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-10 w-full max-w-lg z-10">
              {currentData.nodes.map((node, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-center space-y-1 bg-white p-3 rounded-2xl border border-[#E2E5DF] shadow-2xs hover:scale-105 transition-transform"
                >
                  <span className="font-bold text-xs text-[#13201A]">{node.name}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${node.color}`}>
                    {node.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Connecting SVG lines backdrop */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
              <line x1="50%" y1="35%" x2="20%" y2="70%" stroke="#0B5D3B" strokeWidth="2" strokeDasharray="4" />
              <line x1="50%" y1="35%" x2="50%" y2="70%" stroke="#0B5D3B" strokeWidth="2" strokeDasharray="4" />
              <line x1="50%" y1="35%" x2="80%" y2="70%" stroke="#0B5D3B" strokeWidth="2" strokeDasharray="4" />
            </svg>
          </div>

          {/* Color Legend */}
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-[#E2E5DF] text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#0B5D3B]"></span>
              <span className="text-[#0B5D3B]">Green = Strong</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#FF6B1A]"></span>
              <span className="text-[#FF6B1A]">Orange = Needs Revision</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#E53E3E]"></span>
              <span className="text-[#E53E3E]">Red = Weak</span>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Recommended Next Steps */}
        <div className="space-y-6">
          <div className="card-paper p-6 bg-white border border-[#E2E5DF] rounded-3xl space-y-6 shadow-soft flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-[#FF6B1A]" />
                  <h3 className="font-black text-[#13201A] text-base">Recommended Next Steps</h3>
                </div>
                <p className="text-xs font-semibold text-[#66736C]">
                  Focus on your weakest topics with a 5-minute revision plan.
                </p>
              </div>

              {/* Recommendation Items */}
              <div className="space-y-3">
                {currentData.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#F8F7F0] border border-[#E2E5DF] hover:bg-[#DDF1E5]/40 transition flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-[#13201A] text-xs">{rec.title}</h4>
                        <span className="text-[10px] font-bold text-[#66736C]">• {rec.duration}</span>
                      </div>
                      <p className="text-[10px] text-[#66736C] font-semibold">{rec.desc}</p>
                    </div>

                    <button className="h-8 w-8 rounded-full bg-[#FF6B1A] text-white flex items-center justify-center shrink-0 hover:scale-105 transition-transform shadow-2xs">
                      <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Revision CTA */}
            <div className="pt-4">
              <button
                onClick={() => navigate('/notes')}
                className="w-full btn-primary py-3 px-6 text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Start Revision</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Quote Footer */}
      <div className="card-paper p-6 bg-gradient-to-r from-[#DDF1E5] via-[#F8F7F0] to-[#FFE4D2] border border-[#CFE5D5] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center text-lg">
            🌱
          </div>
          <span className="font-black text-[#0B5D3B] text-sm">"Identify. Improve. Excel."</span>
        </div>
        <p className="text-xs font-semibold text-[#66736C]">Personalized learning diagnostics powered by LearnHub AI</p>
      </div>
    </div>
  );
}
