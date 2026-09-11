import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Item, AIMatchResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './NotificationToast';
import {
  X,
  MapPin,
  Calendar,
  Tag,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Share2,
  Trash2,
  Edit3,
  User,
  School,
  ArrowRight,
  Info,
  Clock,
  ShieldCheck,
  RefreshCw,
  Cloud,
  Maximize2,
  FileImage,
  ExternalLink,
} from 'lucide-react';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onContactPoster: (item: Item) => void;
  onEditItem?: (item: Item) => void;
  onItemUpdated?: () => void;
  onSelectMatchedItem?: (item: Item) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onContactPoster,
  onEditItem,
  onItemUpdated,
  onSelectMatchedItem,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [matches, setMatches] = useState<AIMatchResult[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);

  useEffect(() => {
    if (!item) return;

    // Fetch AI Matches
    setLoadingMatches(true);
    fetch(`/api/items/${item.id}/matches`)
      .then(res => res.json())
      .then(data => {
        if (data.matches) {
          setMatches(data.matches);
        }
      })
      .catch(err => {
        console.error('Failed to load AI matches:', err);
      })
      .finally(() => {
        setLoadingMatches(false);
      });
  }, [item?.id]);

  if (!item) return null;

  const isOwner = currentUser && currentUser.id === item.userId;
  const isLost = item.type === 'lost';
  const isReturned = item.status === 'returned';

  const handleToggleReturned = async () => {
    setStatusUpdating(true);
    const newStatus = isReturned ? 'active' : 'returned';
    try {
      const res = await fetch(`/api/items/${item.id}/return`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          'success',
          newStatus === 'returned' ? 'Item Marked as Returned!' : 'Item Reopened as Active',
          `Status updated for "${item.name}".`
        );
        if (onItemUpdated) onItemUpdated();
        onClose();
      } else {
        showToast('error', 'Update Failed', data.error || 'Could not update item status.');
      }
    } catch {
      showToast('error', 'Network Error', 'Failed to connect to CampusFind server.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${item.id}?userId=${currentUser.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', 'Post Deleted', 'Your item report has been removed.');
        if (onItemUpdated) onItemUpdated();
        onClose();
      } else {
        showToast('error', 'Delete Failed', data.error || 'Unable to delete post.');
      }
    } catch {
      showToast('error', 'Network Error', 'Failed to delete post.');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('info', 'Link Copied', 'CampusFind link copied to your clipboard.');
    }
  };

  return (
    <div id="item-detail-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        id="item-detail-modal"
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                isLost ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isLost ? 'Lost Item Report' : 'Found Item Report'}
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {item.id.slice(-6)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="detail-share-btn"
              onClick={handleShare}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Share item"
              aria-label="Share item"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="close-item-detail-btn"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Main Grid: Image + Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Image Column */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Cloud Storage Provider Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-950/85 text-sky-300 border border-sky-500/30 backdrop-blur-md flex items-center gap-1 shadow-sm">
                    <Cloud className="w-3 h-3 text-sky-400" />
                    {item.imageProvider === 'cloudinary'
                      ? 'Cloudinary Storage'
                      : item.imageProvider === 'supabase'
                      ? 'Supabase Storage'
                      : item.imageProvider === 's3'
                      ? 'AWS S3'
                      : 'Campus Cloud CDN'}
                  </span>
                </div>

                {/* Lightbox Trigger Button */}
                <button
                  type="button"
                  onClick={() => setImageLightboxOpen(true)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-950/80 hover:bg-blue-600 text-slate-300 hover:text-white backdrop-blur-md transition-colors shadow-md"
                  title="View full-size high-res photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {isReturned && (
                  <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="text-center px-4 py-3 bg-blue-900/90 rounded-xl border border-blue-400/40 shadow-2xl">
                      <CheckCircle2 className="w-8 h-8 text-blue-300 mx-auto mb-1" />
                      <p className="text-sm font-bold text-white uppercase tracking-wider">Item Returned</p>
                      <p className="text-xs text-blue-200">Reunited with owner</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status banner */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Item Status</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-semibold ${
                    isReturned
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isReturned ? 'Returned to Owner' : 'Active / Unclaimed'}
                </span>
              </div>

              {/* Storage & Image Info Card */}
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/70 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <FileImage className="w-3.5 h-3.5 text-blue-400" />
                    Storage & Media
                  </span>
                  <button
                    type="button"
                    onClick={() => setImageLightboxOpen(true)}
                    className="text-blue-400 hover:underline text-[11px] flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800/60">
                  <div className="flex justify-between">
                    <span>Host Provider:</span>
                    <span className="font-semibold text-sky-300">
                      {item.imageProvider === 'cloudinary'
                        ? 'Cloudinary (Cloud CDN)'
                        : item.imageProvider === 'supabase'
                        ? 'Supabase Storage'
                        : item.imageProvider === 's3'
                        ? 'AWS S3'
                        : 'Campus Cloud Storage'}
                    </span>
                  </div>
                  {item.imageFileName && (
                    <div className="flex justify-between">
                      <span>File:</span>
                      <span className="truncate max-w-[140px] text-slate-300" title={item.imageFileName}>
                        {item.imageFileName}
                      </span>
                    </div>
                  )}
                  {item.imageFileSize && (
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="font-mono text-slate-300">
                        {(item.imageFileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  )}
                </div>
                {isOwner && onEditItem && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditItem(item);
                    }}
                    className="w-full mt-2 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3 h-3 text-blue-400" />
                    <span>Change or Replace Photo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Details Column */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800/60 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-blue-400" />
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Reported {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                  {item.name}
                </h1>

                {/* Key Location & Date Meta */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {isLost ? 'Last Seen Location' : 'Found Location'}
                      </span>
                      <span className="font-semibold text-slate-200">{item.location}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {isLost ? 'Date Lost' : 'Date Found'}
                      </span>
                      <span className="font-semibold text-slate-200">{item.date}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Description & Identifying Features
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 whitespace-pre-line">
                    {item.description}
                  </p>
                </div>

                {/* Additional Info / Reward if present */}
                {item.additionalInfo && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-300 block mb-0.5">Additional Information:</span>
                      <span>{item.additionalInfo}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Poster Profile Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-100">{item.userName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" title="Verified Campus Student" />
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <School className="w-3 h-3 text-slate-500" />
                      {item.department || 'Student'}
                    </p>
                  </div>
                </div>

                {!isOwner && (
                  <button
                    id="contact-poster-modal-btn"
                    onClick={() => onContactPoster(item)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message Student
                  </button>
                )}
              </div>

              {/* Owner Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  id="mark-returned-btn"
                  onClick={handleToggleReturned}
                  disabled={statusUpdating}
                  className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isReturned
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isReturned ? 'Mark as Active (Reopen)' : 'Mark as Returned'}
                </button>

                {isOwner && onEditItem && (
                  <button
                    id="edit-post-btn"
                    onClick={() => onEditItem(item)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700/60"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}

                {isOwner && (
                  <button
                    id="delete-post-btn"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Delete Confirmation Alert */}
          {deleteConfirmOpen && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="text-xs font-medium">Are you sure you want to permanently delete this post?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-3 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1 text-xs rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-500"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          )}

          {/* AI-POWERED MATCHING SECTION (HIGHLIGHTED HACKATHON FEATURE) */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    AI-Powered Intelligent Matching
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Gemini 3.8
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comparing campus location, description, category, and date against opposite{' '}
                    <span className="font-semibold text-slate-300">{isLost ? 'Found' : 'Lost'}</span> listings.
                  </p>
                </div>
              </div>

              {loadingMatches && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing matches...
                </div>
              )}
            </div>

            {loadingMatches ? (
              <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-200">AI Evaluating Campus Database...</p>
                <p className="text-xs text-slate-500 mt-1">Cross-referencing lost and found inventory</p>
              </div>
            ) : matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {matches.map((match, idx) => {
                  const mItem = match.matchedItem;
                  const isHighConfidence = match.similarityPercentage >= 80;

                  return (
                    <div
                      key={mItem.id || idx}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isHighConfidence
                          ? 'bg-indigo-950/30 border-indigo-500/40 hover:border-indigo-400/60 shadow-lg shadow-indigo-950/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Match Percentage Banner */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                              isHighConfidence
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                                : 'bg-slate-800 text-slate-200 border border-slate-700'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Possible Match — {match.similarityPercentage}%
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {mItem.type === 'found' ? 'Found Report' : 'Lost Report'}
                          </span>
                        </div>

                        {/* Matched Item Preview */}
                        <div className="flex gap-3 items-start">
                          <img
                            src={mItem.imageUrl}
                            alt={mItem.name}
                            className="w-16 h-16 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-slate-100 truncate">{mItem.name}</h4>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              <span className="truncate">{mItem.location}</span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{mItem.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* AI Explanation Reason */}
                        <div className="mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-indigo-300 block mb-0.5">Why they match:</span>
                          {match.matchReason}
                        </div>
                      </div>

                      {/* Matched Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {onSelectMatchedItem && (
                          <button
                            id={`view-match-detail-btn-${mItem.id}`}
                            onClick={() => onSelectMatchedItem(mItem)}
                            className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
                          >
                            View Item
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          id={`message-match-poster-btn-${mItem.id}`}
                          onClick={() => onContactPoster(mItem)}
                          className="py-1.5 px-3 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shadow-sm"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Contact {mItem.userName.split(' ')[0]}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800 text-center text-xs text-slate-400">
                <Sparkles className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                No high-probability matches found in the active {isLost ? 'found' : 'lost'} database yet.
                <p className="mt-1 text-slate-500">
                  CampusFind AI runs in real-time when new reports are submitted.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Full-Screen Image Lightbox Modal */}
      <AnimatePresence>
        {imageLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setImageLightboxOpen(false)}
          >
            <div
              className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                <a
                  href={item.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-blue-600 transition-colors"
                  title="Open raw image in new tab"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
                <button
                  type="button"
                  onClick={() => setImageLightboxOpen(false)}
                  className="p-2 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                  title="Close inspection"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <img
                src={item.imageUrl}
                alt={item.name}
                className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-slate-700 bg-slate-950"
                referrerPolicy="no-referrer"
              />

              {/* Lightbox Caption & Metadata */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 bg-slate-900/90 px-5 py-2 rounded-full border border-slate-700 backdrop-blur-md">
                <span className="font-semibold text-slate-100">{item.name}</span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-sky-400">
                  <Cloud className="w-3.5 h-3.5" />
                  {item.imageProvider === 'cloudinary'
                    ? 'Cloudinary Storage'
                    : item.imageProvider === 'supabase'
                    ? 'Supabase Storage'
                    : item.imageProvider === 's3'
                    ? 'AWS S3'
                    : 'Campus Cloud Storage'}
                </span>
                {item.imageFileName && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 truncate max-w-[200px]">{item.imageFileName}</span>
                  </>
                )}
                {item.imageFileSize && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-slate-400">
                      {(item.imageFileSize / 1024).toFixed(0)} KB
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
