import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Search,
  PlusCircle,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  FileText,
  AlertCircle,
  CheckCircle2,
  Bell,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReportModal: (type: 'lost' | 'found') => void;
  unreadMessagesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  unreadMessagesCount = 0,
}) => {
  const { currentUser, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileReportPickerOpen, setMobileReportPickerOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'lost', label: 'Lost Items', icon: AlertCircle },
    { id: 'found', label: 'Found Items', icon: CheckCircle2 },
    { id: 'my-posts', label: 'My Posts', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              id="navbar-brand-btn"
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold text-white tracking-tight">CampusFind</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    CSE HACKATHON
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Campus Lost & Found Platform</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Action Buttons + User Profile */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Report Buttons */}
            <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
              <button
                id="navbar-report-lost-btn"
                onClick={() => onOpenReportModal('lost')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
                Report Lost
              </button>
              <button
                id="navbar-report-found-btn"
                onClick={() => onOpenReportModal('found')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                Report Found
              </button>
            </div>

            {/* Auth Profile Section */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all focus:outline-none"
                >
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-blue-400 font-mono mt-0.5">Student</p>
                  </div>
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700 ring-2 ring-blue-500/20"
                  />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs"
                  >
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="font-semibold text-slate-100 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">
                        {currentUser.studentId}
                      </span>
                    </div>

                    <button
                      id="dropdown-profile-btn"
                      onClick={() => {
                        setActiveTab('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      View Profile & Settings
                    </button>

                    <button
                      id="dropdown-myposts-btn"
                      onClick={() => {
                        setActiveTab('my-posts');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/70 flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      My Reported Items
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      id="dropdown-logout-btn"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3">
          {/* Quick Buttons Mobile */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id="mobile-report-lost-btn"
              onClick={() => {
                onOpenReportModal('lost');
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost
            </button>
            <button
              id="mobile-report-found-btn"
              onClick={() => {
                onOpenReportModal('found');
                setMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found
            </button>
          </div>

          <div className="space-y-1 pt-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => handleNavClick('profile')}
              className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2.5 ${
                activeTab === 'profile' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile</span>
            </button>
          </div>

          <div className="border-t border-slate-800 pt-3">
            {currentUser ? (
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Quick Report Bottom Sheet */}
      {mobileReportPickerOpen && (
        <div
          id="mobile-report-backdrop"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end md:hidden p-4"
          onClick={() => setMobileReportPickerOpen(false)}
        >
          <div
            id="mobile-report-sheet"
            className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">Create Campus Report</h4>
                <p className="text-[11px] text-slate-400">Select report type to begin</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileReportPickerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                id="mobile-sheet-report-lost-btn"
                type="button"
                onClick={() => {
                  setMobileReportPickerOpen(false);
                  onOpenReportModal('lost');
                }}
                className="p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 flex flex-col items-center gap-2 transition-all active:scale-95"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold block text-white">Report Lost</span>
                  <span className="text-[10px] text-rose-300/80">Missing item</span>
                </div>
              </button>

              <button
                id="mobile-sheet-report-found-btn"
                type="button"
                onClick={() => {
                  setMobileReportPickerOpen(false);
                  onOpenReportModal('found');
                }}
                className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex flex-col items-center gap-2 transition-all active:scale-95"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold block text-white">Report Found</span>
                  <span className="text-[10px] text-emerald-300/80">Turned in item</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Bottom Dock Navigation */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around shadow-2xl"
      >
        <button
          type="button"
          onClick={() => handleNavClick('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors min-h-[44px] ${
            activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('lost')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors min-h-[44px] ${
            activeTab === 'lost' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertCircle className="w-5 h-5 mb-0.5" />
          <span>Lost</span>
        </button>

        {/* Central Plus Report Button */}
        <button
          id="mobile-dock-report-plus-btn"
          type="button"
          onClick={() => setMobileReportPickerOpen(true)}
          className="flex items-center justify-center -mt-5 w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/40 active:scale-95 transition-transform border border-blue-400/30"
          aria-label="Create report"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('found')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors min-h-[44px] ${
            activeTab === 'found' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span>Found</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavClick('messages')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors min-h-[44px] ${
            activeTab === 'messages' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Chat</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
          )}
        </button>
      </nav>
    </header>
  );
};
