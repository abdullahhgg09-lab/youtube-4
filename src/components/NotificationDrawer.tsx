import React from 'react';
import {
  X,
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  Download,
  Cloud,
  Clock,
  Play
} from 'lucide-react';
import { NotificationItem, VideoItem } from '../types';

interface NotificationDrawerProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (notif: NotificationItem) => void;
  onTriggerTestNotification: () => void;
  darkMode: boolean;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
  onClearAll,
  onSelectNotification,
  onTriggerTestNotification,
  darkMode,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className={`w-full max-w-md h-full border-l shadow-2xl flex flex-col transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600/10 text-rose-600 flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold">Push Notifications</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Content updates & retention alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white text-xs"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs font-semibold">No notifications right now.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                You'll receive push alerts when creators upload new 4K videos or downloads finish.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif.id}
                  onClick={() => onSelectNotification(notif)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isUnread
                      ? 'border-rose-600/50 bg-rose-950/20 shadow-sm'
                      : 'border-slate-800/60 bg-slate-800/20 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === 'content_update'
                        ? 'bg-rose-600 text-white'
                        : notif.type === 'download_complete'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}>
                      {notif.type === 'content_update' ? (
                        <Sparkles className="w-4 h-4" />
                      ) : notif.type === 'download_complete' ? (
                        <Download className="w-4 h-4" />
                      ) : (
                        <Cloud className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold truncate">{notif.title}</h4>
                        {isUnread && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{notif.timestamp}</span>
                        {notif.videoId && (
                          <span className="text-rose-400 font-bold flex items-center gap-0.5 ml-auto">
                            <Play className="w-2.5 h-2.5" /> Watch Now
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-900/50 space-y-2">
          <button
            onClick={onTriggerTestNotification}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Creator 4K Upload Push Alert</span>
          </button>

          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-rose-400 flex items-center justify-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Notification History</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
