import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  Cloud,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, name: string, pass: string) => Promise<void>;
  onLogout: () => void;
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
  darkMode: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  user,
  onClose,
  onLogin,
  onRegister,
  onLogout,
  onTriggerSync,
  isSyncing,
  darkMode,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    try {
      if (isRegisterMode) {
        await onRegister(email, name, password);
      } else {
        await onLogin(email, password);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      await onLogin('abdullahhgg09@gmail.com', 'demo1234');
      onClose();
    } catch (err: any) {
      setErrorMessage('Failed to sign in demo account.');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes > 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600/10 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {user ? 'Cloud Account & Sync' : isRegisterMode ? 'Create Cloud Account' : 'Sign In to Cloud'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cross-device synchronization for playlists & 4K offline history
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          /* Logged In View */
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-13 h-13 rounded-2xl object-cover ring-2 ring-rose-500/50"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold truncate">{user.name}</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {user.membership}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Authenticated Session Active
                </p>
              </div>
            </div>

            {/* Cloud Storage Usage */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-800/30 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <HardDrive className="w-3.5 h-3.5 text-rose-500" />
                  Cloud Storage Quota
                </span>
                <span className="font-mono text-slate-400">
                  {formatBytes(user.cloudStorageUsedBytes)} / {formatBytes(user.cloudStorageLimitBytes)}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                  style={{ width: `${Math.min(100, (user.cloudStorageUsedBytes / user.cloudStorageLimitBytes) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Last Synced: {new Date(user.lastSyncTimestamp).toLocaleTimeString()}</span>
                <span className="text-emerald-400 font-medium">Automatic Delta Sync</span>
              </div>
            </div>

            {/* Sync Now Action */}
            <div className="flex items-center gap-2">
              <button
                id="btn-manual-sync-now"
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing Cloud...' : 'Sync Playlists & Data Now'}</span>
              </button>

              <button
                id="btn-user-logout"
                onClick={onLogout}
                className="p-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register Form */
          <div className="p-5 space-y-4">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegisterMode && (
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800/80 text-white focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800/80 text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800/80 text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 transition-all active:scale-95"
              >
                {loading ? 'Processing...' : isRegisterMode ? 'Create Cloud Account' : 'Sign In'}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Or Fast Test
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              onClick={handleDemoLogin}
              type="button"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Continue with Pro Demo Account (1-Click)</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs text-rose-500 hover:underline font-medium"
              >
                {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
