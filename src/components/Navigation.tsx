import React from 'react';
import {
  Compass,
  Layers,
  ListMusic,
  Download,
  Bell,
  Sliders,
  User,
  Moon,
  Sun,
  Cloud,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavigationProps {
  currentTab: 'explore' | 'batch' | 'playlists' | 'downloads';
  onTabChange: (tab: 'explore' | 'batch' | 'playlists' | 'downloads') => void;
  activeDownloadsCount: number;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  user: UserProfile | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isSyncing: boolean;
}

export const TopHeader: React.FC<NavigationProps> = ({
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSettings,
  onOpenAuth,
  user,
  darkMode,
  onToggleDarkMode,
  isSyncing,
}) => {
  return (
    <header className={`w-full px-4 py-3 border-b flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${
      darkMode ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
    }`}>
      {/* Brand & Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-900/30">
          <Download className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold tracking-tight">StreamLoader</span>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-600 text-white tracking-wider">
              4K PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-400">Cross-Platform Downloader</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5">
        {/* Cloud Sync Status Indicator */}
        <button
          onClick={onOpenAuth}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
            isSyncing
              ? 'border-rose-500 text-rose-400 bg-rose-500/10 animate-pulse'
              : user
              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
              : 'border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Cloud Sync Status"
        >
          <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="text-[11px]">{isSyncing ? 'Syncing...' : user ? 'Cloud Active' : 'Sign In'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="btn-header-theme-toggle"
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Push Notification Bell */}
        <button
          id="btn-header-notifications"
          onClick={onOpenNotifications}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
          title="Push Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
          {unreadNotificationsCount > 0 && (
            <span className="absolute 1 top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* Settings Button */}
        <button
          id="btn-header-settings"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Settings & Preferences"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <button
          id="btn-header-auth"
          onClick={onOpenAuth}
          className="ml-1 p-1 rounded-xl hover:ring-2 hover:ring-rose-500 transition-all"
          title={user ? user.name : 'Sign In to Cloud'}
        >
          {user ? (
            <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

export const BottomTabBar: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  activeDownloadsCount,
  darkMode,
}) => {
  const tabs: { id: 'explore' | 'batch' | 'playlists' | 'downloads'; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'batch', label: 'Batch DL', icon: Layers, badge: activeDownloadsCount },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'downloads', label: 'Offline', icon: Download },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-xl ${
      darkMode ? 'bg-slate-950/95 border-slate-800/80 text-slate-400' : 'bg-white/95 border-slate-200 text-slate-600'
    }`}>
      <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-rose-600 font-bold scale-105'
                  : 'hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black leading-tight animate-pulse">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-rose-600 -mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
