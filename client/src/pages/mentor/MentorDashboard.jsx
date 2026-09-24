import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import {
  Users,
  Target,
  Calendar,
  MessageSquare,
  Plus,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  Send,
  Sliders,
  TrendingUp,
  X,
  Video
} from 'lucide-react';

export default function MentorDashboard() {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [mentees, setMentees] = useState([]);
  const [goals, setGoals] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadStudentMap, setUnreadStudentMap] = useState({});

  // Modal States
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isMeetModalOpen, setIsMeetModalOpen] = useState(false);
  const [isMentorChatModalOpen, setIsMentorChatModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMeetLink, setSessionMeetLink] = useState('');

  // Mentee Chat State
  const [mentorChatConvId, setMentorChatConvId] = useState('');
  const [mentorChatMessages, setMentorChatMessages] = useState([]);
  const [mentorChatInput, setMentorChatInput] = useState('');

  // Form States for Goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [priority, setPriority] = useState('medium');
  const [targetDate, setTargetDate] = useState('');
  const [milestonesText, setMilestonesText] = useState('');

  // Form States for Feedback
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState('progress_review');

  const fetchConversationsUnread = async () => {
    try {
      const res = await axiosClient.get('/messages/conversations');
      const convs = res.data?.data?.conversations || [];
      const unreadMap = {};
      convs.forEach((c) => {
        if (c.unreadCount > 0 && Array.isArray(c.participants)) {
          c.participants.forEach((p) => {
            const pId = p._id || p;
            if (pId && pId !== currentUser?._id) {
              unreadMap[pId] = (unreadMap[pId] || 0) + c.unreadCount;
            }
          });
        }
      });
      setUnreadStudentMap(unreadMap);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchMentorData();
    fetchConversationsUnread();
    const interval = setInterval(() => {
      fetchConversationsUnread();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser?._id]);

  const fetchMentorData = async () => {
    setLoading(true);
    try {
      const [menteesRes, goalsRes, sessionsRes] = await Promise.all([
        axiosClient.get('/mentors/mentees'),
        axiosClient.get('/mentors/goals'),
        axiosClient.get('/mentors/sessions/upcoming')
      ]);
      setMentees(menteesRes.data?.data?.mentees || []);
      setGoals(goalsRes.data?.data?.goals || []);
      setSessions(sessionsRes.data?.data?.sessions || []);
    } catch (err) {
      console.error('Error loading mentor workstation:', err);
      toast.error('Could not fetch mentor workstation data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGoalModal = (student) => {
    setSelectedStudent(student);
    setGoalTitle('');
    setGoalDesc('');
    setPriority('medium');
    setTargetDate('');
    setMilestonesText('');
    setIsGoalModalOpen(true);
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim() || !selectedStudent) return;

    try {
      const milestones = milestonesText
        .split('\n')
        .filter((m) => m.trim())
        .map((m, idx) => ({ title: m.trim(), isCompleted: false, order: idx }));

      const res = await axiosClient.post(`/mentors/mentees/${selectedStudent._id}/goals`, {
        title: goalTitle,
        description: goalDesc,
        priority,
        targetDate: targetDate || null,
        milestones
      });

      toast.success('Mentoring goal created successfully!');
      setGoals([res.data?.data?.goal, ...goals]);
      setIsGoalModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal');
    }
  };

  const handleToggleMilestone = async (goal, milestoneIdx) => {
    try {
      const updatedMilestones = [...(goal.milestones || [])];
      updatedMilestones[milestoneIdx] = {
        ...updatedMilestones[milestoneIdx],
        isCompleted: !updatedMilestones[milestoneIdx].isCompleted
      };

      const res = await axiosClient.put(`/mentors/goals/${goal._id}/progress`, {
        milestones: updatedMilestones
      });

      const updatedGoal = res.data?.data?.goal;
      setGoals((prev) => prev.map((g) => (g._id === goal._id ? updatedGoal : g)));
      toast.success('Milestone updated!');
    } catch (err) {
      toast.error('Failed to update milestone');
    }
  };

  const handleOpenFeedbackModal = (student) => {
    setSelectedStudent(student);
    setFeedbackContent('');
    setFeedbackRating(5);
    setFeedbackType('progress_review');
    setIsFeedbackModalOpen(true);
  };

  const handleOpenMeetModal = (session) => {
    setSelectedSession(session);
    setSessionMeetLink(session.meetingLink || '');
    setIsMeetModalOpen(true);
  };

  const handleUpdateMeetLink = async (e) => {
    e.preventDefault();
    if (!selectedSession || !sessionMeetLink.trim()) return;

    try {
      await axiosClient.put(`/mentors/sessions/${selectedSession._id}/link`, {
        meetingLink: sessionMeetLink.trim()
      });
      toast.success('Google Meet link saved & student notified!');
      setSessions((prev) =>
        prev.map((s) => (s._id === selectedSession._id ? { ...s, meetingLink: sessionMeetLink.trim() } : s))
      );
      setIsMeetModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update meeting link');
    }
  };

  useEffect(() => {
    let timer;
    if (isMentorChatModalOpen && mentorChatConvId) {
      timer = setInterval(() => {
        fetchMentorChatMessages(mentorChatConvId);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isMentorChatModalOpen, mentorChatConvId]);

  const fetchMentorChatMessages = async (convId) => {
    try {
      const res = await axiosClient.get(`/messages/conversations/${convId}`);
      setMentorChatMessages(res.data?.data?.messages || []);
    } catch (err) {
      // silent
    }
  };

  const handleOpenChatWithMentee = async (student) => {
    try {
      const targetId = student._id || (typeof student === 'string' ? student : null);
      if (!targetId) {
        toast.error('Student account ID not found');
        return;
      }

      setUnreadStudentMap((prev) => {
        const copy = { ...prev };
        delete copy[targetId];
        return copy;
      });

      setSelectedStudent(student);
      const res = await axiosClient.post('/messages/conversations', { recipientId: targetId });
      const conv = res.data?.data?.conversation;

      if (!conv || !conv._id) {
        throw new Error('Conversation could not be initialized');
      }

      setMentorChatConvId(conv._id);
      fetchMentorChatMessages(conv._id);
      setIsMentorChatModalOpen(true);
      fetchConversationsUnread();
    } catch (err) {
      console.error('Error launching mentee chat:', err);
      toast.error(err.response?.data?.message || 'Could not open 1-on-1 chat with mentee');
    }
  };

  const handleSendMentorChatMessage = async (e) => {
    e.preventDefault();
    if (!mentorChatInput.trim() || !mentorChatConvId) return;

    try {
      const res = await axiosClient.post(`/messages/conversations/${mentorChatConvId}/messages`, {
        content: mentorChatInput.trim()
      });
      const newMsg = res.data?.data?.message;
      if (newMsg) {
        setMentorChatMessages((prev) => [...prev, newMsg]);
      }
      setMentorChatInput('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackContent.trim() || !selectedStudent) return;

    try {
      await axiosClient.post(`/mentors/mentees/${selectedStudent._id}/feedback`, {
        content: feedbackContent,
        rating: Number(feedbackRating),
        type: feedbackType
      });

      toast.success(`Feedback sent to ${selectedStudent.firstName}!`);
      setIsFeedbackModalOpen(false);
    } catch (err) {
      toast.error('Failed to send feedback');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Mentor Header */}
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl space-y-2 shadow-soft border border-[#06452C]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#DDF1E5] uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>MENTOR WORKSTATION & STUDENT GOALS</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Mentorship & Coaching Hub</h1>
        <p className="text-xs font-medium text-[#DDF1E5] max-w-2xl">
          Track assigned mentees, set structured learning milestones, conduct 1-on-1 coaching sessions, and submit performance reviews.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Assigned Mentees</p>
            <p className="text-2xl font-black text-[#13201A] mt-1">{loading ? '...' : mentees.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#DDF1E5] text-[#0B5D3B] flex items-center justify-center font-bold">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Active Goals</p>
            <p className="text-2xl font-black text-[#13201A] mt-1">{loading ? '...' : goals.length}</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold">
            <Target className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Upcoming 1-on-1s</p>
            <p className="text-2xl font-black text-[#13201A] mt-1">{loading ? '...' : sessions.length}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE4D2] text-[#FF6B1A] font-bold">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        <div className="card-paper flex items-center justify-between bg-white border border-[#E2E5DF]">
          <div>
            <p className="text-xs font-bold uppercase text-[#66736C]">Avg Mentee Pass Rate</p>
            <p className="text-2xl font-black text-[#0B5D3B] mt-1">88%</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDF1E5] text-[#0B5D3B] font-bold">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Mentees & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Mentees & Goals Manager */}
        <div className="lg:col-span-2 space-y-8">
          {/* Assigned Mentees List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-main" />
                <span>My Assigned Mentees</span>
              </h3>
              <span className="text-xs text-gray-500 font-semibold">{mentees.length} Mentees Active</span>
            </div>

            {loading ? (
              <div className="card-paper py-8 text-center text-gray-400">Loading mentees...</div>
            ) : mentees.length === 0 ? (
              <div className="card-paper py-10 text-center text-gray-500 space-y-3">
                <Users className="h-10 w-10 mx-auto text-gray-300" />
                <p className="font-semibold text-sm">No mentees assigned yet.</p>
                <p className="text-xs text-gray-400">Students enrolled in your courses or assigned to your mentorship by the admin will appear here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Course-Wise Groupings */}
                {(() => {
                  const groups = {};
                  const unassigned = [];

                  mentees.forEach((item) => {
                    const c = item.course;
                    if (c && (c._id || typeof c === 'string')) {
                      const cId = c._id ? c._id.toString() : String(c);
                      if (!groups[cId]) {
                        groups[cId] = {
                          course: c,
                          title: c.title || 'Course Mentorship',
                          thumbnail: c.thumbnail || '',
                          items: []
                        };
                      }
                      groups[cId].items.push(item);
                    } else {
                      unassigned.push(item);
                    }
                  });

                  const courseGroupList = Object.values(groups);

                  return (
                    <>
                      {courseGroupList.map((grp, gIdx) => (
                        <div key={gIdx} className="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                              {grp.thumbnail ? (
                                <img src={grp.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-primary-main/10 text-primary-main flex items-center justify-center font-bold text-sm">
                                  📚
                                </div>
                              )}
                              <div>
                                <h4 className="font-extrabold text-gray-900 text-sm">{grp.title}</h4>
                                <span className="text-[11px] text-gray-500 font-semibold">Course Mentorship Roster</span>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-primary-lighter/40 text-primary-dark text-xs font-black rounded-full">
                              {grp.items.length} {grp.items.length === 1 ? 'Mentee' : 'Mentees'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {grp.items.map((item) => {
                              const student = item.student || {};
                              const studentId = student._id || student;
                              const unreadCount = unreadStudentMap[studentId] || 0;
                              return (
                                <div key={item._id} className="card-paper p-4 space-y-3 bg-white border border-gray-100 shadow-xs hover:shadow-dropdown transition">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <img
                                        src={student.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.email}
                                        alt={student.firstName}
                                        className="h-11 w-11 rounded-full object-cover border-2 border-primary-100"
                                      />
                                      {unreadCount > 0 && (
                                        <span
                                          className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"
                                          title={`${unreadCount} unread message(s)`}
                                        />
                                      )}
                                    </div>
                                    <div className="overflow-hidden">
                                      <h5 className="font-bold text-gray-900 text-xs truncate">
                                        {student.firstName} {student.lastName}
                                      </h5>
                                      <p className="text-[11px] text-gray-500 truncate">{student.email}</p>
                                      {student.studentProfile?.careerGoal && (
                                        <span className="inline-block px-2 py-0.5 mt-0.5 bg-primary-50 text-primary-main text-[10px] font-bold rounded-md">
                                          Target: {student.studentProfile.careerGoal}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100">
                                    <button
                                      onClick={() => handleOpenGoalModal(student)}
                                      className="btn-secondary text-[11px] py-1.5 px-1 flex items-center justify-center gap-1"
                                    >
                                      <Target className="h-3.5 w-3.5 text-primary-main" />
                                      <span>Goal</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenFeedbackModal(student)}
                                      className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1"
                                    >
                                      <Send className="h-3.5 w-3.5 text-indigo-600" />
                                      <span>Feedback</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenChatWithMentee(student)}
                                      className={`px-2 py-1.5 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1 ${
                                        unreadCount > 0
                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      <MessageSquare className={`h-3.5 w-3.5 ${unreadCount > 0 ? 'text-white' : 'text-emerald-600'}`} />
                                      <span>Chat {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Direct 1-on-1 Unassigned to specific course */}
                      {unassigned.length > 0 && (
                        <div className="space-y-3 bg-gray-50/60 p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-gray-700" />
                              <h4 className="font-extrabold text-gray-900 text-sm">Direct 1-on-1 Mentoring Roster</h4>
                            </div>
                            <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                              {unassigned.length} {unassigned.length === 1 ? 'Mentee' : 'Mentees'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {unassigned.map((item) => {
                              const student = item.student || {};
                              const studentId = student._id || student;
                              const unreadCount = unreadStudentMap[studentId] || 0;
                              return (
                                <div key={item._id} className="card-paper p-4 space-y-3 bg-white border border-gray-100 shadow-xs hover:shadow-dropdown transition">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <img
                                        src={student.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.email}
                                        alt={student.firstName}
                                        className="h-11 w-11 rounded-full object-cover border-2 border-primary-100"
                                      />
                                      {unreadCount > 0 && (
                                        <span
                                          className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse"
                                          title={`${unreadCount} unread message(s)`}
                                        />
                                      )}
                                    </div>
                                    <div className="overflow-hidden">
                                      <h5 className="font-bold text-gray-900 text-xs truncate">
                                        {student.firstName} {student.lastName}
                                      </h5>
                                      <p className="text-[11px] text-gray-500 truncate">{student.email}</p>
                                      {student.studentProfile?.careerGoal && (
                                        <span className="inline-block px-2 py-0.5 mt-0.5 bg-primary-50 text-primary-main text-[10px] font-bold rounded-md">
                                          Target: {student.studentProfile.careerGoal}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100">
                                    <button
                                      onClick={() => handleOpenGoalModal(student)}
                                      className="btn-secondary text-[11px] py-1.5 px-1 flex items-center justify-center gap-1"
                                    >
                                      <Target className="h-3.5 w-3.5 text-primary-main" />
                                      <span>Goal</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenFeedbackModal(student)}
                                      className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1"
                                    >
                                      <Send className="h-3.5 w-3.5 text-indigo-600" />
                                      <span>Feedback</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenChatWithMentee(student)}
                                      className={`px-2 py-1.5 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1 ${
                                        unreadCount > 0
                                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      <MessageSquare className={`h-3.5 w-3.5 ${unreadCount > 0 ? 'text-white' : 'text-emerald-600'}`} />
                                      <span>Chat {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Active Goals & Milestones */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              <span>Mentee Learning Goals & Milestone Progress</span>
            </h3>

            {goals.length === 0 ? (
              <div className="card-paper py-8 text-center text-gray-400 text-xs">
                No active learning goals configured. Click "Set Goal" on any mentee card above to configure target milestones.
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((g) => {
                  const student = g.student || {};
                  const isCompleted = g.status === 'completed' || g.progress >= 100;

                  return (
                    <div key={g._id} className="card-paper p-5 space-y-3 border border-gray-200/80 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            g.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {g.priority} priority
                          </span>
                          <span className="text-xs text-gray-500 font-semibold">
                            Mentee: {student.firstName} {student.lastName}
                          </span>
                        </div>
                        <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-600' : 'text-primary-main'}`}>
                          {g.progress || 0}% Completed
                        </span>
                      </div>

                      <h4 className="font-extrabold text-gray-900 text-base">{g.title}</h4>
                      {g.description && <p className="text-xs text-gray-500">{g.description}</p>}

                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-primary-main'}`}
                          style={{ width: `${g.progress || 0}%` }}
                        ></div>
                      </div>

                      {/* Milestones Checklist */}
                      {g.milestones && g.milestones.length > 0 && (
                        <div className="pt-2 space-y-2 border-t border-gray-100">
                          <p className="text-xs font-bold text-gray-700">Milestone Checkpoints:</p>
                          <div className="space-y-1.5">
                            {g.milestones.map((m, mIdx) => (
                              <div
                                key={mIdx}
                                onClick={() => handleToggleMilestone(g, mIdx)}
                                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between cursor-pointer transition ${
                                  m.isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span className={m.isCompleted ? 'line-through text-emerald-800 opacity-80' : ''}>
                                  {m.title}
                                </span>
                                <CheckCircle className={`h-4 w-4 ${m.isCompleted ? 'text-emerald-600' : 'text-gray-300'}`} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Sessions Sidebar */}
        <div className="space-y-6">
          <div className="card-paper p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Calendar className="h-5 w-5 text-warning-dark" />
              <span>Upcoming 1-on-1 Sessions</span>
            </h3>

            {sessions.length === 0 ? (
              <p className="text-xs text-gray-400">No scheduled sessions for today.</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s._id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge-soft-info text-[9px] uppercase font-bold">{s.type || '1-on-1'}</span>
                      <span className="text-[10px] text-gray-500 font-semibold">{s.duration || 30} mins</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs">{s.title}</h4>
                    <p className="text-[11px] text-gray-500">
                      📅 {new Date(s.scheduledAt).toLocaleString()}
                    </p>
                    
                    {s.meetingLink ? (
                      <div className="pt-1 flex items-center justify-between gap-2 border-t border-gray-200/60">
                        <a
                          href={s.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-info-dark hover:underline flex items-center gap-1"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Google Meet</span>
                        </a>
                        <button
                          onClick={() => handleOpenMeetModal(s)}
                          className="text-[10px] font-bold text-gray-500 hover:text-gray-900 underline"
                        >
                          Edit Link
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenMeetModal(s)}
                        className="w-full mt-1 py-1.5 px-3 bg-primary-main hover:bg-primary-dark text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1 shadow-xs"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Add Google Meet Link</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Set Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="card-paper w-full max-w-md bg-white p-6 space-y-4 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base">Set Mentoring Goal for {selectedStudent?.firstName}</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master React & Node.js Rest APIs"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full input-field text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Target outcome description..."
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  className="w-full input-field text-xs"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full input-field text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full input-field text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Milestone Checkpoints (One per line)</label>
                <textarea
                  rows="3"
                  placeholder="Complete Module 1\nBuild portfolio project\nSubmit mock quiz"
                  value={milestonesText}
                  onChange={(e) => setMilestonesText(e.target.value)}
                  className="w-full input-field text-xs font-mono"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsGoalModalOpen(false)} className="btn-secondary text-xs px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-5">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="card-paper w-full max-w-md bg-white p-6 space-y-4 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base">Send Feedback to {selectedStudent?.firstName}</h3>
              <button onClick={() => setIsFeedbackModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendFeedback} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Feedback Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full input-field text-xs"
                >
                  <option value="progress_review">Progress Review</option>
                  <option value="performance">Performance</option>
                  <option value="encouragement">Encouragement</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(e.target.value)}
                  className="w-full input-field text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Feedback Content</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Provide constructive feedback, highlight strengths, and mention areas for improvement..."
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  className="w-full input-field text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsFeedbackModalOpen(false)} className="btn-secondary text-xs px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-5">
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Meet Link Modal */}
      {isMeetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="card-paper w-full max-w-md bg-white p-6 space-y-4 shadow-2xl rounded-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Video className="h-5 w-5 text-primary-main" />
                <span>Provide Google Meet Link</span>
              </h3>
              <button onClick={() => setIsMeetModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Paste your Google Meet or Zoom link for session <strong>"{selectedSession?.title}"</strong>. The student will automatically receive an in-app notification with this link.
            </p>

            <form onSubmit={handleUpdateMeetLink} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Meeting URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={sessionMeetLink}
                  onChange={(e) => setSessionMeetLink(e.target.value)}
                  className="w-full input-field text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsMeetModalOpen(false)} className="btn-secondary text-xs px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs px-5 bg-primary-main hover:bg-primary-dark">
                  Save & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-on-1 Mentee Direct Chat Modal */}
      {isMentorChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="card-paper w-full max-w-lg bg-white p-0 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[520px]">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#1C252E] to-[#141A21] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedStudent?.email}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400"
                />
                <div>
                  <h4 className="font-bold text-sm text-white">
                    1-on-1 Chat with {selectedStudent?.firstName} {selectedStudent?.lastName}
                  </h4>
                  <p className="text-[11px] text-gray-300">{selectedStudent?.email}</p>
                </div>
              </div>
              <button onClick={() => setIsMentorChatModalOpen(false)} className="text-gray-300 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {mentorChatMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <MessageSquare className="h-10 w-10 mx-auto text-gray-300" />
                  <p className="text-xs font-semibold text-gray-700">No messages yet with {selectedStudent?.firstName}.</p>
                  <p className="text-[11px] text-gray-400">Send a direct message to guide them in their course!</p>
                </div>
              ) : (
                mentorChatMessages.map((msg) => {
                  const isMe = msg.sender?._id !== selectedStudent?._id;
                  return (
                    <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                        isMe ? 'bg-primary-main text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-xs'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-[9px] text-right ${isMe ? 'text-primary-lighter/80' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMentorChatMessage} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
              <input
                type="text"
                placeholder={`Type message to ${selectedStudent?.firstName}...`}
                value={mentorChatInput}
                onChange={(e) => setMentorChatInput(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 px-3 text-xs outline-none focus:border-primary-main text-gray-800"
              />
              <button
                type="submit"
                disabled={!mentorChatInput.trim()}
                className="p-2.5 bg-primary-main hover:bg-primary-dark text-white rounded-xl transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
