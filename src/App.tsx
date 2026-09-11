import React, { useState, useEffect, useCallback } from 'react';
import { Item, DashboardStats, ItemCategory, ItemType } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './components/NotificationToast';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';
import { ItemsView } from './components/ItemsView';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ReportItemModal } from './components/ReportItemModal';
import { MyPostsView } from './components/MyPostsView';
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import {
  Compass,
  AlertCircle,
  CheckCircle2,
  FileText,
  MessageSquare,
  User,
  Heart,
  ShieldCheck,
  Phone,
  Sparkles,
  School,
  Search,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, openAuthModal } = useAuth();
  const { showToast } = useNotification();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Items and stats
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<ItemType>('lost');
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  // Search/category pre-filtering passed from dashboard
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ItemCategory | undefined>(undefined);

  // Message target
  const [messageTargetItemId, setMessageTargetItemId] = useState<string | undefined>(undefined);
  const [messageTargetReceiverId, setMessageTargetReceiverId] = useState<string | undefined>(undefined);

  // Fetch Items & Stats
  const fetchData = useCallback(async () => {
    try {
      const [itemsRes, statsRes] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/stats'),
      ]);

      const itemsData = await itemsRes.json();
      const statsData = await statsRes.json();

      if (itemsData.items) {
        setItems(itemsData.items);
      }
      if (statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Failed to load campus items/stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Report Modal
  const handleOpenReportModal = (type: ItemType) => {
    if (!currentUser) {
      showToast('info', 'Sign in required', 'Please sign in with a demo or new student account to submit reports.');
      openAuthModal('login');
      return;
    }
    setReportModalType(type);
    setItemToEdit(null);
    setReportModalOpen(true);
  };

  // Open Edit Modal
  const handleEditItem = (item: Item) => {
    setItemToEdit(item);
    setReportModalType(item.type);
    setReportModalOpen(true);
    setSelectedItem(null);
  };

  // Navigate with optional search query
  const handleNavigateToTab = (
    tab: string,
    filter?: { search?: string; category?: ItemCategory }
  ) => {
    if (filter?.search !== undefined) setFilterSearch(filter.search);
    if (filter?.category !== undefined) setFilterCategory(filter.category);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Contact Poster Action: creates conversation context and redirects to messages
  const handleContactPoster = async (item: Item) => {
    if (!currentUser) {
      showToast('info', 'Sign in required', 'Please sign in to message other campus students.');
      openAuthModal('login');
      return;
    }

    if (currentUser.id === item.userId) {
      showToast('info', 'Your own post', 'You are the author of this post.');
      return;
    }

    try {
      // Send an initial handshake message if one doesn't exist yet
      const payload = {
        itemId: item.id,
        itemTitle: item.name,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        receiverId: item.userId,
        receiverName: item.userName,
        receiverEmail: item.userEmail,
        content: `Hi ${item.userName.split(' ')[0]}! I saw your ${item.type} listing for "${item.name}" on CampusFind.`,
      };

      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setMessageTargetItemId(item.id);
      setMessageTargetReceiverId(item.userId);
      setSelectedItem(null);
      setActiveTab('messages');
      showToast('success', 'Conversation Started', `Chat opened with ${item.userName}.`);
    } catch {
      showToast('error', 'Error', 'Could not initiate chat.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={handleOpenReportModal}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            items={items}
            loading={loading}
            onSelectItem={item => setSelectedItem(item)}
            onContactPoster={handleContactPoster}
            onOpenReportModal={handleOpenReportModal}
            onNavigateToTab={handleNavigateToTab}
          />
        )}

        {activeTab === 'lost' && (
          <ItemsView
            key="lost-view"
            type="lost"
            items={items}
            loading={loading}
            onSelectItem={item => setSelectedItem(item)}
            onContactPoster={handleContactPoster}
            onOpenReportModal={handleOpenReportModal}
            initialSearch={filterSearch}
            initialCategory={filterCategory}
          />
        )}

        {activeTab === 'found' && (
          <ItemsView
            key="found-view"
            type="found"
            items={items}
            loading={loading}
            onSelectItem={item => setSelectedItem(item)}
            onContactPoster={handleContactPoster}
            onOpenReportModal={handleOpenReportModal}
            initialSearch={filterSearch}
            initialCategory={filterCategory}
          />
        )}

        {activeTab === 'my-posts' && (
          <MyPostsView
            items={items}
            loading={loading}
            onSelectItem={item => setSelectedItem(item)}
            onEditItem={handleEditItem}
            onOpenReportModal={handleOpenReportModal}
            onRefreshItems={fetchData}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesView
            initialItemId={messageTargetItemId}
            initialReceiverId={messageTargetReceiverId}
            items={items}
            onSelectItem={item => setSelectedItem(item)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            items={items}
            onOpenReportModal={handleOpenReportModal}
            onNavigateToTab={handleNavigateToTab}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onContactPoster={handleContactPoster}
          onEditItem={handleEditItem}
          onItemUpdated={fetchData}
          onSelectMatchedItem={matchedItem => setSelectedItem(matchedItem)}
        />
      )}

      {reportModalOpen && (
        <ReportItemModal
          initialType={reportModalType}
          itemToEdit={itemToEdit}
          onClose={() => {
            setReportModalOpen(false);
            setItemToEdit(null);
          }}
          onSuccess={() => {
            fetchData();
            setActiveTab(reportModalType === 'lost' ? 'lost' : 'found');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  <Search className="w-4 h-4" />
                </div>
                <span className="text-base font-extrabold text-white">CampusFind</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A unified lost & found platform built for college campus students to search, report, and recover
                personal belongings powered by Gemini AI matching.
              </p>
              <div className="text-[11px] text-blue-400 font-mono">
                Built for CSE Hackathon 2025
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Quick Navigation</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors">
                    Dashboard Overview
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('lost')} className="hover:text-white transition-colors">
                    Reported Lost Items
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('found')} className="hover:text-white transition-colors">
                    Discovered Found Items
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('my-posts')} className="hover:text-white transition-colors">
                    Manage My Reports
                  </button>
                </li>
              </ul>
            </div>

            {/* AI Matching Info */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Matching Engine
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                When new lost and found reports are submitted, our Gemini AI evaluates name, category, description, and
                campus locations to suggest matches and percentage similarities.
              </p>
            </div>

            {/* Campus Security & Safety */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Campus Safety
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Always meet in well-lit public areas like the Student Union. If you lost high-value items or government IDs,
                also contact Campus Safety.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-mono font-semibold">Campus Safety: (555) 019-9111</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© {new Date().getFullYear()} CampusFind — Student-driven Lost & Found Platform.</p>
            <div className="flex items-center gap-4">
              <span>All registered accounts have equal permissions</span>
              <span>•</span>
              <span>Fast Full-Stack Architecture</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </NotificationProvider>
  );
}
