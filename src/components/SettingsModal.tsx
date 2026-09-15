import React from 'react';
import {
  X,
  Moon,
  Sun,
  Bell,
  BellRing,
  Wifi,
  Sliders,
  Smartphone,
  Shield,
  Send,
  Zap,
  HardDrive
} from 'lucide-react';
import { AppSettings, VideoResolution } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClose: () => void;
  onSimulatePushNotification: () => void;
  darkMode: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onSimulatePushNotification,
  darkMode,
}) => {
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onUpdateSettings({ pushNotificationsEnabled: true });
        new Notification('Push Notifications Enabled', {
          body: 'You will receive updates when your favorite creators release new 4K videos!',
          icon: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=128&auto=format&fit=crop&q=80',
        });
      } else {
        onUpdateSettings({ pushNotificationsEnabled: false });
      }
    } else {
      // In-app fallback
      onUpdateSettings({ pushNotificationsEnabled: !settings.pushNotificationsEnabled });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600/10 text-rose-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Preferences & Settings</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Push notifications, dark mode, and cross-platform mobile specs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* 1. Theme & Dark Mode */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              Appearance & Theme
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-theme-dark"
                onClick={() => onUpdateSettings({ darkMode: true, themeMode: 'dark' })}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  settings.darkMode
                    ? 'border-rose-600 bg-rose-600/10 text-rose-500'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-800/30 text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark Mode (Obsidian)</span>
              </button>

              <button
                id="btn-theme-light"
                onClick={() => onUpdateSettings({ darkMode: false, themeMode: 'light' })}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  !settings.darkMode
                    ? 'border-rose-600 bg-rose-50 text-rose-600'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-800/30 text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </button>
            </div>
          </div>

          {/* 2. Push Notifications & Long-term Retention */}
          <div className="space-y-3 p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-rose-500" />
                <div>
                  <h4 className="text-xs font-bold">Push Notifications</h4>
                  <p className="text-[10px] text-slate-400">Keep engaged with new content uploads & downloads</p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="toggle-push-notifications"
                  type="checkbox"
                  checked={settings.pushNotificationsEnabled}
                  onChange={requestNotificationPermission}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>

            {/* Sub-toggles for notifications */}
            <div className="space-y-2 pt-2 border-t border-rose-900/20 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">New Content Upload Alerts</p>
                  <p className="text-[10px] text-slate-400">Instant notification when subscribed channels publish 4K videos</p>
                </div>
                <input
                  type="checkbox"
                  disabled={!settings.pushNotificationsEnabled}
                  checked={settings.contentUpdateAlerts}
                  onChange={(e) => onUpdateSettings({ contentUpdateAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">Download Finished Alerts</p>
                  <p className="text-[10px] text-slate-400">Alerts when large 4K batch downloads are ready for offline watching</p>
                </div>
                <input
                  type="checkbox"
                  disabled={!settings.pushNotificationsEnabled}
                  checked={settings.downloadCompleteAlerts}
                  onChange={(e) => onUpdateSettings({ downloadCompleteAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">Weekly Retention & Digest Pings</p>
                  <p className="text-[10px] text-slate-400">Curated weekly highlights tailored to your offline viewing habits</p>
                </div>
                <input
                  type="checkbox"
                  disabled={!settings.pushNotificationsEnabled}
                  checked={settings.retentionAlerts}
                  onChange={(e) => onUpdateSettings({ retentionAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Push Simulation button */}
              <div className="pt-2">
                <button
                  id="btn-simulate-push"
                  onClick={onSimulatePushNotification}
                  className="w-full py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-600/40 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simulate Instant Creator Upload Push Alert</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Resolution & Download Defaults */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Download & Stream Defaults
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Preferred Resolution</label>
                <select
                  value={settings.defaultQuality}
                  onChange={(e) => onUpdateSettings({ defaultQuality: e.target.value as VideoResolution })}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-white"
                >
                  <option value="2160p">✨ 4K Ultra HD (2160p)</option>
                  <option value="1440p">📺 2K Quad HD (1440p)</option>
                  <option value="1080p">🎬 Full HD (1080p)</option>
                  <option value="720p">📱 HD (720p)</option>
                  <option value="audio">🎵 Audio Only (MP3 320kbps)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Network Policy</label>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Wifi className="w-3.5 h-3.5 text-rose-500" />
                    <span>Wi-Fi Only (Save Mobile Data)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.wifiOnlyDownloads}
                    onChange={(e) => onUpdateSettings({ wifiOnlyDownloads: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Cross-Platform Node.js + React Native Specs */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold flex items-center gap-1.5 text-slate-200">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Cross-Platform Deployment Architecture
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Engineered with a high-performance <strong>Node.js backend</strong> and <strong>React Native</strong> modular cross-platform specifications for iOS and Android:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-300">
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-rose-400 font-bold block">iOS Engine:</span>
                Swift 6 + AVPlayer 4K HDR + BackgroundSessionManager
              </div>
              <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-emerald-400 font-bold block">Android Engine:</span>
                Kotlin + ExoPlayer 4K + WorkManager Service
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
