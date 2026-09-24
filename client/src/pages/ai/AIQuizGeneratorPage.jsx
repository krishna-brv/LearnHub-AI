import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Sparkles, CheckCircle2, BookOpen, Send, Plus } from 'lucide-react';

export default function AIQuizGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.post('/ai/quiz-generator/generate', {
        topic,
        difficulty,
        count: parseInt(count, 10)
      });
      setGeneratedQuestions(res.data?.data?.questions || []);
      toast.success('AI Quiz Questions generated!');
    } catch (err) {
      toast.error('AI Quiz generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="card-paper bg-[#0B5D3B] text-white p-8 space-y-3 rounded-3xl shadow-soft border border-[#06452C]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DDF1E5] px-3.5 py-1 text-xs font-black text-[#0B5D3B]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>INSTRUCTOR AI ASSISTANT</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">AI Quiz Question Generator</h1>
        <p className="text-xs font-medium text-[#DDF1E5]">
          Generate structured quiz questions across 7 question types (MCQ, Fill-in-the-Blank, Short Answer, True/False, Coding).
        </p>
      </div>

      {/* Form */}
      <div className="card-paper space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Topic / Subject</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Node.js Middleware Architecture"
              className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-primary-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Question Count</label>
              <input
                type="number"
                min="1"
                max="10"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? 'Generating Questions...' : 'Generate Questions with AI'}</span>
          </button>
        </form>
      </div>

      {/* Generated Questions List */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-lg">Generated Questions ({generatedQuestions.length})</h3>
          <div className="space-y-4">
            {generatedQuestions.map((q, idx) => (
              <div key={idx} className="card-paper space-y-3 border-l-4 border-primary-main">
                <div className="flex items-center justify-between">
                  <span className="badge-soft-info text-xs font-bold">Question {idx + 1} ({q.type})</span>
                  <span className="badge-soft-success uppercase text-[10px]">{q.difficulty}</span>
                </div>
                <h4 className="font-extrabold text-gray-900 text-base">{q.text}</h4>
                <div className="space-y-1.5 pl-3 border-l-2 border-gray-200 text-xs text-gray-700">
                  {(q.options || []).map((opt, oIdx) => (
                    <p key={oIdx} className={opt.isCorrect ? 'font-bold text-success-dark' : ''}>
                      {opt.isCorrect ? '✓ ' : '• '}{opt.text}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
