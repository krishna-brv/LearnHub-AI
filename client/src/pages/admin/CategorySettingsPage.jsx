import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';
import { Settings, Plus, Edit, Trash2, Layers, FolderPlus, X } from 'lucide-react';

export default function CategorySettingsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parent, setParent] = useState('');
  const [icon, setIcon] = useState('Compass');
  const [color, setColor] = useState('#00A76F');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/categories');
      setCategories(res.data?.data?.categories || []);
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setParent('');
    setIcon('Compass');
    setColor('#00A76F');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setParent(cat.parent?._id || cat.parent || '');
    setIcon(cat.icon || 'Compass');
    setColor(cat.color || '#00A76F');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCategory) {
        await axiosClient.put(`/categories/${editingCategory._id}`, {
          name,
          description,
          parent: parent || null,
          icon,
          color
        });
        toast.success('Category updated successfully!');
      } else {
        await axiosClient.post('/categories', {
          name,
          description,
          parent: parent || null,
          icon,
          color
        });
        toast.success('New category created successfully!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save category failed');
    }
  };

  const handleDelete = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axiosClient.delete(`/categories/${catId}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete category failed');
    }
  };

  // Separate parent and subcategories
  const parentCategories = categories.filter((c) => !c.parent);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="card-paper bg-gradient-to-r from-[#1C252E] via-[#16202A] to-[#0D131A] text-white p-8 rounded-2xl shadow-xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-main/20 rounded-xl text-primary-light">
              <Settings className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Category & Domain Management</h1>
          </div>
          <p className="text-sm text-gray-300">Create, organize, and manage course categories, learning domain taxonomies, and subcategories.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 bg-primary-main hover:bg-primary-dark text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-primary-main/20 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Category Tree List */}
      {loading ? (
        <div className="card-paper p-12 text-center text-gray-400">Loading category taxonomy...</div>
      ) : categories.length === 0 ? (
        <div className="card-paper p-12 text-center space-y-3">
          <Layers className="h-12 w-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800 text-base">No categories created yet</h3>
          <button onClick={handleOpenCreateModal} className="btn-primary text-xs">Create First Category</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {parentCategories.map((parentCat) => {
            const subcats = categories.filter(
              (c) => c.parent && (c.parent._id === parentCat._id || c.parent === parentCat._id)
            );

            return (
              <div key={parentCat._id} className="card-paper space-y-4 border border-gray-200/80 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: parentCat.color || '#00A76F' }}></span>
                      <h3 className="font-extrabold text-gray-900 text-lg">{parentCat.name}</h3>
                      <span className="badge-soft-info text-[10px]">{parentCat.courseCount || 0} Courses</span>
                    </div>
                    {parentCat.description && (
                      <p className="text-xs text-gray-500 max-w-2xl">{parentCat.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(parentCat)}
                      className="p-2 text-gray-400 hover:text-primary-main transition"
                      title="Edit Category"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(parentCat._id)}
                      className="p-2 text-gray-400 hover:text-error-main transition"
                      title="Delete Category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Subcategories ({subcats.length})</p>
                  {subcats.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No subcategories under this domain.</p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {subcats.map((sub) => (
                        <div key={sub._id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 border border-gray-200">
                          <span>{sub.name}</span>
                          <button onClick={() => handleOpenEditModal(sub)} className="text-gray-400 hover:text-primary-main">
                            <Edit className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleDelete(sub._id)} className="text-gray-400 hover:text-error-main">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-lg">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & ML"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-sm outline-none focus:border-primary-main"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Parent Category (Optional)</label>
                <select
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold"
                >
                  <option value="">None (Top-Level Primary Domain)</option>
                  {parentCategories
                    .filter((c) => !editingCategory || c._id !== editingCategory._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Icon Name</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="e.g. Globe, Cpu, Database"
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs outline-none focus:border-primary-main"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Brand Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 rounded-xl border border-gray-300 p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of courses under this domain..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs outline-none focus:border-primary-main resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-primary-main text-white font-bold rounded-xl text-xs shadow-md">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
