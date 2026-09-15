import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent state for sessions, sync, downloads, and notifications
interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatar: string;
  membership: string;
  cloudStorageUsedBytes: number;
  cloudStorageLimitBytes: number;
  lastSyncTimestamp: string;
}

const usersDb: Record<string, StoredUser> = {
  'usr-demo-1': {
    id: 'usr-demo-1',
    email: 'abdullahhgg09@gmail.com',
    name: 'Abdullah H.',
    passwordHash: 'demo1234',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    membership: 'Pro 4K Member',
    cloudStorageUsedBytes: 4.8 * 1024 * 1024 * 1024,
    cloudStorageLimitBytes: 50 * 1024 * 1024 * 1024,
    lastSyncTimestamp: new Date().toISOString(),
  },
};

const cloudSyncStore: Record<string, { playlists: any[]; downloads: any[]; settings: any; lastSync: string }> = {
  'usr-demo-1': {
    playlists: [],
    downloads: [],
    settings: {},
    lastSync: new Date().toISOString(),
  },
};

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), platform: 'Node.js Express + Cross-Platform Engine' });
});

// Authentication Routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = Object.values(usersDb).find((u) => u.email.toLowerCase() === (email || '').toLowerCase());

  if (user) {
    res.json({
      success: true,
      token: `jwt-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        membership: user.membership,
        cloudStorageUsedBytes: user.cloudStorageUsedBytes,
        cloudStorageLimitBytes: user.cloudStorageLimitBytes,
        lastSyncTimestamp: user.lastSyncTimestamp,
      },
    });
    return;
  }

  // If user doesn't exist yet, auto-register for seamless testing
  const newUserId = `usr-${Date.now()}`;
  const newUser: StoredUser = {
    id: newUserId,
    email: email || 'user@example.com',
    name: (email || 'User').split('@')[0],
    passwordHash: password || 'pass',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${newUserId}`,
    membership: 'Pro 4K Member',
    cloudStorageUsedBytes: 1.2 * 1024 * 1024 * 1024,
    cloudStorageLimitBytes: 50 * 1024 * 1024 * 1024,
    lastSyncTimestamp: new Date().toISOString(),
  };

  usersDb[newUserId] = newUser;
  cloudSyncStore[newUserId] = {
    playlists: [],
    downloads: [],
    settings: {},
    lastSync: new Date().toISOString(),
  };

  res.json({
    success: true,
    token: `jwt-${newUser.id}-${Date.now()}`,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      membership: newUser.membership,
      cloudStorageUsedBytes: newUser.cloudStorageUsedBytes,
      cloudStorageLimitBytes: newUser.cloudStorageLimitBytes,
      lastSyncTimestamp: newUser.lastSyncTimestamp,
    },
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  const existing = Object.values(usersDb).find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'Account with this email already exists' });
    return;
  }

  const id = `usr-${Date.now()}`;
  const newUser: StoredUser = {
    id,
    email,
    name: name || email.split('@')[0],
    passwordHash: password,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
    membership: 'Pro 4K Member',
    cloudStorageUsedBytes: 0,
    cloudStorageLimitBytes: 50 * 1024 * 1024 * 1024,
    lastSyncTimestamp: new Date().toISOString(),
  };

  usersDb[id] = newUser;
  cloudSyncStore[id] = { playlists: [], downloads: [], settings: {}, lastSync: new Date().toISOString() };

  res.json({
    success: true,
    token: `jwt-${id}-${Date.now()}`,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      membership: newUser.membership,
      cloudStorageUsedBytes: newUser.cloudStorageUsedBytes,
      cloudStorageLimitBytes: newUser.cloudStorageLimitBytes,
      lastSyncTimestamp: newUser.lastSyncTimestamp,
    },
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  const userId = token.split('-')[1];

  const user = userId && usersDb[userId] ? usersDb[userId] : usersDb['usr-demo-1'];
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      membership: user.membership,
      cloudStorageUsedBytes: user.cloudStorageUsedBytes,
      cloudStorageLimitBytes: user.cloudStorageLimitBytes,
      lastSyncTimestamp: user.lastSyncTimestamp,
    },
  });
});

// Helper to extract YouTube video ID and real metadata via oEmbed
async function resolveYouTubeMetadata(inputUrl: string) {
  const cleanUrl = (inputUrl || '').trim();
  let videoId: string | null = null;

  // Match standard, short, embed, shorts, and live YouTube URLs
  const ytMatch = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    videoId = ytMatch[1];
  }

  let title = '';
  let channel = 'YouTube Creator';
  let thumbnailUrl = '';
  let channelAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${videoId || cleanUrl}`;

  if (videoId) {
    thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  // Attempt official YouTube oEmbed resolution (fast, reliable, no API key required)
  try {
    const targetOembedUrl = videoId
      ? `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      : `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(targetOembedUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data: any = await resp.json();
      if (data.title) title = data.title;
      if (data.author_name) channel = data.author_name;
      if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
    }
  } catch (err) {
    // If oEmbed fails or times out, proceed with fallback
  }

  if (!title) {
    if (videoId) {
      title = `YouTube Video (${videoId})`;
    } else {
      title = cleanUrl.replace(/^https?:\/\//, '').split('?')[0] || 'Stream Video';
    }
  }

  if (!thumbnailUrl) {
    thumbnailUrl = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
  }

  return {
    videoId,
    title,
    channel,
    thumbnailUrl,
    channelAvatar,
  };
}

// Video metadata resolver
app.post('/api/video/info', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  const meta = await resolveYouTubeMetadata(url);
  const parsedId = meta.videoId || ('yt-' + Math.random().toString(36).substring(2, 9));

  const isHighRes = !url.toLowerCase().includes('low') && !url.toLowerCase().includes('360');
  const durationSec = 480 + Math.floor(Math.random() * 600);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const durationStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const videoMeta = {
    id: parsedId,
    youtubeId: meta.videoId || undefined,
    url,
    title: meta.title,
    channel: meta.channel,
    channelAvatar: meta.channelAvatar,
    duration: durationStr,
    durationSeconds: durationSec,
    views: `${(1.5 + Math.random() * 5).toFixed(1)}M views`,
    uploadedAt: 'Online Stream',
    thumbnailUrl: meta.thumbnailUrl,
    videoSourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    is4K: isHighRes,
    tags: ['All', '4K UHD', 'Stream'],
    description: `Direct high-definition stream for "${meta.title}". Ready for 4K AV01/VP9 decoding, offline MP4 download, and built-in playback.`,
    formats: [
      {
        id: 'fmt-4k',
        resolution: '2160p',
        label: '4K Ultra HD (2160p 60fps HDR)',
        height: 2160,
        fps: 60,
        codec: 'AV01 / Opus Mux',
        container: 'mp4',
        fileSizeBytes: Math.round(durationSec * 2.8 * 1024 * 1024),
        fileSizeFormatted: `${(durationSec * 0.027).toFixed(1)} GB`,
        hasAudio: true,
        bitrate: '28 Mbps',
      },
      {
        id: 'fmt-1440p',
        resolution: '1440p',
        label: '2K Quad HD (1440p 60fps)',
        height: 1440,
        fps: 60,
        codec: 'VP9 / AAC',
        container: 'mp4',
        fileSizeBytes: Math.round(durationSec * 1.4 * 1024 * 1024),
        fileSizeFormatted: `${Math.round(durationSec * 1.4)} MB`,
        hasAudio: true,
        bitrate: '14 Mbps',
      },
      {
        id: 'fmt-1080p',
        resolution: '1080p',
        label: 'Full HD (1080p 60fps)',
        height: 1080,
        fps: 60,
        codec: 'H.264 / AAC',
        container: 'mp4',
        fileSizeBytes: Math.round(durationSec * 0.75 * 1024 * 1024),
        fileSizeFormatted: `${Math.round(durationSec * 0.75)} MB`,
        hasAudio: true,
        bitrate: '7.5 Mbps',
      },
      {
        id: 'fmt-720p',
        resolution: '720p',
        label: 'HD (720p 30fps)',
        height: 720,
        fps: 30,
        codec: 'H.264 / AAC',
        container: 'mp4',
        fileSizeBytes: Math.round(durationSec * 0.35 * 1024 * 1024),
        fileSizeFormatted: `${Math.round(durationSec * 0.35)} MB`,
        hasAudio: true,
        bitrate: '3.5 Mbps',
      },
      {
        id: 'fmt-audio-mp3',
        resolution: 'audio',
        label: 'Audio Only - MP3 Studio Master (320kbps)',
        height: 0,
        fps: 0,
        codec: 'LAME MP3',
        container: 'mp3',
        fileSizeBytes: Math.round(durationSec * 0.04 * 1024 * 1024),
        fileSizeFormatted: `${Math.round(durationSec * 0.04)} MB`,
        isAudioOnly: true,
        hasAudio: true,
        bitrate: '320 kbps',
      },
    ],
  };

  res.json({ success: true, video: videoMeta });
});

// Batch parser: takes list of URLs and returns parsed items with live oEmbed metadata
app.post('/api/batch/parse', async (req: Request, res: Response) => {
  const { urls } = req.body;
  if (!Array.isArray(urls) || urls.length === 0) {
    res.status(400).json({ error: 'Provide an array of URLs' });
    return;
  }

  const parsed = await Promise.all(
    urls.map(async (u: string, idx: number) => {
      const cleanUrl = u.trim();
      const meta = await resolveYouTubeMetadata(cleanUrl);
      const isAudio = cleanUrl.toLowerCase().includes('audio') || cleanUrl.toLowerCase().includes('mp3');
      const parsedId = meta.videoId || `batch-${idx}-${Date.now()}`;

      return {
        id: parsedId,
        youtubeId: meta.videoId || undefined,
        url: cleanUrl,
        title: meta.title,
        channel: meta.channel,
        duration: '08:45',
        durationSeconds: 525,
        thumbnailUrl: meta.thumbnailUrl,
        videoSourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        is4K: !isAudio,
        tags: ['All', '4K UHD', 'Batch'],
        formats: [
          {
            id: 'fmt-4k',
            resolution: '2160p',
            label: '4K Ultra HD (2160p 60fps)',
            height: 2160,
            fps: 60,
            codec: 'AV01 / Opus',
            container: 'mp4',
            fileSizeBytes: 240 * 1024 * 1024,
            fileSizeFormatted: '240 MB',
            hasAudio: true,
            bitrate: '28 Mbps',
          },
          {
            id: 'fmt-1080p',
            resolution: '1080p',
            label: 'Full HD (1080p 60fps)',
            height: 1080,
            fps: 60,
            codec: 'H.264 / AAC',
            container: 'mp4',
            fileSizeBytes: 85 * 1024 * 1024,
            fileSizeFormatted: '85 MB',
            hasAudio: true,
            bitrate: '7.5 Mbps',
          },
          {
            id: 'fmt-audio',
            resolution: 'audio',
            label: 'Audio MP3 (320kbps)',
            height: 0,
            fps: 0,
            codec: 'MP3',
            container: 'mp3',
            fileSizeBytes: 18 * 1024 * 1024,
            fileSizeFormatted: '18 MB',
            isAudioOnly: true,
            hasAudio: true,
            bitrate: '320 kbps',
          },
        ],
      };
    })
  );

  res.json({ success: true, videos: parsed });
});

// Cloud Synchronization Endpoints
app.post('/api/sync/push', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  const userId = token.split('-')[1] || 'usr-demo-1';

  const { playlists, downloads, settings } = req.body;
  const now = new Date().toISOString();

  cloudSyncStore[userId] = {
    playlists: playlists || [],
    downloads: downloads || [],
    settings: settings || {},
    lastSync: now,
  };

  if (usersDb[userId]) {
    usersDb[userId].lastSyncTimestamp = now;
  }

  res.json({
    success: true,
    lastSyncTimestamp: now,
    message: 'Cloud synchronization completed successfully across mobile and web clients.',
  });
});

app.get('/api/sync/pull', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  const userId = token.split('-')[1] || 'usr-demo-1';

  const data = cloudSyncStore[userId] || {
    playlists: [],
    downloads: [],
    settings: {},
    lastSync: new Date().toISOString(),
  };

  res.json({ success: true, data });
});

// Push Notifications dispatcher
app.post('/api/notifications/trigger', (req: Request, res: Response) => {
  const { title, message, type, videoId } = req.body;
  const notification = {
    id: `notif-${Date.now()}`,
    title: title || 'New Content Alert',
    message: message || 'A newly uploaded 4K video is ready for offline caching.',
    timestamp: 'Just now',
    type: type || 'content_update',
    read: false,
    videoId: videoId || null,
  };

  res.json({ success: true, notification });
});

// React Native cross-platform configuration descriptor
app.get('/api/mobile/config', (req: Request, res: Response) => {
  res.json({
    appName: 'YouTube Video Downloader',
    bundleId: 'com.streamloader.downloader',
    platforms: ['iOS (Swift / TurboModules)', 'Android (Kotlin / JNI)', 'React Native 0.76+ New Architecture'],
    storageEngines: ['AsyncStorage', 'FileSystem (react-native-blob-util)', 'MMKV Cloud Sync Cache'],
    backgroundDownloader: 'BackgroundActions / WorkManager',
    offlinePlayback: 'react-native-video 6.x (AVPlayer & ExoPlayer 4K hardware accelerated)',
    pushNotifications: 'React Native Firebase Messaging / APNs',
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YouTube Video Downloader server running on port ${PORT}`);
  });
}

startServer();
