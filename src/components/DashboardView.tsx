import React, { useState } from 'react';
import { Item, DashboardStats, ItemCategory } from '../types';
import { ItemCard } from './ItemCard';
import {
  Search,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  School,
  TrendingUp,
  Clock,
  ShieldCheck,
  Compass,
  Cpu,
  HelpCircle,
  Tag,
} from 'lucide-react';

interface DashboardViewProps {
  stats: DashboardStats | null;
  items: Item[];
  loading: boolean;
  onSelectItem: (item: Item) => void;
  onContactPoster: (item: Item) => void;
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onNavigateToTab: (tab: string, filter?: { search?: string; category?: ItemCategory }) => void;
}

const QUICK_CATEGORIES: { name: ItemCategory; label: string; icon: string }[] = [
  { name: 'Electronics', label: 'Electronics', icon: '💻' },
  { name: 'ID & Cards', label: 'ID & Cards', icon: '🪪' },
  { name: 'Keys', label: 'Keys', icon: '🔑' },
  { name: 'Bags & Backpacks', label: 'Backpacks', icon: '🎒' },
  { name: 'Clothing & Accessories', label: 'Clothing', icon: '🧥' },
  { name: 'Books & Stationery', label: 'Stationery', icon: '📚' },
  { name: 'Sports & Water Bottles', label: 'Bottles & Sports', icon: '⚽' },
  { name: 'Jewelry & Watches', label: 'Watches & Jewelry', icon: '⌚' },
];

const CardSkeleton: React.FC = () => (
  <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3 animate-pulse">
    <div className="aspect-video w-full bg-slate-800/80 rounded-xl" />
    <div className="flex justify-between items-center pt-1">
      <div className="h-4 w-24 bg-slate-800 rounded" />
      <div className="h-4 w-12 bg-slate-800 rounded" />
    </div>
    <div className="h-5 w-4/5 bg-slate-800 rounded" />
    <div className="h-3 w-1/2 bg-slate-800/60 rounded" />
    <div className="h-9 w-full bg-slate-800/80 rounded-xl mt-3" />
  </div>
);

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  items,
  loading,
  onSelectItem,
  onContactPoster,
  onOpenReportModal,
  onNavigateToTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'lost' | 'found'>('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateToTab(activeFilterTab === 'found' ? 'found' : 'lost', { search: searchQuery.trim() });
    }
  };

  // Recent items filtered by tab
  const filteredRecentItems = items
    .filter(i => {
      if (activeFilterTab === 'lost') return i.type === 'lost';
      if (activeFilterTab === 'found') return i.type === 'found';
      return true;
    })
    .slice(0, 6);

  return (
    <div id="dashboard-view" className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800/80 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          {/* Live Campus Pulse Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Campus Lost & Found Directory</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-mono">24/7 Student Network</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Lost something on campus? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300">
              CampusFind reunites it.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Report lost possessions, log discovered items across lecture halls, dining areas, and libraries, and let our
            automated AI cross-matching engine connect you instantly with the finder.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                id="dashboard-search-input"
                type="text"
                placeholder="Search by item name, location (e.g. Library, AirPods, Hydro Flask)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-lg"
              />
            </div>
            <button
              id="dashboard-search-submit-btn"
              type="submit"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <span>Search Database</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              id="dashboard-quick-report-lost-btn"
              onClick={() => onOpenReportModal('lost')}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost Item
            </button>
            <button
              id="dashboard-quick-report-found-btn"
              onClick={() => onOpenReportModal('found')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found Item
            </button>
            <button
              id="dashboard-view-all-btn"
              onClick={() => onNavigateToTab('lost')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              Browse All Listings
            </button>
          </div>
        </div>

        {/* Decorative Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Category Quick Chips Navigation */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            Quick Browse by Category
          </h2>
          <span className="text-[11px] text-slate-500">Tap to filter items</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {QUICK_CATEGORIES.map(cat => (
            <button
              key={cat.name}
              id={`quick-cat-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => onNavigateToTab('lost', { category: cat.name })}
              className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-600/40 text-slate-300 hover:text-white text-xs font-medium shrink-0 flex items-center gap-2 transition-all group"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </section>

      {/* 4 Stat Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Lost Items */}
        <div
          id="stat-card-lost"
          onClick={() => onNavigateToTab('lost')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition-all cursor-pointer group shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Lost</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats ? stats.totalLost : 0}
            </span>
            <p className="text-xs text-rose-400/90 font-medium mt-1 flex items-center gap-1">
              Active campus search alerts
            </p>
          </div>
        </div>

        {/* Stat 2: Found Items */}
        <div
          id="stat-card-found"
          onClick={() => onNavigateToTab('found')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Found</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats ? stats.totalFound : 0}
            </span>
            <p className="text-xs text-emerald-400/90 font-medium mt-1 flex items-center gap-1">
              Safely reported by students
            </p>
          </div>
        </div>

        {/* Stat 3: Returned Items */}
        <div
          id="stat-card-returned"
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Returned Items</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {stats ? stats.totalReturned : 0}
            </span>
            <p className="text-xs text-blue-400/90 font-medium mt-1 flex items-center gap-1">
              Reunited with owners
            </p>
          </div>
        </div>

        {/* Stat 4: AI Matching */}
        <div
          id="stat-card-ai"
          className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-500/30 transition-all shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">AI Matching</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">Active</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Auto
              </span>
            </div>
            <p className="text-xs text-indigo-300/90 font-medium mt-1 flex items-center gap-1">
              Cross-referencing lost & found
            </p>
          </div>
        </div>
      </section>

      {/* AI Automated Matching Feature Showcase Card */}
      <section className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/30 via-indigo-950/20 to-slate-900 border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0 mt-0.5 sm:mt-0">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Automated Smart Matcher</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300">
                Hackathon Innovation
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              When an item is reported, CampusFind runs similarity scoring on item names, campus locations, and dates.
              Both the owner and finder receive instant match alerts to connect safely.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToTab('lost')}
          className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5"
        >
          <span>See In Action</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Recent Posts Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Recent Campus Posts
            </h2>
            <p className="text-xs text-slate-400">Latest lost and found items reported across campus</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              id="recent-tab-all"
              onClick={() => setActiveFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilterTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Posts
            </button>
            <button
              id="recent-tab-lost"
              onClick={() => setActiveFilterTab('lost')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilterTab === 'lost'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lost Only
            </button>
            <button
              id="recent-tab-found"
              onClick={() => setActiveFilterTab('found')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilterTab === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Found Only
            </button>
          </div>
        </div>

        {/* Item Cards Grid or Skeleton Loader */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : filteredRecentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecentItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onSelect={onSelectItem}
                onContact={onContactPoster}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">No posts in this category</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Be the first to report a lost or found item to help fellow students.
            </p>
            <button
              onClick={() => onOpenReportModal(activeFilterTab === 'found' ? 'found' : 'lost')}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Report Item Now
            </button>
          </div>
        )}

        <div className="pt-4 text-center">
          <button
            id="view-all-lost-bottom-btn"
            onClick={() => onNavigateToTab('lost')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 transition-all hover:text-white"
          >
            <span>Explore All Campus Listings</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </section>
    </div>
  );
};
