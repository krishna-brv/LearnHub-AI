import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Users, Calendar, Video, CheckCircle, Plus, X, Clock } from 'lucide-react';

export default function MentoringPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scheduling Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState('one_on_one');
  const [meetingLink, setMeetingLink] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/mentors/sessions/upcoming');
      setSessions(res.data?.data?.sessions || []);
    } catch (err) {
      toast.error('Could not fetch mentoring sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    if (!title.trim() || !scheduledAt) return;

    try {
      const res = await axiosClient.post('/mentors/sessions', {
        title,
        scheduledAt,
        duration: parseInt(duration, 10),
        type,
        requestedBy: 'student'
      });
      toast.success('Mentoring session scheduled!');
      setSessions([...sessions, res.data?.data?.session]);
      setIsModalOpen(false);
      setTitle('');
      setScheduledAt('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not schedule session');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-paper bg-gradient-to-r from-[#1C252E] to-[#141A21] text-white p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Mentoring & 1-on-1 Coaching</h1>
          <p className="text-sm text-gray-300 mt-1">Book and manage 1-on-1 mentoring sessions with industry coaches.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 text-xs py-3 px-5">
          <Plus className="h-4 w-4" />
          <span>Book Mentoring Session</span>
        </button>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading mentoring sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="card-paper text-center py-12 space-y-3">
          <Users className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">No Scheduled Sessions</h3>
          <p className="text-xs text-gray-500">Click "Book Mentoring Session" to schedule a 1-on-1 code review or career chat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((s) => (
            <div key={s._id} className="card-paper space-y-3 hover:shadow-dropdown transition border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="badge-soft-info uppercase text-[10px] font-bold">{s.type || '1-on-1'}</span>
                <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary-main" /> {s.duration || 30} mins
                </span>
              </div>

              <h4 className="font-bold text-gray-900 text-lg">{s.title || '1-on-1 Coaching'}</h4>
              
              <div className="space-y-1 text-xs text-gray-600">
                <p className="flex items-center gap-1.5 font-semibold text-gray-800">
                  <Calendar className="h-4 w-4 text-primary-main" />
                  <span>Scheduled: {new Date(s.scheduledAt).toLocaleString()}</span>
                </p>
                {s.meetingLink && (
                  <p className="flex items-center gap-1.5 text-info-dark font-bold">
                    <Video className="h-4 w-4" />
                    <a href={s.meetingLink} target="_blank" rel="noreferrer" className="hover:underline">
                      Join Video Meeting Call
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Booking Session */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg card-paper space-y-4 bg-white p-6 rounded-2xl shadow-dialog">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Book 1-on-1 Mentoring Session</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSession} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Session Topic / Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. MERN Stack Code Review & Architecture Chat"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-primary-main"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-primary-main"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Duration (minutes)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Session Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none"
                  >
                    <option value="one_on_one">1-on-1 Mentoring</option>
                    <option value="review">Code Review</option>
                    <option value="goal_setting">Goal Setting</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-info-light/30 rounded-xl text-xs text-info-dark flex items-start gap-2">
                <Video className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Your assigned mentor/faculty will review your request and provide the video meeting call link (Google Meet / Zoom).</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-2 px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-6">
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
