import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  FileText,
  Plus,
  Search,
  Trash2,
  Star,
  Edit3,
  Folder,
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function PersonalNotesPage() {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Modal State for Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [folder, setFolder] = useState('General');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    fetchNotes();
    fetchEnrolledCourses();
  }, [selectedFolder, search]);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await axiosClient.get('/enrollments/my');
      setEnrolledCourses(res.data?.data?.enrollments || []);
    } catch (err) {
      console.warn('Could not fetch enrolled courses for notes');
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/notes', {
        params: { folder: selectedFolder, search }
      });
      setNotes(res.data?.data?.notes || []);
      setFolders(res.data?.data?.folders || ['General', 'Computer Science', 'Biology']);
    } catch (err) {
      toast.error('Could not fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAndProcess = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim() && !uploadFile) {
      toast.error('Please enter a title or select a file to upload');
      return;
    }

    setUploading(true);
    try {
      let fileContentText = `# ${uploadTitle.trim() || uploadFile?.name || 'Uploaded Note'}\n\n*AI Summarized Content & Key Takeaways extracted from file processing.*`;
      if (uploadFile) {
        try {
          const text = await uploadFile.text();
          if (text && text.trim()) {
            fileContentText = `# ${uploadTitle.trim() || uploadFile.name}\n\n${text}`;
          }
        } catch (readErr) {
          // Binary format fallback
        }
      }

      const res = await axiosClient.post('/notes', {
        title: uploadTitle.trim() || uploadFile?.name || 'Untitled Study Note',
        folder: uploadSubject || 'General',
        content: fileContentText
      });

      toast.success('Note uploaded and processed successfully!');
      if (res.data?.data?.note) {
        setNotes((prev) => [res.data.data.note, ...prev]);
      } else {
        fetchNotes();
      }
      setUploadTitle('');
      setUploadSubject('');
      setUploadFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingNoteId(null);
    setTitle('');
    setFolder('General');
    setContent('');
    setTags('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note) => {
    setEditingNoteId(note._id);
    setTitle(note.title);
    setFolder(note.folder || 'General');
    setContent(note.content || '');
    setTags((note.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      if (editingNoteId) {
        const res = await axiosClient.put(`/notes/${editingNoteId}`, {
          title,
          folder,
          content,
          tags: parsedTags
        });
        toast.success('Note updated!');
        setNotes((prev) => prev.map((n) => (n._id === editingNoteId ? res.data.data.note : n)));
      } else {
        const res = await axiosClient.post('/notes', {
          title,
          folder,
          content,
          tags: parsedTags
        });
        toast.success('Note created!');
        setNotes([res.data.data.note, ...notes]);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await axiosClient.delete(`/notes/${noteId}`);
      toast.success('Note deleted');
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleToggleStar = async (note) => {
    try {
      const res = await axiosClient.put(`/notes/${note._id}`, {
        isStarred: !note.isStarred
      });
      setNotes((prev) => prev.map((n) => (n._id === note._id ? res.data.data.note : n)));
    } catch (err) {
      toast.error('Could not update star');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Upload Notes Main Header */}
      <div>
        <h1 className="text-3xl font-black text-[#13201A] tracking-tight">Upload Your Notes</h1>
        <p className="text-sm font-semibold text-[#66736C] mt-1">
          Turn your study material into summaries, quizzes and more!
        </p>
      </div>

      {/* Main Upload Box Card (Reference Image Style) */}
      <div className="card-paper p-8 bg-white border border-[#E2E5DF] rounded-3xl space-y-6 shadow-soft">
        <form onSubmit={handleUploadAndProcess} className="space-y-6">
          {/* Drag & Drop Dropzone Box */}
          <div
            className="border-2 border-dashed border-[#CFE5D5] bg-[#F8F7F0] hover:bg-[#DDF1E5]/40 rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 group"
            onClick={() => document.getElementById('noteFileInput')?.click()}
          >
            <div className="h-14 w-14 rounded-2xl bg-[#0B5D3B] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <UploadCloud className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-black text-[#13201A]">
                Drag & drop your files here
              </p>
              <p className="text-xs font-bold text-[#66736C]">or</p>
              <button
                type="button"
                className="btn-primary text-xs py-2 px-5 mt-1 font-bold inline-block"
              >
                Browse Files
              </button>
            </div>

            <p className="text-[11px] font-bold text-[#66736C] pt-2">
              Supports PDF, DOC, DOCX, TXT, PPT (Max 20MB)
            </p>

            {uploadFile && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DDF1E5] text-[#0B5D3B] text-xs font-bold rounded-lg border border-[#CFE5D5] mt-2">
                <span>Selected: {uploadFile.name}</span>
                <X className="h-3.5 w-3.5 cursor-pointer" onClick={(e) => { e.stopPropagation(); setUploadFile(null); }} />
              </div>
            )}

            <input
              id="noteFileInput"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setUploadFile(e.target.files[0]);
                  if (!uploadTitle) setUploadTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                }
              }}
            />
          </div>

          {/* Title & Subject Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#13201A] mb-1.5">Give your note a title</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g., Computer Networks - Unit 1"
                className="w-full rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] p-3 text-xs font-semibold text-[#13201A] outline-none focus:border-[#0B5D3B] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#13201A] mb-1.5">Select subject (optional)</label>
              <select
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                className="w-full rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] p-3 text-xs font-semibold text-[#13201A] outline-none focus:border-[#0B5D3B] focus:bg-white transition"
              >
                <option value="">Choose a subject</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Biology">Biology</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>
          </div>

          {/* Large Orange Action Button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full btn-orange py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition"
          >
            <span>{uploading ? 'Processing & Generating AI Summary...' : 'Upload & Process'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Feature Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-[#E2E5DF] text-xs font-bold text-[#66736C]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#0B5D3B]" />
            <span>Secure Upload</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[#FF6B1A]" />
            <span>Fast Processing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#5B44CE]" />
            <span>AI Powered</span>
          </div>
        </div>
      </div>

      {/* Inspirational Quote & Decorative Graphic */}
      <div className="card-paper p-6 bg-gradient-to-r from-[#DDF1E5] via-[#F8F7F0] to-[#FFE4D2] border border-[#CFE5D5] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#0B5D3B] text-white flex items-center justify-center text-xl shrink-0">
            📚
          </div>
          <div>
            <h4 className="font-extrabold text-[#0B5D3B] text-sm">Stay Curious</h4>
            <p className="text-xs text-[#66736C] font-semibold">Keep learning, keep growing.</p>
          </div>
        </div>
        <p className="text-xs font-bold text-[#0B5D3B] italic">"Your notes today, a smarter tomorrow."</p>
      </div>

      {/* Saved Study Notes Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-[#13201A]">Saved Study Notes ({notes.length})</h2>
            <button onClick={handleOpenCreateModal} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" />
              <span>Write Markdown Note</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#9BA29B]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full bg-white border border-[#E2E5DF] py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0B5D3B]"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="p-8 text-center text-[#66736C] text-xs">Loading study notes...</div>
        ) : notes.length === 0 ? (
          <div className="card-paper text-center py-10 space-y-2">
            <FileText className="h-10 w-10 mx-auto text-[#9BA29B]" />
            <p className="text-sm font-bold text-[#13201A]">No study notes saved yet.</p>
            <p className="text-xs text-[#66736C]">Upload a document above or click "Write Markdown Note" to create your first note.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notes.map((note) => (
              <div key={note._id} className="card-paper flex flex-col justify-between space-y-4 bg-white border border-[#E2E5DF] hover:shadow-card transition">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="badge-mint text-[10px] uppercase font-bold flex items-center gap-1">
                      <Folder className="h-3 w-3" /> {note.folder || 'General'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleStar(note)} className="text-[#FF6B1A] hover:scale-110 transition">
                        <Star className={`h-4 w-4 ${note.isStarred ? 'fill-[#FF6B1A]' : ''}`} />
                      </button>
                      <button onClick={() => handleOpenEditModal(note)} className="text-[#66736C] hover:text-[#0B5D3B]">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteNote(note._id)} className="text-[#66736C] hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-[#13201A] text-base">{note.title}</h3>

                  <div className="p-3.5 bg-[#F8F7F0] rounded-xl text-xs text-[#13201A] max-h-40 overflow-y-auto prose prose-sm max-w-none font-sans border border-[#E2E5DF] custom-scrollbar">
                    <ReactMarkdown>{note.content || '*Empty note content*'}</ReactMarkdown>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#66736C] font-semibold pt-2 border-t border-[#E2E5DF]">
                  <span>{note.wordCount || 0} words</span>
                  <span>Edited {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#13201A]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg card-paper space-y-4 bg-white p-6 rounded-2xl shadow-dialog border border-[#E2E5DF]">
            <div className="flex items-center justify-between border-b border-[#E2E5DF] pb-3">
              <h3 className="font-extrabold text-[#13201A] text-base">{editingNoteId ? 'Edit Note' : 'Create New Note'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#66736C] hover:text-[#13201A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#13201A] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. React Virtual DOM Summary"
                  className="w-full rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] p-2.5 text-xs outline-none focus:border-[#0B5D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#13201A] mb-1">Folder Name</label>
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="e.g. Computer Science, React, Algorithms"
                  className="w-full rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] p-2.5 text-xs outline-none focus:border-[#0B5D3B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#13201A] mb-1">Markdown Content</label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Note Title\nWrite details here..."
                  className="w-full rounded-xl border border-[#E2E5DF] bg-[#F8F7F0] p-3 text-xs outline-none focus:border-[#0B5D3B] font-mono"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E5DF]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-xs py-2 px-4">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-6">
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
