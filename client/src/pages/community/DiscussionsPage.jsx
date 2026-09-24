import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { MessageSquare, ThumbsUp, Plus, User, CheckCircle2, X, Send } from 'lucide-react';

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Question Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [content, setContent] = useState('');

  // Active Discussion Modal State
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/discussions');
      setDiscussions(res.data?.data?.discussions || []);
    } catch (err) {
      toast.error('Could not load forum discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      const res = await axiosClient.post('/discussions', {
        title,
        category,
        content
      });
      toast.success('Discussion thread posted!');
      setDiscussions([res.data?.data?.discussion, ...discussions]);
      setIsModalOpen(false);
      setTitle('');
      setContent('');
    } catch (err) {
      toast.error('Failed to post discussion');
    }
  };

  const handleUpvote = async (discussionId, e) => {
    e.stopPropagation();
    try {
      const res = await axiosClient.post(`/discussions/${discussionId}/upvote`);
      setDiscussions((prev) =>
        prev.map((d) => (d._id === discussionId ? { ...d, upvotes: res.data?.data?.upvotes } : d))
      );
      toast.success('Upvoted!');
    } catch (err) {
      toast.error('Could not upvote');
    }
  };

  const handleOpenDiscussion = async (discussion) => {
    setActiveDiscussion(discussion);
    try {
      const res = await axiosClient.get(`/discussions/${discussion._id}`);
      setComments(res.data?.data?.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeDiscussion) return;

    try {
      const res = await axiosClient.post(`/discussions/${activeDiscussion._id}/comments`, {
        content: newComment
      });
      toast.success('Comment posted!');
      setComments([...comments, res.data?.data?.comment]);
      setNewComment('');
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card-paper bg-gradient-to-r from-[#1C252E] to-[#141A21] text-white p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Discussions & Q&A Forum</h1>
          <p className="text-sm text-gray-300 mt-1">Ask questions, share solutions, upvote responses, and collaborate.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 text-xs py-3 px-5">
          <Plus className="h-4 w-4" />
          <span>Ask Question</span>
        </button>
      </div>

      {/* Discussion List */}
      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading discussions...</div>
      ) : discussions.length === 0 ? (
        <div className="card-paper text-center py-12 space-y-3">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">No Discussions Posted Yet</h3>
          <p className="text-xs text-gray-500">Click "Ask Question" above to start the first conversation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((d) => (
            <div
              key={d._id}
              onClick={() => handleOpenDiscussion(d)}
              className="card-paper space-y-3 hover:shadow-dropdown transition cursor-pointer border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <span className="badge-soft-info text-xs font-bold">{d.category || 'General'}</span>
                <span className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>

              <h3 className="font-extrabold text-gray-900 text-lg">{d.title}</h3>
              <p className="text-xs text-gray-600 line-clamp-2">{d.content}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <button
                  onClick={(e) => handleUpvote(d._id, e)}
                  className="flex items-center gap-1.5 font-bold text-gray-700 hover:text-primary-main"
                >
                  <ThumbsUp className="h-4 w-4 text-primary-main" />
                  <span>{d.upvotes || 0} Upvotes</span>
                </button>
                <span className="flex items-center gap-1.5 font-semibold text-gray-500">
                  <MessageSquare className="h-4 w-4" />
                  <span>{d.commentCount || 0} Comments</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating Discussion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg card-paper space-y-4 bg-white p-6 rounded-2xl shadow-dialog">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Ask Forum Question</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscussion} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How do I optimize MongoDB query performance?"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-primary-main"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Database Systems">Database Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Detailed Explanation</label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your issue or conceptual question in detail..."
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-primary-main"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-2 px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-6">
                  Post Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discussion Detail & Comments Slide-over Modal */}
      {activeDiscussion && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 p-0">
          <div className="w-full max-w-2xl h-full bg-white p-6 space-y-4 overflow-y-auto flex flex-col justify-between shadow-dialog">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="badge-soft-info text-xs font-bold">{activeDiscussion.category}</span>
                <button onClick={() => setActiveDiscussion(null)} className="text-gray-400 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900">{activeDiscussion.title}</h2>
              <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-800 leading-relaxed">
                {activeDiscussion.content}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <h4 className="font-bold text-gray-900 text-sm">Thread Comments ({comments.length})</h4>
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No comments yet. Post the first response below.</p>
                ) : (
                  <div className="space-y-2">
                    {comments.map((c, i) => (
                      <div key={i} className="p-3 bg-gray-100 rounded-xl text-xs space-y-1">
                        <p className="font-bold text-gray-800">{c.author?.firstName || 'User'}</p>
                        <p className="text-gray-700">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="pt-4 border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment or answer..."
                className="flex-1 rounded-xl bg-gray-100 py-2.5 px-4 text-xs text-gray-800 outline-none"
              />
              <button type="submit" className="btn-primary py-2.5 px-4 text-xs flex items-center gap-1 shrink-0">
                <span>Post</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
