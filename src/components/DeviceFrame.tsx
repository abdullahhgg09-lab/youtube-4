import React, { ReactNode } from 'react';
import { Smartphone, Monitor, Battery, Wifi } from 'lucide-react';

interface DeviceFrameProps {
  mode: 'responsive' | 'ios' | 'android';
  onModeChange: (mode: 'responsive' | 'ios' | 'android') => void;
  children: ReactNode;
  darkMode: boolean;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  mode,
  onModeChange,
  children,
  darkMode,
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (mode === 'responsive') {
    return (
      <div className="w-full min-h-screen relative">
        {/* Floating Quick Device Switcher Pill in Responsive Mode */}
        <div className="fixed top-3 right-4 z-40 flex items-center gap-1 p-1 rounded-full border shadow-lg backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800">
          <button
            id="btn-switch-responsive"
            onClick={() => onModeChange('responsive')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow"
            title="Full Web View"
          >
            <Monitor className="w-3 h-3" />
            <span>Web</span>
          </button>
          <button
            id="btn-switch-ios"
            onClick={() => onModeChange('ios')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Preview iPhone 16 Pro (React Native iOS)"
          >
            <Smartphone className="w-3 h-3" />
            <span>iOS</span>
          </button>
          <button
            id="btn-switch-android"
            onClick={() => onModeChange('android')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Preview Galaxy S24 (React Native Android)"
          >
            <Smartphone className="w-3 h-3" />
            <span>Android</span>
          </button>
        </div>
        {children}
      </div>
    );
  }

  const isIOS = mode === 'ios';

  return (
    <div className={`min-h-screen py-6 px-4 flex flex-col items-center justify-center transition-colors duration-200 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Top Device Switcher Controls */}
      <div className="mb-4 flex items-center gap-2 p-1.5 rounded-full border shadow-sm backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 z-30">
        <button
          id="btn-switch-responsive"
          onClick={() => onModeChange('responsive')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            mode === 'responsive'
              ? 'bg-rose-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Switch to Full Web View"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Web</span>
        </button>

        <button
          id="btn-switch-ios"
          onClick={() => onModeChange('ios')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            mode === 'ios'
              ? 'bg-rose-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Preview iPhone 16 Pro (React Native iOS)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>iOS (iPhone 16 Pro)</span>
        </button>

        <button
          id="btn-switch-android"
          onClick={() => onModeChange('android')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            mode === 'android'
              ? 'bg-rose-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Preview Galaxy S24 (React Native Android)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android (Galaxy S24)</span>
        </button>
      </div>

      {/* Hardware Frame Simulator */}
      <div
        className={`relative w-full max-w-[410px] h-[860px] max-h-[92vh] rounded-[50px] shadow-2xl border-[10px] flex flex-col overflow-hidden transition-all duration-300 ${
          isIOS
            ? darkMode
              ? 'border-slate-800 bg-slate-950 ring-2 ring-slate-700/50 shadow-black/80'
              : 'border-slate-900 bg-slate-900 ring-2 ring-slate-400/50'
            : darkMode
            ? 'border-slate-800 bg-slate-950 rounded-[40px] ring-2 ring-slate-700/40'
            : 'border-slate-900 bg-slate-900 rounded-[40px] ring-2 ring-slate-400/40'
        }`}
      >
        {/* Device Status Bar */}
        <div className={`relative w-full px-7 pt-3 pb-1 flex items-center justify-between text-xs z-30 select-none ${
          darkMode ? 'text-slate-200' : 'text-slate-800'
        }`}>
          <span className="font-semibold text-xs tracking-tight">{currentTime}</span>

          {/* Camera Notch / Dynamic Island */}
          {isIOS ? (
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-6 bg-black rounded-full flex items-center justify-between px-2.5 shadow-inner">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-indigo-950" />
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
          ) : (
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-3.5 h-3.5 bg-black rounded-full border border-slate-800" />
          )}

          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">5G</span>
            <div className="flex items-center gap-0.5">
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Inner App Container */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative [transform:translateZ(0)]">
          {children}
        </div>

        {/* Native Bottom Home Indicator */}
        <div className="w-full h-5 flex items-center justify-center select-none shrink-0">
          <div className={`w-32 h-1 rounded-full ${
            darkMode ? 'bg-slate-700' : 'bg-slate-400'
          }`} />
        </div>
      </div>
    </div>
  );
};
