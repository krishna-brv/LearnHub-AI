import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Bookmark, Plus, Trash2, ArrowRight, X } from 'lucide-react';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/bookmarks');
      setBookmarks(res.data?.data?.bookmarks || []);
    } catch (err) {
      toast.error('Could not fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBookmark = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await axiosClient.post('/bookmarks', {
        title,
        url,
        note,
        itemModel: 'Lesson'
      });
      toast.success('Bookmark saved!');
      setBookmarks([res.data?.data?.bookmark, ...bookmarks]);
      setIsModalOpen(false);
      setTitle('');
      setUrl('');
      setNote('');
    } catch (err) {
      toast.error('Failed to save bookmark');
    }
  };

  const handleDeleteBookmark = async (id) => {
    try {
      await axiosClient.delete(`/bookmarks/${id}`);
      toast.success('Bookmark removed');
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      toast.error('Could not delete bookmark');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="card-paper bg-[#0B5D3B] text-white p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft border border-[#06452C]">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Saved Bookmarks</h1>
          <p className="text-xs font-medium text-[#DDF1E5] mt-1">Bookmark important lessons, external resources, and notes.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-orange flex items-center gap-2 text-xs py-3 px-5 font-black shrink-0">
          <Plus className="h-4 w-4" />
          <span>Add New Bookmark</span>
        </button>
      </div>

      {/* Bookmarks List */}
      {loading ? (
        <div className="p-8 text-center text-gray-400">Loading saved bookmarks...</div>
      ) : bookmarks.length === 0 ? (
        <div className="card-paper text-center py-12 space-y-3">
          <Bookmark className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="font-bold text-gray-800 text-lg">No Bookmarks Saved</h3>
          <p className="text-xs text-gray-500">Click "Add New Bookmark" to save links and resources for easy review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map((b) => (
            <div key={b._id} className="card-paper flex items-start justify-between gap-4 hover:shadow-dropdown transition border border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-primary-main shrink-0" />
                  <h4 className="font-bold text-gray-900 text-base">{b.title || 'Saved Resource'}</h4>
                </div>
                {b.note && <p className="text-xs text-gray-600">{b.note}</p>}
                {b.url && (
                  <a href={b.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary-main hover:underline inline-block pt-1">
                    Open Saved Resource →
                  </a>
                )}
              </div>

              <button onClick={() => handleDeleteBookmark(b._id)} className="text-gray-400 hover:text-error-main shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Bookmark Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg card-paper space-y-4 bg-white p-6 rounded-2xl shadow-dialog">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">Add New Bookmark</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBookmark} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. React 18 Documentation Reference"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-primary-main"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Resource URL (Optional)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. https://react.dev"
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-primary-main"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Personal Note</label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a quick reminder note..."
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-primary-main"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-2 px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-6">
                  Save Bookmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
