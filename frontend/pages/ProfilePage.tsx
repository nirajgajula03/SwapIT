import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Badge } from '../types';
import {
  PencilIcon,
  MapPinIcon,
  CoinIcon,
  ItemsIcon,
  SwapsIcon,
  BronzeBadgeIcon,
  SilverBadgeIcon,
  GoldBadgeIcon,
  PlatinumBadgeIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  CameraIcon,
} from '../components/Icons';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    dob: '',
    avatarUrl: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        location: currentUser.location || '',
        dob: currentUser.dob || '',
        avatarUrl: currentUser.avatarUrl || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSaving(true);

    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        dob: formData.dob,
        avatarUrl: formData.avatarUrl.trim(),
      });
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not save profile changes. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderBadgeIcon = (badge?: Badge) => {
    switch (badge) {
      case 'Platinum':
        return <PlatinumBadgeIcon className="w-6 h-6" />;
      case 'Gold':
        return <GoldBadgeIcon className="w-6 h-6" />;
      case 'Silver':
        return <SilverBadgeIcon className="w-6 h-6" />;
      case 'Bronze':
      default:
        return <BronzeBadgeIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="rounded-3xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#2A67C9] bg-gray-100 dark:bg-gray-800 shadow-md">
                <img
                  src={
                    currentUser?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser?.name || 'User avatar'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white dark:bg-[#001233] shadow-md">
                {renderBadgeIcon(currentUser?.badge)}
              </div>
            </div>

            {/* Name & Username */}
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-[#001233] dark:text-[#EFEFDE]">
                  {currentUser?.name || 'Trader'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E9D8A6] text-[#001233]">
                  {currentUser?.badge || 'Bronze'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                @{currentUser?.username || 'user'}
              </p>
              {currentUser?.location && (
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-gray-500 dark:text-gray-400 pt-1">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  <span>{currentUser.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Edit Button */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#001845] hover:bg-gray-200 dark:hover:bg-gray-700 text-[#001233] dark:text-[#EFEFDE] text-xs font-bold transition cursor-pointer"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 text-center">
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#001845]/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              SwapCoins
            </span>
            <div className="flex items-center justify-center gap-1 font-black text-xl text-[#EE9B00]">
              <CoinIcon className="w-5 h-5" />
              <span>{currentUser?.coins ?? 0}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#001845]/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Items Listed
            </span>
            <div className="flex items-center justify-center gap-1 font-black text-xl text-[#2A67C9]">
              <ItemsIcon className="w-5 h-5" />
              <span>{currentUser?.itemsListed ?? 0}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#001845]/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Trades Completed
            </span>
            <div className="flex items-center justify-center gap-1 font-black text-xl text-emerald-600 dark:text-emerald-400">
              <SwapsIcon className="w-5 h-5" />
              <span>{currentUser?.swapsCompleted ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" completed={true} />
          ) : (
            <AlertTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Edit Form or Information Card */}
      <div className="rounded-3xl bg-white dark:bg-[#001233] border border-gray-200 dark:border-gray-800 p-6 sm:p-8 shadow-sm">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-5">
            <h3 className="text-lg font-bold text-[#001233] dark:text-[#EFEFDE] border-b border-gray-100 dark:border-gray-800 pb-3">
              Edit Your Profile Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Location (City, Country)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Seattle, WA"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
                />
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Avatar Image URL
              </label>
              <div className="relative">
                <CameraIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  name="avatarUrl"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#001845] border border-gray-300 dark:border-gray-700 text-[#001233] dark:text-[#EFEFDE] text-sm focus:outline-none focus:ring-2 focus:ring-[#2A67C9]"
                />
              </div>

              {/* Quick avatar choices */}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-gray-400">Presets:</span>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, avatarUrl: preset }))}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 hover:border-[#2A67C9] transition cursor-pointer"
                  >
                    <img src={preset} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Form actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#001845] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#2A67C9] hover:bg-[#2356a8] disabled:opacity-60 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#001233] dark:text-[#EFEFDE] border-b border-gray-100 dark:border-gray-800 pb-3">
              Account Details
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-xs uppercase font-bold text-gray-400">Full Name</dt>
                <dd className="mt-1 font-semibold text-[#001233] dark:text-[#EFEFDE]">
                  {currentUser?.name || 'Not provided'}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase font-bold text-gray-400">Username</dt>
                <dd className="mt-1 font-semibold text-[#001233] dark:text-[#EFEFDE]">
                  @{currentUser?.username || 'user'}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase font-bold text-gray-400">Email Address</dt>
                <dd className="mt-1 font-semibold text-[#001233] dark:text-[#EFEFDE]">
                  {currentUser?.email || 'No email attached'}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase font-bold text-gray-400">Location</dt>
                <dd className="mt-1 font-semibold text-[#001233] dark:text-[#EFEFDE]">
                  {currentUser?.location || 'Unspecified'}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase font-bold text-gray-400">Date of Birth</dt>
                <dd className="mt-1 font-semibold text-[#001233] dark:text-[#EFEFDE]">
                  {currentUser?.dob || 'Not provided'}
                </dd>
              </div>

              <div>
                <dt className="text-xs uppercase font-bold text-gray-400">Member Since</dt>
                <dd className="mt-1 font-semibold text-[#001233] dark:text-[#EFEFDE]">
                  {currentUser?.memberSince
                    ? new Date(currentUser.memberSince).toLocaleDateString()
                    : '2024'}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
