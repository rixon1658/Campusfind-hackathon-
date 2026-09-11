import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Item, ItemCategory, ItemType, StorageStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './NotificationToast';
import {
  X,
  Upload,
  Image as ImageIcon,
  Tag,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
  Cloud,
  CloudUpload,
  Maximize2,
  Loader2,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

interface ReportItemModalProps {
  initialType: ItemType;
  itemToEdit?: Item | null;
  onClose: () => void;
  onSuccess: (item: Item) => void;
}

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'ID & Cards',
  'Keys',
  'Bags & Backpacks',
  'Clothing & Accessories',
  'Books & Stationery',
  'Sports & Water Bottles',
  'Jewelry & Watches',
  'Other',
];

const CAMPUS_LOCATIONS = [
  'Student Union Dining Hall',
  'Student Union 1st Floor Lounge',
  'Main Campus Library (Quiet Study)',
  'Science & Engineering Hall (2nd Floor)',
  'Campus Recreation Center (Gym/Courts)',
  'North Campus Parking Lot B',
  'University Quad Lawn',
  'Business School Atrium',
  'Dormitory Quad B',
  'Campus Bookstore & Cafe',
];

const PRESET_IMAGES: Record<string, string> = {
  AirPods: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
  Backpack: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
  Calculator: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
  'Water Bottle': 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
  Keys: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  'Student ID': 'https://images.unsplash.com/photo-1589330694653-dad6ef49ab6e?w=600&auto=format&fit=crop&q=80',
  Jacket: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
  Textbook: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
};

export const ReportItemModal: React.FC<ReportItemModalProps> = ({
  initialType,
  itemToEdit,
  onClose,
  onSuccess,
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const { showToast } = useNotification();

  const [type, setType] = useState<ItemType>(itemToEdit ? itemToEdit.type : initialType);
  const [name, setName] = useState(itemToEdit ? itemToEdit.name : '');
  const [category, setCategory] = useState<ItemCategory>(itemToEdit ? itemToEdit.category : 'Electronics');
  const [description, setDescription] = useState(itemToEdit ? itemToEdit.description : '');
  const [location, setLocation] = useState(itemToEdit ? itemToEdit.location : '');
  const [date, setDate] = useState(
    itemToEdit ? itemToEdit.date : new Date().toISOString().split('T')[0]
  );
  const [imageUrl, setImageUrl] = useState(itemToEdit ? itemToEdit.imageUrl : '');
  const [imageProvider, setImageProvider] = useState<'cloudinary' | 'supabase' | 's3' | 'server' | undefined>(
    (itemToEdit?.imageProvider as any) || undefined
  );
  const [imageFileName, setImageFileName] = useState<string | undefined>(itemToEdit?.imageFileName);
  const [imageFileSize, setImageFileSize] = useState<number | undefined>(itemToEdit?.imageFileSize);
  const [additionalInfo, setAdditionalInfo] = useState(itemToEdit?.additionalInfo || '');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);

  const isEditing = !!itemToEdit;
  const isLost = type === 'lost';

  useEffect(() => {
    fetch('/api/storage/status')
      .then(res => res.json())
      .then(data => setStorageStatus(data))
      .catch(err => console.warn('Could not fetch storage status:', err));
  }, []);

  const handleFileUpload = async (file: File) => {
    const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    setUploadError(null);

    // 1. File Type Validation
    if (!ALLOWED_MIME.includes(file.type)) {
      const msg = 'Invalid file type. Only JPG, PNG, WebP, and GIF images are allowed.';
      setUploadError(msg);
      showToast('error', 'Unsupported File Type', msg);
      return;
    }

    // 2. File Size Limit (5MB)
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const msg = `File size (${sizeMB} MB) exceeds the 5MB maximum limit. Please select a smaller photo.`;
      setUploadError(msg);
      showToast('error', 'File Too Large', msg);
      return;
    }

    setUploading(true);

    try {
      // First attempt: standard FormData multipart upload
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setImageUrl(data.url);
        setImageProvider(data.provider);
        setImageFileName(data.fileName || file.name);
        setImageFileSize(data.fileSize || file.size);
        setUploadError(null);
        showToast(
          'success',
          'Image Uploaded Successfully',
          `Saved to ${data.providerLabel || 'Cloud Storage'} (${(file.size / 1024).toFixed(0)} KB)`
        );
      } else {
        // Fallback attempt: base64 Data URI
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const fallbackRes = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image: reader.result,
                fileName: file.name,
              }),
            });
            const fallbackData = await fallbackRes.json();
            if (fallbackRes.ok && fallbackData.url) {
              setImageUrl(fallbackData.url);
              setImageProvider(fallbackData.provider);
              setImageFileName(fallbackData.fileName || file.name);
              setImageFileSize(fallbackData.fileSize || file.size);
              setUploadError(null);
              showToast(
                'success',
                'Image Uploaded Successfully',
                `Saved to ${fallbackData.providerLabel || 'Cloud Storage'}`
              );
            } else {
              const errText = fallbackData.error || data.error || 'Failed to upload photo.';
              setUploadError(errText);
              showToast('error', 'Upload Failed', errText);
            }
          } catch {
            const errText = data.error || 'Server connection error.';
            setUploadError(errText);
            showToast('error', 'Upload Failed', errText);
          } finally {
            setUploading(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to connect to storage server.';
      setUploadError(msg);
      showToast('error', 'Upload Error', msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      showToast('info', 'Sign in required', 'Please sign in or use a demo student account to post.');
      openAuthModal('login');
      return;
    }

    if (!name.trim() || !location.trim() || !description.trim()) {
      showToast('error', 'Missing Information', 'Please fill in the item name, location, and description.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        type,
        name: name.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        date,
        imageUrl: imageUrl.trim(),
        imageProvider,
        imageFileName,
        imageFileSize,
        additionalInfo: additionalInfo.trim(),
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userPhone: currentUser.phone || '',
        department: currentUser.department || '',
      };

      const url = isEditing ? `/api/items/${itemToEdit.id}` : '/api/items';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.item) {
        showToast(
          'success',
          isEditing ? 'Item Updated Successfully' : `Reported ${isLost ? 'Lost' : 'Found'} Item!`,
          `"${data.item.name}" is now live on CampusFind.`
        );
        onSuccess(data.item);
        onClose();
      } else {
        showToast('error', 'Submission Failed', data.error || 'Please check your inputs.');
      }
    } catch {
      showToast('error', 'Network Error', 'Could not reach server to post item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="report-item-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        id="report-item-modal"
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isLost ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isLost ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEditing ? 'Edit Item Report' : isLost ? 'Report a Lost Item' : 'Report a Found Item'}
              </h2>
              <p className="text-xs text-slate-400">
                {isLost
                  ? 'Provide details so other campus members can identify and return your item.'
                  : 'Report an item you found to help reunite it with its student owner.'}
              </p>
            </div>
          </div>

          <button
            id="close-report-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Item Type Switcher (if not editing) */}
          {!isEditing && (
            <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                id="type-toggle-lost"
                onClick={() => setType('lost')}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  type === 'lost'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                I Lost Something
              </button>
              <button
                type="button"
                id="type-toggle-found"
                onClick={() => setType('found')}
                className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  type === 'found'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                I Found Something
              </button>
            </div>
          )}

          {/* Name & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Item Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="item-name-input"
                type="text"
                required
                placeholder={isLost ? 'e.g. Apple AirPods Pro (Orange Silicone Case)' : 'e.g. TI-84 Plus CE Graphing Calculator'}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                id="item-category-select"
                value={category}
                onChange={e => setCategory(e.target.value as ItemCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>
                  {isLost ? 'Last Seen Location' : 'Found Location'} <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-slate-500">Be specific</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  id="item-location-input"
                  type="text"
                  required
                  placeholder="e.g. Student Union Dining Hall (Near Subway)"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Campus Presets Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-slate-500 self-center">Presets:</span>
                {CAMPUS_LOCATIONS.slice(0, 4).map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    {loc.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isLost ? 'Date Lost' : 'Date Found'} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  id="item-date-input"
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>
                Detailed Description <span className="text-rose-400">*</span>
              </span>
              <span className="text-[10px] text-slate-500">Color, brand, markings, stickers, dents</span>
            </label>
            <textarea
              id="item-description-textarea"
              required
              rows={3}
              placeholder={
                isLost
                  ? 'Describe distinctive details: brand, color, case markings, stickers, scratches, or accessories...'
                  : 'Describe where and how it was found, physical condition, and where it is currently held...'
              }
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Item Photo (Cloud Storage Upload)</span>
              </label>

              {/* Cloud Storage Status Badge */}
              <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300">
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  Storage:{' '}
                  <strong className="font-semibold text-slate-100">
                    {storageStatus?.providerLabel || 'Campus Cloud CDN'}
                  </strong>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Max 5MB</span>
              </div>
            </div>

            {/* Upload Error Banner */}
            <AnimatePresence>
              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{uploadError}</p>
                    <p className="text-[11px] text-rose-300/80 mt-0.5">
                      Ensure your file is in JPG, PNG, WebP, or GIF format and under 5 MB.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="text-rose-400 hover:text-rose-200 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Drop / Upload Area */}
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`sm:col-span-7 border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center min-h-[140px] relative ${
                  dragActive
                    ? 'border-blue-500 bg-blue-950/20'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-3">
                    <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
                    <p className="text-xs font-semibold text-slate-200">Uploading to Cloud Storage...</p>
                    <p className="text-[10px] text-slate-400">Validating format and buffering securely</p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-2">
                      <CloudUpload className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-200">
                      Drag & drop your photo, or{' '}
                      <label className="text-blue-400 hover:underline cursor-pointer font-bold">
                        browse files
                        <input
                          id="file-upload-input"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supported: JPG, PNG, WebP, GIF • Limit: 5 MB
                    </p>
                  </>
                )}
              </div>

              {/* Preview & Details Box */}
              <div className="sm:col-span-5 flex flex-col justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                {imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group">
                      <img
                        src={imageUrl}
                        alt="Item preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-slate-950/80 text-sky-300 border border-sky-500/30 flex items-center gap-1 backdrop-blur-sm">
                          <Cloud className="w-2.5 h-2.5" />
                          {imageProvider === 'cloudinary'
                            ? 'Cloudinary'
                            : imageProvider === 'supabase'
                            ? 'Supabase'
                            : imageProvider === 's3'
                            ? 'AWS S3'
                            : 'Cloud CDN'}
                        </span>
                      </div>

                      {/* Top Action Controls */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setImageZoomOpen(true)}
                          className="p-1 bg-slate-950/80 rounded-md text-slate-300 hover:text-white hover:bg-blue-600 transition-colors"
                          title="Inspect image full size"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl('');
                            setImageFileName(undefined);
                            setImageFileSize(undefined);
                            setImageProvider(undefined);
                          }}
                          className="p-1 bg-slate-950/80 rounded-md text-slate-300 hover:text-white hover:bg-rose-600 transition-colors"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* File Details footer overlay */}
                      {(imageFileName || imageFileSize) && (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 px-2 py-1 text-[9px] text-slate-300 flex items-center justify-between border-t border-slate-800">
                          <span className="truncate max-w-[120px]" title={imageFileName}>
                            {imageFileName || 'Uploaded Photo'}
                          </span>
                          {imageFileSize && (
                            <span className="font-mono text-slate-400">
                              {(imageFileSize / 1024).toFixed(0)} KB
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-emerald-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Image attached
                      </span>
                      <label className="text-blue-400 hover:underline cursor-pointer text-[10px]">
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 text-center p-2 text-xs text-slate-500">
                    <ImageIcon className="w-6 h-6 text-slate-600 mb-1" />
                    <span>No image selected</span>
                    <span className="text-[10px] text-slate-600 mt-0.5">Upload a photo to aid recognition</span>
                  </div>
                )}

                {/* Sample Presets */}
                <div className="pt-2 border-t border-slate-800/80 mt-2">
                  <span className="text-[10px] text-slate-400 block mb-1 font-medium">Or pick sample preset:</span>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(PRESET_IMAGES).map(presetKey => (
                      <button
                        key={presetKey}
                        type="button"
                        onClick={() => {
                          setImageUrl(PRESET_IMAGES[presetKey]);
                          setImageProvider('server');
                          setImageFileName(`${presetKey.toLowerCase().replace(/\s+/g, '_')}.jpg`);
                        }}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-blue-600/30 hover:text-blue-300 text-slate-300 border border-slate-700/60 transition-colors"
                      >
                        {presetKey}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Additional Information (Optional)</span>
              <span className="text-[10px] text-slate-500">Reward, storage desk, serial number</span>
            </label>
            <input
              id="item-additional-input"
              type="text"
              placeholder={
                isLost
                  ? 'e.g. Offering $25 reward for safe return, has sticker on bottom'
                  : 'e.g. Left with Student Union Front Desk, ask for manager'
              }
              value={additionalInfo}
              onChange={e => setAdditionalInfo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              id="cancel-report-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-report-btn"
              type="submit"
              disabled={submitting}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                isLost
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              } disabled:opacity-50`}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {isEditing ? 'Save Changes' : isLost ? 'Submit Lost Report' : 'Submit Found Report'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Full-Size Image Inspection Lightbox */}
      <AnimatePresence>
        {imageZoomOpen && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setImageZoomOpen(false)}
          >
            <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center">
              <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImageZoomOpen(false)}
                  className="p-2 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={imageUrl}
                alt="Item Full View"
                className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-300 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700">
                <span className="flex items-center gap-1 text-sky-400">
                  <Cloud className="w-3.5 h-3.5" />
                  {imageProvider === 'cloudinary'
                    ? 'Cloudinary Storage'
                    : imageProvider === 'supabase'
                    ? 'Supabase Storage'
                    : imageProvider === 's3'
                    ? 'AWS S3'
                    : 'Cloud CDN'}
                </span>
                {imageFileName && <span>{imageFileName}</span>}
                {imageFileSize && <span>• {(imageFileSize / 1024).toFixed(0)} KB</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
