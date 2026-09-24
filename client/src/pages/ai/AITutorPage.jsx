import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Sparkles, Send, Bot, User, BookOpen, CheckCircle, GraduationCap, Target, Zap, Award } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AITutorPage() {
  const [selectedMode, setSelectedMode] = useState('simple');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your **LearnHub AI Tutor**. Choose a learning style above and ask me any question about your courses, code errors, or exam topics!'
    }
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  const learningModes = [
    {
      id: 'eli10',
      title: "Explain Like I'm 10",
      description: 'Simple and easy to understand',
      icon: Zap,
      bgColor: 'bg-[#DDF1E5]',
      accentColor: 'text-[#0B5D3B]',
    },
    {
      id: 'uni',
      title: 'University Level',
      description: 'Detailed and academic',
      icon: GraduationCap,
      bgColor: 'bg-[#E0F2FE]',
      accentColor: 'text-[#0369A1]',
    },
    {
      id: 'exam',
      title: 'Exam Focused',
      description: 'Key points, formulas and exam tips',
      icon: Target,
      bgColor: 'bg-[#FFE4D2]',
      accentColor: 'text-[#FF6B1A]',
    },
    {
      id: 'simple',
      title: 'Simple Explanation',
      description: 'Clear and concise',
      icon: BookOpen,
      bgColor: 'bg-[#E9E3FF]',
      accentColor: 'text-[#5B44CE]',
    },
    {
      id: 'professor',
      title: 'Teach Me Like a Professor',
      description: 'In-depth and conceptual',
      icon: Award,
      bgColor: 'bg-[#FCE7F3]',
      accentColor: 'text-[#9D174D]',
    },
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const currentModeObj = learningModes.find((m) => m.id === selectedMode);
    const userMsg = input.trim();
    setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const modePrompt = `[Learning Mode: ${currentModeObj?.title} - ${currentModeObj?.description}]\n${userMsg}`;
      const res = await axiosClient.post('/ai/tutor/chat', {
        message: modePrompt,
        conversationId
      });

      const { conversationId: newConvId, message: aiMessage } = res.data.data;
      setConversationId(newConvId);
      setMessages((prev) => [...prev, { role: 'assistant', content: aiMessage.content }]);
    } catch (err) {
      toast.error('AI Tutor request failed');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'AI service is temporarily unavailable. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#13201A] tracking-tight">Learn with AI</h1>
        <p className="text-sm font-semibold text-[#66736C] mt-1">
          Select your preferred learning style and get instant conceptual assistance.
        </p>
      </div>

      {/* Learning Modes Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {learningModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-4 rounded-2xl cursor-pointer transition-all flex flex-col justify-between space-y-3 border ${
                isSelected
                  ? 'border-2 border-[#0B5D3B] bg-[#DDF1E5]/60 shadow-card scale-[1.02]'
                  : `${mode.bgColor}/50 border-[#E2E5DF] hover:border-[#CFE5D5] hover:bg-white`
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`h-9 w-9 rounded-xl ${mode.bgColor} ${mode.accentColor} flex items-center justify-center font-bold`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                {isSelected && (
                  <CheckCircle className="h-4 w-4 text-[#0B5D3B]" />
                )}
              </div>

              <div>
                <h3 className="font-extrabold text-[#13201A] text-xs leading-snug">{mode.title}</h3>
                <p className="text-[10px] text-[#66736C] font-semibold mt-0.5 line-clamp-2">{mode.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Container */}
      <div className="h-[520px] flex flex-col card-paper p-0 overflow-hidden bg-white border border-[#E2E5DF] shadow-soft rounded-3xl">
        {/* Chat Sub-header */}
        <div className="flex items-center justify-between p-4 bg-[#F8F7F0] border-b border-[#E2E5DF]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center font-bold shadow-2xs">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="font-extrabold text-xs text-[#13201A]">LearnHub AI Tutor</h2>
              <span className="text-[10px] font-bold text-[#0B5D3B] uppercase">
                Active Mode: {learningModes.find((m) => m.id === selectedMode)?.title}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F7F0]/40 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-xl bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-[#0B5D3B] text-white font-semibold rounded-tr-none'
                    : 'bg-white text-[#13201A] border border-[#E2E5DF] rounded-tl-none prose prose-sm'
                }`}
              >
                {msg.role === 'assistant' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-center text-xs text-[#66736C] font-semibold italic">
              <Bot className="h-4 w-4 text-[#0B5D3B] animate-spin" />
              <span>AI Tutor is preparing explanation in {learningModes.find((m) => m.id === selectedMode)?.title} mode...</span>
            </div>
          )}
        </div>

        {/* Input Box */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#E2E5DF] flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask AI Tutor anything (e.g. 'Explain Async/Await in JavaScript')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl bg-[#F8F7F0] border border-[#E2E5DF] py-3 px-4 text-xs font-semibold text-[#13201A] outline-none focus:border-[#0B5D3B] focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary py-3 px-5 text-xs flex items-center gap-2 font-bold shadow-xs"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
