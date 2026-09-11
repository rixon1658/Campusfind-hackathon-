import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from './NotificationToast';
import { User, LogIn, UserPlus, X, Sparkles, School, Mail, Lock, Phone, BookOpen, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, signup, quickLogin } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch available demo accounts for 1-click testing
    fetch('/api/auth/demo-users')
      .then(res => res.json())
      .then(data => {
        if (data.users) setDemoUsers(data.users);
      })
      .catch(() => {});
  }, []);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (authMode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        showToast('success', 'Welcome back!', 'Successfully signed in to CampusFind.');
      } else {
        showToast('error', 'Login Failed', res.error || 'Check your email and password.');
      }
    } else {
      if (!name.trim()) {
        setLoading(false);
        showToast('error', 'Name Required', 'Please enter your full student name.');
        return;
      }
      const res = await signup({
        name,
        email,
        password,
        studentId,
        department,
        phone,
      });
      setLoading(false);
      if (res.success) {
        showToast('success', 'Account Created!', 'Welcome to CampusFind student community.');
      } else {
        showToast('error', 'Sign Up Failed', res.error || 'Unable to register account.');
      }
    }
  };

  const handleDemoSelect = (user: any) => {
    quickLogin(user);
    showToast('info', `Signed in as ${user.name}`, `${user.department}`);
  };

  return (
    <AnimatePresence>
      <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          id="auth-modal-content"
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header Banner */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">CampusFind</h2>
                  <p className="text-xs text-blue-300 font-medium">Student Authentication</p>
                </div>
              </div>
              <button
                id="close-auth-modal-btn"
                onClick={closeAuthModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex bg-slate-950/60 p-1 rounded-xl mt-5 border border-slate-800">
              <button
                id="auth-tab-login"
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Log In
              </button>
              <button
                id="auth-tab-signup"
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  authMode === 'signup'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Quick Demo Switcher (Crucial for Hackathon evaluation!) */}
            <div className="mb-6 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Instant Hackathon Demo Login
                </span>
                <span className="text-[11px] text-slate-500 font-mono">1-click test</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {demoUsers.length > 0 ? (
                  demoUsers.map(user => (
                    <button
                      key={user.id}
                      id={`demo-user-btn-${user.id}`}
                      type="button"
                      onClick={() => handleDemoSelect(user)}
                      className="text-left px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-blue-900/30 border border-slate-800 hover:border-blue-500/50 transition-all text-xs group"
                    >
                      <div className="font-semibold text-slate-200 group-hover:text-blue-300 truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{user.department.split(' ')[0]}</div>
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleDemoSelect({
                        id: 'user-demo-1',
                        name: 'Alex Chen',
                        email: 'alex.chen@campus.edu',
                        studentId: 'STU-2024-8841',
                        department: 'Computer Science & Engineering',
                        phone: '(555) 234-5678',
                      })
                    }
                    className="text-left px-3 py-2 rounded-lg bg-slate-900 hover:bg-blue-900/30 border border-slate-800 text-xs"
                  >
                    <div className="font-medium text-slate-200">Alex Chen (CSE)</div>
                  </button>
                )}
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Student Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        id="signup-name-input"
                        type="text"
                        required
                        placeholder="e.g. Jordan Taylor"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Student ID</label>
                      <input
                        id="signup-studentid-input"
                        type="text"
                        placeholder="e.g. STU-2026-9102"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone (Optional)</label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                        <input
                          id="signup-phone-input"
                          type="tel"
                          placeholder="(555) 000-0000"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department / Major</label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <select
                        id="signup-department-select"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Biological Sciences">Biological Sciences</option>
                        <option value="Business Administration">Business Administration</option>
                        <option value="Physics & Mathematics">Physics & Mathematics</option>
                        <option value="Liberal Arts & Design">Liberal Arts & Design</option>
                        <option value="Health Sciences">Health Sciences</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Campus Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="student@campus.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {authMode === 'login' ? 'Sign In to CampusFind' : 'Complete Registration'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  {authMode === 'login' ? "Don't have an account yet? " : 'Already registered? '}
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-blue-400 font-semibold hover:underline"
                  >
                    {authMode === 'login' ? 'Create student account' : 'Log in here'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
