import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import {
  Sparkles,
  HelpCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  BookOpen,
  Brain,
  Check,
  Zap,
  Target
} from 'lucide-react';

const fallbackQuestionsMap = {
  default: [
    {
      text: 'What is the time complexity of accessing an element in an array by index?',
      options: [
        { text: 'O(1)', isCorrect: true },
        { text: 'O(n)', isCorrect: false },
        { text: 'O(log n)', isCorrect: false },
        { text: 'O(n²)', isCorrect: false }
      ],
      explanation: 'Array elements are stored in contiguous memory locations, allowing instant O(1) index access.'
    },
    {
      text: 'Which React Hook is primarily used for managing component state?',
      options: [
        { text: 'useEffect', isCorrect: false },
        { text: 'useState', isCorrect: true },
        { text: 'useContext', isCorrect: false },
        { text: 'useRef', isCorrect: false }
      ],
      explanation: 'useState is the primary hook for adding stateful variables to functional components.'
    },
    {
      text: 'What does REST stand for in web API architecture?',
      options: [
        { text: 'Representational State Transfer', isCorrect: true },
        { text: 'Remote Execution State Tech', isCorrect: false },
        { text: 'Response Transfer Protocol', isCorrect: false },
        { text: 'Realtime Embedded State Token', isCorrect: false }
      ],
      explanation: 'REST (Representational State Transfer) is a stateless client-server web architectural style.'
    },
    {
      text: 'Which data structure follows the Last-In, First-Out (LIFO) order?',
      options: [
        { text: 'Queue', isCorrect: false },
        { text: 'Stack', isCorrect: true },
        { text: 'Array', isCorrect: false },
        { text: 'Binary Tree', isCorrect: false }
      ],
      explanation: 'Stacks push and pop elements from the top, adhering strictly to LIFO order.'
    },
    {
      text: 'What is the HTTP status code returned for successful resource creation?',
      options: [
        { text: '200 OK', isCorrect: false },
        { text: '201 Created', isCorrect: true },
        { text: '204 No Content', isCorrect: false },
        { text: '400 Bad Request', isCorrect: false }
      ],
      explanation: 'HTTP 201 Created indicates that the request succeeded and a new resource was created.'
    }
  ]
};

export default function AIQuizGeneratorPage() {
  const [topic, setTopic] = useState('Data Structures & Algorithms');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);

  // Play Mode State: 'setup' | 'playing' | 'results'
  const [mode, setMode] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeSeconds, setTimeSeconds] = useState(0);

  // Popular preset topics
  const presetTopics = [
    { title: 'Data Structures & Algorithms', icon: Brain, bg: 'bg-[#DDF1E5]', text: 'text-[#0B5D3B]' },
    { title: 'React Hooks & State', icon: Sparkles, bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]' },
    { title: 'JavaScript ES6 & Async', icon: Zap, bg: 'bg-[#FFE4D2]', text: 'text-[#FF6B1A]' },
    { title: 'Node.js & Express REST APIs', icon: Target, bg: 'bg-[#E9E3FF]', text: 'text-[#5B44CE]' },
  ];

  // Timer while playing
  useEffect(() => {
    let timer;
    if (mode === 'playing') {
      timer = setInterval(() => setTimeSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [mode]);

  const handleStartQuiz = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.post('/ai/quiz-generator/generate', {
        topic,
        difficulty,
        count: parseInt(count, 10)
      });
      const fetchedQuestions = res.data?.data?.questions || [];

      if (fetchedQuestions.length > 0) {
        setQuestions(fetchedQuestions);
      } else {
        setQuestions(fallbackQuestionsMap.default.slice(0, count));
      }

      setMode('playing');
      setCurrentIndex(0);
      setUserAnswers({});
      setTimeSeconds(0);
      toast.success('Quiz generated! Let\'s test your knowledge!');
    } catch (err) {
      console.warn('Using local quiz questions fallback.');
      setQuestions(fallbackQuestionsMap.default.slice(0, count));
      setMode('playing');
      setCurrentIndex(0);
      setUserAnswers({});
      setTimeSeconds(0);
      toast.success('Quiz loaded! Good luck!');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setMode('results');
      toast.success('Quiz Completed!');
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const selectedOptIdx = userAnswers[idx];
      if (selectedOptIdx !== undefined && q.options && q.options[selectedOptIdx]) {
        if (q.options[selectedOptIdx].isCorrect) {
          correct += 1;
        }
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / (questions.length || 1)) * 100)
    };
  };

  const scoreData = calculateScore();

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 font-sans">
      {/* Top Banner */}
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl space-y-3 shadow-soft border border-[#06452C]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DDF1E5] px-3.5 py-1 text-xs font-black text-[#0B5D3B]">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>INTERACTIVE QUIZ ARENA</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">AI Quiz Player</h1>
        <p className="text-xs font-medium text-[#DDF1E5]">
          Generate and take real-time interactive quizzes powered by Groq AI. Test your mastery and track your score!
        </p>
      </div>

      {/* MODE 1: SETUP QUIZ */}
      {mode === 'setup' && (
        <div className="space-y-6">
          {/* Preset Topics */}
          <div className="card-paper p-6 space-y-4 bg-white border border-[#E2E5DF]">
            <h3 className="text-sm font-extrabold text-[#13201A]">Popular Topics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presetTopics.map((preset) => {
                const Icon = preset.icon;
                const isSelected = topic === preset.title;
                return (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => setTopic(preset.title)}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#DDF1E5] border-[#0B5D3B] text-[#0B5D3B] font-extrabold ring-1 ring-[#0B5D3B]'
                        : 'bg-[#F8F7F0] border-[#E2E5DF] text-[#13201A] hover:bg-white hover:border-[#CFE5D5]'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-xl ${preset.bg} ${preset.text} flex items-center justify-center shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold leading-tight">{preset.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="card-paper p-6 bg-white border border-[#E2E5DF] space-y-5">
            <form onSubmit={handleStartQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#13201A] mb-1.5">Quiz Topic or Concept</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Dynamic Programming, Closures, React State"
                  className="w-full rounded-2xl border border-[#E2E5DF] bg-[#F8F7F0] p-3 text-xs font-semibold text-[#13201A] outline-none focus:bg-white focus:border-[#0B5D3B] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#13201A] mb-1.5">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-2xl border border-[#E2E5DF] bg-[#F8F7F0] p-3 text-xs font-semibold text-[#13201A] outline-none focus:bg-white focus:border-[#0B5D3B] transition"
                  >
                    <option value="easy">Easy (Fundamentals)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="hard">Hard (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#13201A] mb-1.5">Number of Questions</label>
                  <select
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full rounded-2xl border border-[#E2E5DF] bg-[#F8F7F0] p-3 text-xs font-semibold text-[#13201A] outline-none focus:bg-white focus:border-[#0B5D3B] transition"
                  >
                    <option value="3">3 Questions (Quick Sprint)</option>
                    <option value="5">5 Questions (Standard)</option>
                    <option value="10">10 Questions (Deep Assessment)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-xs font-black flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="h-4 w-4" />
                <span>{loading ? 'Generating Quiz...' : 'Start Interactive Quiz'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODE 2: PLAYING QUIZ */}
      {mode === 'playing' && questions.length > 0 && (
        <div className="card-paper p-6 sm:p-8 bg-white border border-[#E2E5DF] space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-4">
            <div>
              <span className="badge-mint text-[10px] font-extrabold uppercase">{topic}</span>
              <h3 className="text-sm font-extrabold text-[#13201A] mt-1">
                Question {currentIndex + 1} of {questions.length}
              </h3>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-[#F8F7F0] border border-[#E2E5DF] px-3 py-1.5 text-xs font-extrabold text-[#66736C]">
              <Clock className="h-4 w-4 text-[#0B5D3B]" />
              <span>{Math.floor(timeSeconds / 60)}:{(timeSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-[#E2E5DF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0B5D3B] transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="space-y-2 py-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#13201A] leading-snug">
              {questions[currentIndex]?.text}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {(questions[currentIndex]?.options || []).map((opt, oIdx) => {
              const isSelected = userAnswers[currentIndex] === oIdx;
              const optionLabel = String.fromCharCode(65 + oIdx);

              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentIndex, oIdx)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#DDF1E5] border-[#0B5D3B] text-[#0B5D3B] font-extrabold shadow-2xs ring-1 ring-[#0B5D3B]'
                      : 'bg-[#F8F7F0] border-[#E2E5DF] text-[#13201A] hover:bg-white hover:border-[#CFE5D5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-[#0B5D3B] text-white' : 'bg-[#E2E5DF] text-[#66736C]'
                    }`}>
                      {optionLabel}
                    </div>
                    <span className="text-xs sm:text-sm font-bold">{opt.text}</span>
                  </div>

                  {isSelected && <Check className="h-5 w-5 text-[#0B5D3B]" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E2E5DF]">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={handlePrevQuestion}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold border transition ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                  : 'border-[#E2E5DF] text-[#13201A] hover:bg-[#F8F7F0]'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={userAnswers[currentIndex] === undefined}
              onClick={handleNextQuestion}
              className={`btn-primary text-xs py-2.5 px-5 font-black flex items-center gap-1.5 shadow-2xs ${
                userAnswers[currentIndex] === undefined ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <span>{currentIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: RESULTS SUMMARY */}
      {mode === 'results' && (
        <div className="space-y-6">
          {/* Score Header Card */}
          <div className="card-paper p-8 bg-white border border-[#E2E5DF] text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-3xl bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center">
              <Award className="h-9 w-9" />
            </div>

            <div>
              <span className="badge-mint text-xs font-extrabold uppercase">{topic} Quiz Completed</span>
              <h2 className="text-3xl font-black text-[#13201A] tracking-tight mt-1">
                {scoreData.percentage}% Score
              </h2>
              <p className="text-xs text-[#66736C] font-semibold mt-1">
                You answered {scoreData.correct} out of {scoreData.total} questions correctly in {Math.floor(timeSeconds / 60)}m {timeSeconds % 60}s.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMode('setup')}
                className="btn-primary text-xs py-2.5 px-5 font-black flex items-center gap-2 shadow-2xs"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Another Topic</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="card-paper p-6 bg-white border border-[#E2E5DF] space-y-4">
            <h3 className="text-base font-extrabold text-[#13201A]">Question Breakdown & Explanations</h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userSelectedIdx = userAnswers[idx];
                const correctOptIdx = q.options.findIndex((o) => o.isCorrect);
                const isCorrect = userSelectedIdx === correctOptIdx;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isCorrect ? 'bg-[#DDF1E5]/30 border-[#CFE5D5]' : 'bg-red-50/50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#13201A]">Question {idx + 1}</span>
                      <span className={`flex items-center gap-1 text-xs font-bold ${
                        isCorrect ? 'text-[#0B5D3B]' : 'text-red-600'
                      }`}>
                        {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {isCorrect ? 'Correct (+10 XP)' : 'Incorrect'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#13201A]">{q.text}</h4>

                    <div className="space-y-1.5 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isUserChoice = userSelectedIdx === oIdx;
                        const isRightChoice = opt.isCorrect;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${
                              isRightChoice
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                                : isUserChoice
                                ? 'bg-red-100 border-red-300 text-red-900 font-semibold'
                                : 'bg-white border-[#E2E5DF] text-[#66736C]'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}. {opt.text}</span>
                            {isRightChoice && <span className="text-[10px] uppercase font-black">Correct Answer</span>}
                            {!isRightChoice && isUserChoice && <span className="text-[10px] uppercase font-black">Your Choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-[#66736C] bg-white p-2.5 rounded-xl border border-[#E2E5DF] font-semibold italic">
                        💡 <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
