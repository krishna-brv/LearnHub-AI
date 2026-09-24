import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axiosClient from '../../api/axiosClient';
import { updateUser } from '../../store/authSlice';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Save } from 'lucide-react';

export default function UserProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    headline: user?.profile?.headline || '',
    bio: user?.profile?.bio || '',
    careerGoal: user?.studentProfile?.careerGoal || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.put('/users/profile', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        profile: { headline: formData.headline, bio: formData.bio },
        studentProfile: { careerGoal: formData.careerGoal }
      });
      dispatch(updateUser(res.data?.data?.user));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="card-paper bg-gradient-to-r from-[#1C252E] to-[#141A21] text-white p-8 space-y-2">
        <h1 className="text-3xl font-extrabold text-white">My Account Profile</h1>
        <p className="text-sm text-gray-300">Manage your profile details, career goals, and preferences.</p>
      </div>

      <div className="card-paper space-y-6">
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
          <img
            src={user?.profile?.avatar || '/default-avatar.png'}
            alt={user?.firstName}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-primary-main/20"
          />
          <div>
            <h3 className="font-bold text-gray-900 text-xl">{user?.firstName} {user?.lastName}</h3>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="badge-soft-info mt-1.5 capitalize inline-block">{user?.role} Account</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">First Name</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-primary-main"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-primary-main"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Professional Headline</label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g. Aspiring Full-Stack Developer"
              className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-primary-main"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Career Goal</label>
            <input
              type="text"
              value={formData.careerGoal}
              onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full rounded-xl border border-gray-200 p-2.5 text-sm outline-none focus:border-primary-main"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Bio</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Write a brief intro..."
              className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-primary-main"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-6 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
