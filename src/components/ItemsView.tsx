import React, { useState, useMemo } from 'react';
import { Item, ItemCategory, ItemType } from '../types';
import { ItemCard } from './ItemCard';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Tag,
  PlusCircle,
  X,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ItemsViewProps {
  type: ItemType;
  items: Item[];
  loading: boolean;
  onSelectItem: (item: Item) => void;
  onContactPoster: (item: Item) => void;
  onOpenReportModal: (type: ItemType) => void;
  initialSearch?: string;
  initialCategory?: ItemCategory;
}

const CATEGORIES: Array<ItemCategory | 'All'> = [
  'All',
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

export const ItemsView: React.FC<ItemsViewProps> = ({
  type,
  items,
  loading,
  onSelectItem,
  onContactPoster,
  onOpenReportModal,
  initialSearch = '',
  initialCategory = 'All',
}) => {
  const isLost = type === 'lost';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'All'>(initialCategory);
  const [locationFilter, setLocationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned'>('all');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Must match item type
      if (item.type !== type) return false;

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

      // Location filter
      if (locationFilter.trim() && !item.location.toLowerCase().includes(locationFilter.toLowerCase().trim())) {
        return false;
      }

      // Date filter
      if (dateFilter.trim() && item.date !== dateFilter.trim()) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchExtra = item.additionalInfo?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchLoc && !matchCat && !matchExtra) return false;
      }

      return true;
    });
  }, [items, type, selectedCategory, locationFilter, dateFilter, statusFilter, search]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'All' ||
    locationFilter.trim() !== '' ||
    dateFilter.trim() !== '' ||
    statusFilter !== 'all';

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setLocationFilter('');
    setDateFilter('');
    setStatusFilter('all');
  };

  return (
    <div id={`${type}-items-view`} className="space-y-6 pb-12">
      {/* Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                isLost ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isLost ? 'Lost Items Directory' : 'Found Items Directory'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
            {isLost ? 'Search Lost Items on Campus' : 'Browse Discovered & Turned-in Items'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            {isLost
              ? 'Browse reported lost items or report something you lost to get AI alerts when a match is posted.'
              : 'Discovered an item on campus? Check if someone has reported it missing or submit a new found report.'}
          </p>
        </div>

        <button
          id={`page-report-${type}-btn`}
          onClick={() => onOpenReportModal(type)}
          className={`px-5 py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 ${
            isLost ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          {isLost ? 'Report Lost Item' : 'Report Found Item'}
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        {/* Search & Location Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Main Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              id="items-search-input"
              type="text"
              placeholder="Search by keyword, brand, color (e.g. AirPods, Hydro Flask, Wallet)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location Filter Input */}
          <div className="sm:col-span-3 relative">
            <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              id="items-location-filter-input"
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Date Filter Input */}
          <div className="sm:col-span-3 relative">
            <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              id="items-date-filter-input"
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Category Scrollable Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold pr-2 shrink-0 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            Category:
          </span>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`cat-chip-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Status Filter & Active Filters Summary */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Status:</span>
            <div className="inline-flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setStatusFilter('returned')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  statusFilter === 'returned' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Returned
              </button>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              id="clear-all-filters-btn"
              onClick={clearAllFilters}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Item Cards or Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3 animate-pulse">
              <div className="aspect-video w-full bg-slate-800/80 rounded-xl" />
              <div className="flex justify-between items-center pt-1">
                <div className="h-4 w-24 bg-slate-800 rounded" />
                <div className="h-4 w-12 bg-slate-800 rounded" />
              </div>
              <div className="h-5 w-4/5 bg-slate-800 rounded" />
              <div className="h-3 w-1/2 bg-slate-800/60 rounded" />
              <div className="h-9 w-full bg-slate-800/80 rounded-xl mt-3" />
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onSelect={onSelectItem}
              onContact={onContactPoster}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 rounded-2xl bg-slate-900/60 border border-slate-800 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No items found matching your filters</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Try adjusting your search terms, changing the category, or clearing your active filters.
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => onOpenReportModal(type)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              {isLost ? 'Report Lost Item' : 'Report Found Item'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
