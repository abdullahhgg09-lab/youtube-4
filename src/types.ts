export type VideoResolution = '2160p' | '1440p' | '1080p' | '720p' | '480p' | '360p' | 'audio';

export interface VideoFormat {
  id: string;
  resolution: VideoResolution;
  label: string; // e.g. "4K Ultra HD (2160p)"
  height: number;
  fps: number;
  codec: string;
  container: 'mp4' | 'mkv' | 'webm' | 'mp3';
  fileSizeBytes: number;
  fileSizeFormatted: string;
  isAudioOnly?: boolean;
  hasAudio: boolean;
  bitrate: string;
}

export interface VideoItem {
  id: string;
  url: string;
  title: string;
  channel: string;
  channelAvatar?: string;
  duration: string; // e.g. "12:45"
  durationSeconds: number;
  views: string;
  uploadedAt: string;
  thumbnailUrl: string;
  youtubeId?: string;
  videoSourceUrl: string; // playable sample stream
  formats: VideoFormat[];
  tags: string[];
  description: string;
  is4K: boolean;
  isDownloaded?: boolean;
  downloadedFormat?: VideoFormat;
  downloadDate?: string;
  offlinePath?: string;
  playbackProgressSeconds?: number;
}

export type DownloadStatus = 'queued' | 'downloading' | 'paused' | 'completed' | 'failed';

export interface DownloadJob {
  id: string;
  videoId: string;
  video: VideoItem;
  selectedFormat: VideoFormat;
  status: DownloadStatus;
  progress: number; // 0 to 100
  downloadedBytes: number;
  totalBytes: number;
  downloadSpeedMbps: number;
  etaSeconds: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
  playlistId?: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  videoIds: string[];
  createdAt: string;
  updatedAt: string;
  isAutoSync?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  membership: 'Pro 4K Member' | 'Free Tier';
  cloudStorageUsedBytes: number;
  cloudStorageLimitBytes: number;
  lastSyncTimestamp: string;
  token?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'content_update' | 'download_complete' | 'retention' | 'sync';
  read: boolean;
  actionUrl?: string;
  videoId?: string;
}

export interface AppSettings {
  darkMode: boolean;
  themeMode: 'dark' | 'light' | 'system';
  defaultQuality: VideoResolution;
  pushNotificationsEnabled: boolean;
  contentUpdateAlerts: boolean;
  downloadCompleteAlerts: boolean;
  retentionAlerts: boolean;
  wifiOnlyDownloads: boolean;
  maxConcurrentDownloads: number;
  autoSyncCloud: boolean;
  downloadAudioOnlyDefault: boolean;
  devicePreviewMode: 'responsive' | 'ios' | 'android';
}
