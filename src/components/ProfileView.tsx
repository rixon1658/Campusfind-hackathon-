import React, { useState } from 'react';
import { Item } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './NotificationToast';
import {
  User,
  Mail,
  School,
  Phone,
  Calendar,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  FileText,
  LogOut,
  Sparkles,
  MapPin,
  Lock,
} from 'lucide-react';

interface ProfileViewProps {
  items: Item[];
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onNavigateToTab: (tab: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  items,
  onOpenReportModal,
  onNavigateToTab,
}) => {
  const { currentUser, updateProfile, logout, openAuthModal } = useAuth();
  const { showToast } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [studentId, setStudentId] = useState(currentUser?.studentId || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [saving, setSaving] = useState(false);

  if (!currentUser) {
    return (
      <div className="p-16 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In to View Profile</h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Manage your campus student profile, contact info, and activity stats.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="mt-6 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
        >
          Sign In / Demo Login
        </button>
      </div>
    );
  }

  const userItems = items.filter(i => i.userId === currentUser.id);
  const returnedCount = userItems.filter(i => i.status === 'returned').length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({
      name: name.trim(),
      studentId: studentId.trim(),
      department: department.trim(),
      phone: phone.trim(),
    });
    setSaving(false);
    if (res.success) {
      showToast('success', 'Profile Updated', 'Your student details were saved.');
      setIsEditing(false);
    } else {
      showToast('error', 'Update Failed', res.error || 'Could not update profile.');
    }
  };

  return (
    <div id="profile-view" className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border-b border-slate-800/80" />

        <div className="relative pt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-xl ring-2 ring-blue-500/30"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{currentUser.name}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Student
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-slate-500" />
                {currentUser.department}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono text-blue-300">
                ID: {currentUser.studentId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="edit-profile-toggle-btn"
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button
              id="profile-signout-btn"
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-white">Update Personal Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Student ID</label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Major</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        ) : (
          /* Profile Details Summary */
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-1 font-medium">Campus Email</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {currentUser.email}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-1 font-medium">Contact Phone</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                {currentUser.phone || 'Not provided'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-500 block mb-1 font-medium">Member Since</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Activity Statistics & Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateToTab('my-posts')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">My Reports</span>
            <FileText className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white">{userItems.length}</span>
            <p className="text-xs text-slate-400 mt-0.5">Total reported items</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Reunited Items</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white">{returnedCount}</span>
            <p className="text-xs text-slate-400 mt-0.5">Marked returned / recovered</p>
          </div>
        </div>

        <div
          onClick={() => onNavigateToTab('messages')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Chats</span>
            <Sparkles className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-extrabold text-white">Active</span>
            <p className="text-xs text-slate-400 mt-0.5">Campus messaging active</p>
          </div>
        </div>
      </div>

      {/* Safety & Protocol Tips */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Campus Lost & Found Best Practices
        </h3>
        <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-slate-100">Meeting Safety:</strong> Coordinate exchanges in public campus areas with
            staff present, such as the Student Union front desk or main library circulation desk.
          </li>
          <li>
            <strong className="text-slate-100">Verification:</strong> Ask the claiming student to unlock devices, match
            stickers, or present student ID matching the name on ID cards or notebooks.
          </li>
          <li>
            <strong className="text-slate-100">Valuables:</strong> High-value items like laptops or wallets can also be
            handed over to Campus Public Safety / Police Lost & Found if unclaimed.
          </li>
        </ul>
      </div>
    </div>
  );
};
