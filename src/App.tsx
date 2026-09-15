/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  VideoItem,
  VideoFormat,
  DownloadJob,
  Playlist,
  UserProfile,
  NotificationItem,
  AppSettings,
  VideoResolution
} from './types';
import { INITIAL_VIDEOS, INITIAL_PLAYLISTS, INITIAL_NOTIFICATIONS } from './data/sampleVideos';
import { DeviceFrame } from './components/DeviceFrame';
import { TopHeader, BottomTabBar } from './components/Navigation';
import { ExploreTab } from './components/ExploreTab';
import { BatchDownloader } from './components/BatchDownloader';
import { OfflinePlaylistManager } from './components/OfflinePlaylistManager';
import { DownloadsTab } from './components/DownloadsTab';
import { DownloadModal } from './components/DownloadModal';
import { BuiltInMediaPlayer } from './components/BuiltInMediaPlayer';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { NotificationDrawer } from './components/NotificationDrawer';

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  themeMode: 'dark',
  defaultQuality: '2160p',
  pushNotificationsEnabled: true,
  contentUpdateAlerts: true,
  downloadCompleteAlerts: true,
  retentionAlerts: true,
  wifiOnlyDownloads: true,
  maxConcurrentDownloads: 3,
  autoSyncCloud: true,
  downloadAudioOnlyDefault: false,
  devicePreviewMode: 'responsive',
};

export default function App() {
  // Application Data States
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('app_videos');
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('app_playlists');
    return saved ? JSON.parse(saved) : INITIAL_PLAYLISTS;
  });

  const [downloadQueue, setDownloadQueue] = useState<DownloadJob[]>(() => {
    const saved = localStorage.getItem('app_download_queue');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('app_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('app_user');
    if (saved) return JSON.parse(saved);
    return {
      id: 'usr-demo-1',
      email: 'abdullahhgg09@gmail.com',
      name: 'Abdullah H.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      membership: 'Pro 4K Member',
      cloudStorageUsedBytes: 4.8 * 1024 * 1024 * 1024,
      cloudStorageLimitBytes: 50 * 1024 * 1024 * 1024,
      lastSyncTimestamp: new Date().toISOString(),
    };
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('app_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  // UI Flow States
  const [currentTab, setCurrentTab] = useState<'explore' | 'batch' | 'playlists' | 'downloads'>('explore');
  const [selectedVideoForDownload, setSelectedVideoForDownload] = useState<VideoItem | null>(null);
  const [activePlayerVideo, setActivePlayerVideo] = useState<VideoItem | null>(null);
  const [playerPlaylistQueue, setPlayerPlaylistQueue] = useState<VideoItem[]>([]);
  const [playerPlaylistIndex, setPlayerPlaylistIndex] = useState<number>(0);
  const [inspectedVideo, setInspectedVideo] = useState<VideoItem | null>(null);

  // Modals & Drawers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('app_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('app_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('app_download_queue', JSON.stringify(downloadQueue));
  }, [downloadQueue]);

  useEffect(() => {
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('app_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('app_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Push Notification Dispatcher
  const emitPushNotification = (title: string, message: string, type: 'content_update' | 'download_complete' | 'retention' | 'sync', videoId?: string) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false,
      videoId,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    // Native Web Notification API if permitted
    if (settings.pushNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=128&auto=format&fit=crop&q=80',
        });
      } catch (e) {
        // Fallback silently
      }
    }
  };

  // Background Downloader Simulation Worker
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloadQueue((currentQueue) => {
        const activeCount = currentQueue.filter((j) => j.status === 'downloading').length;
        let availableSlots = Math.max(0, settings.maxConcurrentDownloads - activeCount);

        let hasChanges = false;
        const nextQueue = currentQueue.map((job) => {
          // Promote queued to downloading if slots available
          if (job.status === 'queued' && availableSlots > 0) {
            availableSlots--;
            hasChanges = true;
            return {
              ...job,
              status: 'downloading' as const,
              downloadSpeedMbps: 18 + Math.random() * 12,
            };
          }

          // Advance downloading jobs
          if (job.status === 'downloading') {
            hasChanges = true;
            const stepIncrement = Math.floor(Math.random() * 8) + 6;
            const nextProgress = Math.min(100, job.progress + stepIncrement);
            const downloadedBytes = Math.floor((nextProgress / 100) * job.totalBytes);
            const remainingBytes = job.totalBytes - downloadedBytes;
            const speed = 16 + Math.random() * 14;
            const eta = Math.ceil(remainingBytes / (speed * 1024 * 1024 * 0.125)) || 1;

            if (nextProgress >= 100) {
              // Mark as completed
              const completedJob = {
                ...job,
                status: 'completed' as const,
                progress: 100,
                downloadedBytes: job.totalBytes,
                downloadSpeedMbps: 0,
                etaSeconds: 0,
                completedAt: new Date().toISOString(),
              };

              // Update videos collection
              setVideos((allVideos) =>
                allVideos.map((v) =>
                  v.id === job.videoId
                    ? {
                        ...v,
                        isDownloaded: true,
                        downloadedFormat: job.selectedFormat,
                        downloadDate: new Date().toISOString(),
                      }
                    : v
                )
              );

              // If job had target playlist, add videoId to playlist
              if (job.playlistId) {
                setPlaylists((allPl) =>
                  allPl.map((pl) =>
                    pl.id === job.playlistId && !pl.videoIds.includes(job.videoId)
                      ? { ...pl, videoIds: [...pl.videoIds, job.videoId], updatedAt: new Date().toISOString() }
                      : pl
                  )
                );
              }

              // Emit Push Notification for download complete
              if (settings.downloadCompleteAlerts) {
                emitPushNotification(
                  `Download Completed: ${job.video.title.slice(0, 32)}...`,
                  `Saved in ${job.selectedFormat.label} to offline storage. Ready to play!`,
                  'download_complete',
                  job.videoId
                );
              }

              return completedJob;
            }

            return {
              ...job,
              progress: nextProgress,
              downloadedBytes,
              downloadSpeedMbps: speed,
              etaSeconds: eta,
            };
          }

          return job;
        });

        return hasChanges ? nextQueue : currentQueue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.maxConcurrentDownloads, settings.downloadCompleteAlerts]);

  // Handler: Inspect YouTube URL via Node.js API
  const handleInspectUrl = async (url: string) => {
    setIsInspecting(true);
    try {
      const res = await fetch('/api/video/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success && data.video) {
        // Prepend and ensure no duplicate
        setVideos((prev) => [data.video, ...prev.filter((v) => v.id !== data.video.id)]);
        setInspectedVideo(data.video);
        emitPushNotification(
          'Video Analyzed Successfully',
          `"${data.video.title}" is ready for 4K streaming and high-speed download!`,
          'content_update',
          data.video.id
        );
      }
    } catch (err) {
      console.error('Failed to parse URL from backend', err);
    } finally {
      setIsInspecting(false);
    }
  };

  // Handler: Start Single Download
  const handleConfirmSingleDownload = (video: VideoItem, format: VideoFormat, targetPlaylistId?: string) => {
    const newJob: DownloadJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      videoId: video.id,
      video,
      selectedFormat: format,
      status: 'queued',
      progress: 0,
      downloadedBytes: 0,
      totalBytes: format.fileSizeBytes,
      downloadSpeedMbps: 20,
      etaSeconds: 15,
      createdAt: new Date().toISOString(),
      playlistId: targetPlaylistId,
    };

    setDownloadQueue((prev) => [newJob, ...prev]);
    setCurrentTab('batch');
  };

  // Handler: Start Batch Downloads
  const handleStartBatch = async (urls: string[], formatRes: VideoResolution, targetPlaylistId?: string) => {
    try {
      const res = await fetch('/api/batch/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      const parsedVideos: VideoItem[] = data.videos || [];

      // Add to catalog if not present
      setVideos((prev) => {
        const newOnes = parsedVideos.filter((nv) => !prev.some((ov) => ov.id === nv.id));
        return [...newOnes, ...prev];
      });

      // Create download jobs for each
      const newJobs: DownloadJob[] = parsedVideos.map((vid, idx) => {
        const chosenFormat =
          vid.formats.find((f) => f.resolution === formatRes) ||
          vid.formats[0];

        return {
          id: `batch-job-${Date.now()}-${idx}`,
          videoId: vid.id,
          video: vid,
          selectedFormat: chosenFormat,
          status: 'queued',
          progress: 0,
          downloadedBytes: 0,
          totalBytes: chosenFormat.fileSizeBytes,
          downloadSpeedMbps: 0,
          etaSeconds: 20,
          createdAt: new Date().toISOString(),
          playlistId: targetPlaylistId,
        };
      });

      setDownloadQueue((prev) => [...newJobs, ...prev]);
    } catch (err) {
      console.error('Batch parse error', err);
    }
  };

  // Queue Controls
  const handlePauseJob = (jobId: string) => {
    setDownloadQueue((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'paused', downloadSpeedMbps: 0 } : j))
    );
  };

  const handleResumeJob = (jobId: string) => {
    setDownloadQueue((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'downloading', downloadSpeedMbps: 18 } : j))
    );
  };

  const handleCancelJob = (jobId: string) => {
    setDownloadQueue((prev) => prev.filter((j) => j.id !== jobId));
  };

  const handlePauseAll = () => {
    setDownloadQueue((prev) =>
      prev.map((j) => (j.status === 'downloading' ? { ...j, status: 'paused', downloadSpeedMbps: 0 } : j))
    );
  };

  const handleResumeAll = () => {
    setDownloadQueue((prev) =>
      prev.map((j) => (j.status === 'paused' ? { ...j, status: 'queued' } : j))
    );
  };

  const handleClearCompleted = () => {
    setDownloadQueue((prev) => prev.filter((j) => j.status !== 'completed'));
  };

  // Playlist Management
  const handleCreatePlaylist = (title: string, description: string): string => {
    const id = `pl-${Date.now()}`;
    const newPlaylist: Playlist = {
      id,
      title,
      description,
      videoIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isAutoSync: true,
    };
    setPlaylists((prev) => [newPlaylist, ...prev]);
    return id;
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  };

  const handleRemoveVideoFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId ? { ...p, videoIds: p.videoIds.filter((id) => id !== videoId) } : p
      )
    );
  };

  const handleMoveVideoInPlaylist = (playlistId: string, fromIndex: number, toIndex: number) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== playlistId) return p;
        const newArr = [...p.videoIds];
        const [moved] = newArr.splice(fromIndex, 1);
        newArr.splice(toIndex, 0, moved);
        return { ...p, videoIds: newArr };
      })
    );
  };

  const handleToggleCloudSync = (playlistId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, isAutoSync: !p.isAutoSync } : p))
    );
  };

  // Media Player Launchers
  const handlePlayVideo = (video: VideoItem) => {
    setActivePlayerVideo(video);
    setPlayerPlaylistQueue([video]);
    setPlayerPlaylistIndex(0);
  };

  const handlePlayPlaylist = (playlist: Playlist, startIndex = 0) => {
    const resolved = playlist.videoIds
      .map((vidId) => videos.find((v) => v.id === vidId))
      .filter((v): v is VideoItem => Boolean(v));

    if (resolved.length > 0) {
      setPlayerPlaylistQueue(resolved);
      setPlayerPlaylistIndex(startIndex);
      setActivePlayerVideo(resolved[startIndex] || resolved[0]);
    }
  };

  // Cloud Synchronization Handler
  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || 'jwt-demo-token'}`,
        },
        body: JSON.stringify({
          playlists,
          downloads: videos.filter((v) => v.isDownloaded),
          settings,
        }),
      });
      const data = await res.json();
      if (data.success && user) {
        setUser({
          ...user,
          lastSyncTimestamp: data.lastSyncTimestamp || new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Sync failed', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      setUser({ ...data.user, token: data.token });
    } else {
      throw new Error(data.error || 'Login failed');
    }
  };

  const handleRegister = async (email: string, name: string, pass: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password: pass }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      setUser({ ...data.user, token: data.token });
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  // Push Notification Simulator
  const handleSimulatePushNotification = async () => {
    try {
      const res = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New 4K Release: Silicon Frontier #42',
          message: 'TechPulse just uploaded "2nm Wafer Scaling & Neural Engines" in 4K 60fps HDR. Save for offline viewing now!',
          type: 'content_update',
          videoId: 'yt-tech-review',
        }),
      });
      const data = await res.json();
      if (data.success && data.notification) {
        setNotifications((prev) => [data.notification, ...prev]);
        emitPushNotification(data.notification.title, data.notification.message, 'content_update', data.notification.videoId);
      }
    } catch (e) {
      emitPushNotification(
        'New 4K Upload from Earth Cinema',
        'Watch "Iceland Arctic Auroras in 4K UHD" - Instant download available!',
        'content_update',
        'yt-nordic-drone'
      );
    }
  };

  const activeDownloadsCount = downloadQueue.filter((j) => j.status === 'downloading' || j.status === 'queued').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const content = (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      settings.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header */}
      <TopHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeDownloadsCount={activeDownloadsCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        user={user}
        darkMode={settings.darkMode}
        onToggleDarkMode={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
        isSyncing={isSyncing}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4 overflow-y-auto">
        {currentTab === 'explore' && (
          <ExploreTab
            videos={videos}
            inspectedVideo={inspectedVideo}
            onClearInspectedVideo={() => setInspectedVideo(null)}
            onOpenDownloadModal={(vid) => setSelectedVideoForDownload(vid)}
            onPlayVideo={handlePlayVideo}
            onInspectUrl={handleInspectUrl}
            isInspecting={isInspecting}
            onAddToPlaylistQuick={(vid) => {
              if (playlists.length > 0) {
                setPlaylists((prev) =>
                  prev.map((pl, idx) =>
                    idx === 0 && !pl.videoIds.includes(vid.id)
                      ? { ...pl, videoIds: [...pl.videoIds, vid.id] }
                      : pl
                  )
                );
              }
            }}
            darkMode={settings.darkMode}
          />
        )}

        {currentTab === 'batch' && (
          <BatchDownloader
            downloadQueue={downloadQueue}
            onStartBatch={handleStartBatch}
            onPauseJob={handlePauseJob}
            onResumeJob={handleResumeJob}
            onCancelJob={handleCancelJob}
            onClearCompleted={handleClearCompleted}
            onPauseAll={handlePauseAll}
            onResumeAll={handleResumeAll}
            playlists={playlists}
            onCreatePlaylist={handleCreatePlaylist}
            onPlayVideo={handlePlayVideo}
            darkMode={settings.darkMode}
            maxConcurrency={settings.maxConcurrentDownloads}
            onConcurrencyChange={(val) => setSettings((s) => ({ ...s, maxConcurrentDownloads: val }))}
          />
        )}

        {currentTab === 'playlists' && (
          <OfflinePlaylistManager
            playlists={playlists}
            videos={videos}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onRemoveVideoFromPlaylist={handleRemoveVideoFromPlaylist}
            onMoveVideoInPlaylist={handleMoveVideoInPlaylist}
            onPlayPlaylist={handlePlayPlaylist}
            onToggleCloudSync={handleToggleCloudSync}
            darkMode={settings.darkMode}
          />
        )}

        {currentTab === 'downloads' && (
          <DownloadsTab
            downloadedVideos={videos.filter((v) => v.isDownloaded)}
            onPlayVideo={handlePlayVideo}
            onDeleteVideo={(vidId) =>
              setVideos((prev) =>
                prev.map((v) => (v.id === vidId ? { ...v, isDownloaded: false } : v))
              )
            }
            onAddToPlaylist={(vid) => {
              if (playlists.length > 0) {
                setPlaylists((prev) =>
                  prev.map((pl, idx) =>
                    idx === 0 && !pl.videoIds.includes(vid.id)
                      ? { ...pl, videoIds: [...pl.videoIds, vid.id] }
                      : pl
                  )
                );
              }
            }}
            playlists={playlists}
            darkMode={settings.darkMode}
          />
        )}
      </main>

      {/* Bottom Tab Bar */}
      <BottomTabBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeDownloadsCount={activeDownloadsCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        user={user}
        darkMode={settings.darkMode}
        onToggleDarkMode={() => setSettings((s) => ({ ...s, darkMode: !s.darkMode }))}
        isSyncing={isSyncing}
      />

      {/* Built-in Media Player Overlay or Mini Dock */}
      {activePlayerVideo && (
        <BuiltInMediaPlayer
          currentVideo={activePlayerVideo}
          onClose={() => setActivePlayerVideo(null)}
          playlistVideos={playerPlaylistQueue}
          currentIndex={playerPlaylistIndex}
          onSelectTrack={(newIdx) => {
            if (playerPlaylistQueue[newIdx]) {
              setPlayerPlaylistIndex(newIdx);
              setActivePlayerVideo(playerPlaylistQueue[newIdx]);
            }
          }}
          darkMode={settings.darkMode}
        />
      )}

      {/* Format & Resolution Selection Modal */}
      {selectedVideoForDownload && (
        <DownloadModal
          video={selectedVideoForDownload}
          onClose={() => setSelectedVideoForDownload(null)}
          onConfirmDownload={handleConfirmSingleDownload}
          playlists={playlists}
          darkMode={settings.darkMode}
        />
      )}

      {/* User Auth & Cloud Sync Modal */}
      {isAuthModalOpen && (
        <AuthModal
          user={user}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onLogout={handleLogout}
          onTriggerSync={handleCloudSync}
          isSyncing={isSyncing}
          darkMode={settings.darkMode}
        />
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
          onClose={() => setIsSettingsModalOpen(false)}
          onSimulatePushNotification={handleSimulatePushNotification}
          darkMode={settings.darkMode}
        />
      )}

      {/* Push Notification History Drawer */}
      {isNotificationDrawerOpen && (
        <NotificationDrawer
          notifications={notifications}
          onClose={() => setIsNotificationDrawerOpen(false)}
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onClearAll={() => setNotifications([])}
          onSelectNotification={(notif) => {
            if (notif.videoId) {
              const target = videos.find((v) => v.id === notif.videoId);
              if (target) handlePlayVideo(target);
            }
            setNotifications((prev) =>
              prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
            );
          }}
          onTriggerTestNotification={handleSimulatePushNotification}
          darkMode={settings.darkMode}
        />
      )}
    </div>
  );

  return (
    <DeviceFrame
      mode={settings.devicePreviewMode}
      onModeChange={(mode) => setSettings((s) => ({ ...s, devicePreviewMode: mode }))}
      darkMode={settings.darkMode}
    >
      {content}
    </DeviceFrame>
  );
}
