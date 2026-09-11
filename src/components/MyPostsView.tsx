import React, { useState } from 'react';
import { Item } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './NotificationToast';
import {
  FileText,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  Tag,
  ArrowRight,
  Cloud,
} from 'lucide-react';

interface MyPostsViewProps {
  items: Item[];
  loading: boolean;
  onSelectItem: (item: Item) => void;
  onEditItem: (item: Item) => void;
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onRefreshItems: () => void;
}

export const MyPostsView: React.FC<MyPostsViewProps> = ({
  items,
  loading,
  onSelectItem,
  onEditItem,
  onOpenReportModal,
  onRefreshItems,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found' | 'returned'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="p-16 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In to Manage Your Posts</h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Sign in with your student account to view, edit, mark as returned, or delete items you have reported.
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

  // Filter items created by current user
  const userItems = items.filter(i => i.userId === currentUser.id);

  const filteredUserItems = userItems.filter(item => {
    if (activeTab === 'lost') return item.type === 'lost' && item.status !== 'returned';
    if (activeTab === 'found') return item.type === 'found' && item.status !== 'returned';
    if (activeTab === 'returned') return item.status === 'returned';
    return true;
  });

  const handleDelete = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete your post "${itemName}"?`)) return;

    setDeletingId(itemId);
    try {
      const res = await fetch(`/api/items/${itemId}?userId=${currentUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', 'Post Deleted', `"${itemName}" was removed from the directory.`);
        onRefreshItems();
      } else {
        showToast('error', 'Delete Failed', data.error || 'Could not delete item.');
      }
    } catch {
      showToast('error', 'Network Error', 'Failed to connect to CampusFind server.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleReturnStatus = async (item: Item) => {
    const newStatus = item.status === 'returned' ? 'active' : 'returned';
    try {
      const res = await fetch(`/api/items/${item.id}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          'success',
          newStatus === 'returned' ? 'Item Marked as Returned!' : 'Item Reopened',
          `Updated status for "${item.name}".`
        );
        onRefreshItems();
      } else {
        showToast('error', 'Update Failed', data.error || 'Could not update status.');
      }
    } catch {
      showToast('error', 'Network Error', 'Failed to update status.');
    }
  };

  return (
    <div id="my-posts-view" className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Student Dashboard
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {userItems.length} total {userItems.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Reported Items</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your active lost and found reports, edit descriptions, or mark items as successfully returned.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="myposts-report-lost-btn"
            onClick={() => onOpenReportModal('lost')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Lost
          </button>
          <button
            id="myposts-report-found-btn"
            onClick={() => onOpenReportModal('found')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Report Found
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({userItems.length})
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'lost' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Lost ({userItems.filter(i => i.type === 'lost' && i.status !== 'returned').length})
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'found' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Found ({userItems.filter(i => i.type === 'found' && i.status !== 'returned').length})
        </button>
        <button
          onClick={() => setActiveTab('returned')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'returned' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Returned ({userItems.filter(i => i.status === 'returned').length})
        </button>
      </div>

      {/* Posts List or Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                  <div className="h-5 w-3/4 bg-slate-800 rounded" />
                  <div className="h-3 w-1/2 bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-slate-800/60 rounded" />
              <div className="h-8 w-full bg-slate-800/40 rounded-xl pt-2" />
            </div>
          ))}
        </div>
      ) : filteredUserItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUserItems.map(item => {
            const isLost = item.type === 'lost';
            const isReturned = item.status === 'returned';

            return (
              <div
                key={item.id}
                id={`my-post-item-${item.id}`}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 cursor-pointer group" onClick={() => onSelectItem(item)}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      {item.imageProvider && (
                        <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-slate-950/80 text-[8px] text-sky-400 font-semibold border border-sky-500/30 backdrop-blur-sm flex items-center gap-0.5">
                          <Cloud className="w-2 h-2" />
                          <span>{item.imageProvider === 'cloudinary' ? 'Cloud' : item.imageProvider}</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isLost ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {isLost ? 'Lost' : 'Found'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isReturned
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isReturned ? 'Returned' : 'Active'}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-auto">{item.date}</span>
                      </div>

                      <h3
                        onClick={() => onSelectItem(item)}
                        className="text-sm font-bold text-white hover:text-blue-400 transition-colors cursor-pointer truncate"
                      >
                        {item.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Actions Toolbar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectItem(item)}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Matches & Details
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Mark as returned button */}
                    <button
                      id={`mypost-return-btn-${item.id}`}
                      onClick={() => handleToggleReturnStatus(item)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                        isReturned
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isReturned ? 'Reactivate' : 'Mark Returned'}
                    </button>

                    {/* Edit button */}
                    <button
                      id={`mypost-edit-btn-${item.id}`}
                      onClick={() => onEditItem(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit post"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      id={`mypost-delete-btn-${item.id}`}
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-md mx-auto">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No items reported in this tab</h3>
          <p className="text-xs text-slate-400 mt-1">
            Whenever you post a lost or found item, it will appear here so you can easily manage its status.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => onOpenReportModal('lost')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
            >
              Report Lost Item
            </button>
            <button
              onClick={() => onOpenReportModal('found')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
            >
              Report Found Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
