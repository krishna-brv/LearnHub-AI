import React, { useState, useEffect, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import {
  BrainCircuit,
  Sparkles,
  Send,
  CheckCircle2,
  Award,
  Play,
  Mic,
  MicOff,
  Trash2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Check,
  TrendingUp,
  BookOpen
} from 'lucide-react';

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

export default function AIMockInterviewPage() {
  const [session, setSession] = useState(null);
  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // Microphone Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Format seconds as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setRecordingTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please type your answer directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let baseAnswer = answer;

      recognition.onstart = () => {
        setIsListening(true);
        startTimer();
        toast.success('Microphone active. Speak your answer now!');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          currentTranscript += transcriptChunk;
        }

        if (currentTranscript.trim()) {
          const space = baseAnswer && !baseAnswer.endsWith(' ') ? ' ' : '';
          setAnswer(baseAnswer + space + currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast.error(`Microphone error: ${event.error}`);
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopTimer();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      toast.error('Could not initialize microphone recognition');
      setIsListening(false);
      stopTimer();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore already stopped error
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    stopTimer();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const [questionCount, setQuestionCount] = useState(5);

  const handleStart = async () => {
    if (!jobRole.trim()) {
      toast.error('Please enter a target job role to start');
      return;
    }
    setLoading(true);
    setEvaluation(null);
    try {
      const res = await axiosClient.post('/ai/interview/start', {
        jobRole: jobRole.trim(),
        difficulty,
        questionCount
      });
      setSession(res.data?.data?.session);
      toast.success('Mock Interview session started!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Could not start mock interview session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || loading) return;

    if (isListening) {
      stopListening();
    }

    setLoading(true);
    try {
      const res = await axiosClient.post(`/ai/interview/${session._id}/evaluate`, {
        questionIndex: session.currentQuestionIndex,
        answer: answer.trim()
      });

      setEvaluation(res.data?.data?.evaluation);
      setSession(res.data?.data?.session);
      setAnswer('');
      toast.success('Answer evaluated by AI!');
    } catch (err) {
      console.error(err);
      toast.error('Answer evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    stopListening();
    setSession(null);
    setEvaluation(null);
    setAnswer('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl space-y-4 shadow-soft border border-[#06452C]">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#DDF1E5] px-3.5 py-1 text-xs font-black text-[#0B5D3B]">
          <BrainCircuit className="h-4 w-4" />
          <span>AI TECHNICAL INTERVIEW SIMULATOR</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          AI Mock Interview & Speech Evaluator
        </h1>
        <p className="text-xs font-medium text-[#DDF1E5] max-w-2xl leading-relaxed">
          Practice technical interview questions using your microphone or keyboard. Get instant AI scoring, communication feedback, and ideal answers.
        </p>

        {/* Start Interview Setup Form */}
        {!session && (
          <div className="pt-4 space-y-4 max-w-2xl border-t border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-gray-300 uppercase">Target Job Role</label>
                <input
                  type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder="e.g. MERN Full-Stack Developer"
                  className="w-full rounded-xl bg-white/10 px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-main border border-white/10"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-300 uppercase">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-main border border-gray-700"
                >
                  <option value="beginner">Entry / Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Senior / Advanced</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-300 uppercase">Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded-xl bg-gray-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-primary-main border border-gray-700"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-main/20"
            >
              <span>{loading ? 'Generating Interview Questions...' : 'Start Interview Session'}</span>
              <Play className="h-4 w-4 fill-white" />
            </button>
          </div>
        )}
      </div>

      {/* Active Session Question Player */}
      {session && session.status === 'in_progress' && (
        <div className="card-paper p-8 space-y-6 bg-white border border-gray-200/80 rounded-2xl shadow-md">
          {/* Header Info */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary-50 text-primary-main border border-primary-200/60 text-xs font-black rounded-lg uppercase">
                Question {session.currentQuestionIndex + 1} of {session.totalQuestions}
              </span>
              <span className="text-xs text-gray-500 font-bold uppercase">{session.jobRole} ({session.difficulty})</span>
            </div>

            <button
              onClick={handleResetSession}
              className="text-xs text-gray-400 hover:text-gray-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Quit / Restart</span>
            </button>
          </div>

          {/* Current Question Text */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100/70 rounded-2xl border border-gray-200/80 space-y-2">
            <div className="text-xs font-extrabold text-primary-main uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              <span>TECHNICAL INTERVIEW QUESTION</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg sm:text-xl leading-snug">
              {session.questions[session.currentQuestionIndex]?.text}
            </h3>
            {session.questions[session.currentQuestionIndex]?.category && (
              <span className="inline-block text-[11px] font-semibold text-gray-500 bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                Category: {session.questions[session.currentQuestionIndex].category}
              </span>
            )}
          </div>

          {/* Answer Input & Voice Audio Recorder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-gray-700 tracking-wider">
                Your Answer (Speak via Mic or Type Below):
              </label>

              {answer && (
                <button
                  onClick={() => setAnswer('')}
                  className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear Text</span>
                </button>
              )}
            </div>

            {/* Microphone Recording Controls Toolbar */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-200'
                      : 'bg-primary-main hover:bg-primary-dark text-white'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      <span>Stop Recording ({formatTime(recordingTime)})</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      <span>{answer ? 'Continue Voice Input' : 'Start Microphone Answer'}</span>
                    </>
                  )}
                </button>

                {isListening && (
                  <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                    <span>Listening to microphone... Speak clearly</span>
                  </div>
                )}
              </div>

              {!SpeechRecognition && (
                <span className="text-xs text-amber-600 font-medium">
                  (Voice input unavailable in this browser — type answer below)
                </span>
              )}
            </div>

            {/* Textarea */}
            <textarea
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer will automatically transcribe here as you speak into your microphone, or you can type directly..."
              className="w-full rounded-xl border border-gray-300 p-4 text-sm text-gray-800 outline-none focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all resize-y font-normal"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmitAnswer}
            disabled={loading || !answer.trim()}
            className="w-full py-3.5 px-6 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-main/20 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{loading ? 'Evaluating Response with AI...' : 'Submit Answer for AI Evaluation'}</span>
          </button>
        </div>
      )}

      {/* Answer Evaluation Feedback */}
      {evaluation && (
        <div className="card-paper p-8 space-y-6 bg-white border border-gray-200/80 rounded-2xl shadow-md border-l-4 border-l-primary-main animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2.5">
              <Award className="h-6 w-6 text-amber-500" />
              <span>AI Evaluation & Feedback</span>
            </h4>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Score:</span>
              <span className={`px-3 py-1 text-sm font-black rounded-lg ${
                evaluation.score >= 8
                  ? 'bg-emerald-100 text-emerald-800'
                  : evaluation.score >= 5
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {evaluation.score} / 10
              </span>
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase text-gray-500 tracking-wider">Interviewer Assessment</h5>
            <p className="text-sm text-gray-800 bg-gray-50 p-4 rounded-xl leading-relaxed border border-gray-200/60 font-medium">
              {evaluation.feedback}
            </p>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluation.strengths && evaluation.strengths.length > 0 && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-xl space-y-2">
                <h5 className="text-xs font-bold uppercase text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Key Strengths</span>
                </h5>
                <ul className="space-y-1 text-xs text-emerald-900 font-medium">
                  {evaluation.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl space-y-2">
                <h5 className="text-xs font-bold uppercase text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Areas to Improve</span>
                </h5>
                <ul className="space-y-1 text-xs text-amber-900 font-medium">
                  {evaluation.weaknesses.map((wk, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                      <span>{wk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Ideal Response Reference */}
          {evaluation.idealAnswer && (
            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold uppercase text-indigo-700 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>Ideal Model Response</span>
              </h5>
              <div className="p-4 bg-indigo-50/60 border border-indigo-200/60 rounded-xl text-xs text-indigo-950 leading-relaxed font-mono">
                {evaluation.idealAnswer}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Session Summary */}
      {session && session.status === 'completed' && (
        <div className="card-paper p-8 space-y-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200/80 rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900">Mock Interview Completed!</h3>
            <p className="text-sm text-gray-600">
              You answered all {session.totalQuestions} questions for the {session.jobRole} role.
            </p>
          </div>

          {session.evaluation && (
            <div className="p-6 bg-white border border-gray-200 rounded-2xl max-w-lg mx-auto space-y-3 shadow-xs">
              <div className="text-xs font-bold text-gray-500 uppercase">Overall Average Score</div>
              <div className="text-4xl font-black text-primary-main">
                {session.evaluation.overallScore} / 10
              </div>
              <p className="text-xs text-gray-700 font-medium">
                {session.evaluation.overallFeedback}
              </p>
            </div>
          )}

          <button
            onClick={handleResetSession}
            className="px-6 py-3 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-all inline-flex items-center gap-2 shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Start Another Practice Session</span>
          </button>
        </div>
      )}
    </div>
  );
}
