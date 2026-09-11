import React from 'react';
import { Item } from '../types';
import { MapPin, Calendar, Sparkles, MessageSquare, ArrowUpRight, CheckCircle, Tag, Cloud } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onSelect: (item: Item) => void;
  onContact?: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect, onContact }) => {
  const isLost = item.type === 'lost';
  const isReturned = item.status === 'returned';

  return (
    <div
      id={`item-card-${item.id}`}
      className={`group relative bg-slate-900/90 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-blue-950/20 hover:-translate-y-0.5 ${
        isReturned ? 'border-slate-800/60 opacity-90' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Thumbnail with Overlay Badges */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer" onClick={() => onSelect(item)}>
        <img
          src={item.imageUrl}
          alt={item.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to generic campus item photo if link breaks
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Badges Top Row */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Lost/Found Pill */}
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
              isLost
                ? 'bg-rose-500/90 text-white shadow-rose-900/40'
                : 'bg-emerald-500/90 text-white shadow-emerald-900/40'
            }`}
          >
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>

          {/* Status Badge */}
          {isReturned ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
              <CheckCircle className="w-3 h-3" />
              Returned
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/60 backdrop-blur-md">
              Active
            </span>
          )}
        </div>

        {/* Category Pill Bottom Left */}
        <div className="absolute bottom-2.5 left-3">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-950/80 text-blue-300 border border-slate-800/80 backdrop-blur-md flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-blue-400" />
            {item.category}
          </span>
        </div>

        {/* Cloud Stored Indicator Bottom Right */}
        {item.imageProvider && (
          <div className="absolute bottom-2.5 right-3">
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950/85 text-sky-300 border border-sky-500/30 backdrop-blur-md flex items-center gap-1"
              title={`Photo stored on ${item.imageProvider.toUpperCase()}`}
            >
              <Cloud className="w-2.5 h-2.5 text-sky-400" />
              {item.imageProvider === 'cloudinary'
                ? 'Cloudinary'
                : item.imageProvider === 'supabase'
                ? 'Supabase'
                : item.imageProvider === 's3'
                ? 'S3'
                : 'Cloud CDN'}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Item Name */}
          <h3
            id={`item-title-${item.id}`}
            onClick={() => onSelect(item)}
            className="text-base font-bold text-slate-100 hover:text-blue-400 transition-colors cursor-pointer line-clamp-1"
            title={item.name}
          >
            {item.name}
          </h3>

          {/* Location & Date */}
          <div className="mt-2.5 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{item.date}</span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            id={`view-details-btn-${item.id}`}
            onClick={() => onSelect(item)}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all flex items-center justify-center gap-1.5 group/btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover/btn:rotate-12 transition-transform" />
            <span>Details & Matches</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white transition-colors" />
          </button>

          {onContact && (
            <button
              id={`contact-poster-btn-${item.id}`}
              onClick={() => onContact(item)}
              title="Message finder/poster"
              className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-800/50 transition-all"
              aria-label="Send message"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
