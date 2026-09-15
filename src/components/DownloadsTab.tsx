import React, { useState } from 'react';
import {
  Download,
  Play,
  Trash2,
  HardDrive,
  CheckCircle2,
  FolderPlus,
  Share2,
  Sparkles,
  Music,
  Filter,
  FileVideo,
  ExternalLink
} from 'lucide-react';
import { VideoItem, VideoFormat, Playlist } from '../types';

interface DownloadsTabProps {
  downloadedVideos: VideoItem[];
  onPlayVideo: (video: VideoItem) => void;
  onDeleteVideo: (videoId: string) => void;
  onAddToPlaylist: (video: VideoItem) => void;
  playlists: Playlist[];
  darkMode: boolean;
}

export const DownloadsTab: React.FC<DownloadsTabProps> = ({
  downloadedVideos,
  onPlayVideo,
  onDeleteVideo,
  onAddToPlaylist,
  playlists,
  darkMode,
}) => {
  const [filterType, setFilterType] = useState<'all' | '4k' | 'audio'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filtered = downloadedVideos.filter((v) => {
    const matchesType =
      filterType === 'all'
        ? true
        : filterType === '4k'
        ? v.is4K
        : v.tags.includes('Music') || v.tags.includes('Lofi');
    const matchesSearch =
      searchFilter === '' ||
      v.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      v.channel.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalBytes = downloadedVideos.reduce((acc, v) => {
    const fmt = v.formats.find((f) => f.resolution === '2160p') || v.formats[0];
    return acc + (fmt ? fmt.fileSizeBytes : 150 * 1024 * 1024);
  }, 0);

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Offline Storage Metrics Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl border shadow-sm ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold">Offline Storage Library</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  {downloadedVideos.length} Items Saved
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Saved to sandboxed mobile storage for offline flight and commute playback.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs font-mono font-bold text-rose-500">
              {formatSize(totalBytes)} Storage Used
            </div>
            <div className="text-[11px] text-slate-400">
              112.4 GB Free on Device
            </div>
          </div>
        </div>

        {/* Storage Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-rose-600 rounded-full" style={{ width: '18%' }} />
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }} />
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '8%' }} />
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600" /> 4K Ultra HD Video
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> 1080p FHD
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> MP3 Audio 320k
            </span>
          </div>
        </div>
      </div>

      {/* Filter Chips & Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Offline ({downloadedVideos.length})
          </button>
          <button
            onClick={() => setFilterType('4k')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === '4k'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ✨ 4K UHD Only
          </button>
          <button
            onClick={() => setFilterType('audio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'audio'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            🎵 Audio Tracks
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter saved videos..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-800/80 text-white w-40 sm:w-56 focus:outline-none"
        />
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 rounded-3xl border border-dashed border-slate-800">
            <FileVideo className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-bold">No offline videos matched this filter.</p>
            <p className="text-[11px] text-slate-400 mt-1">Download videos from Explore or Batch Downloader to play offline.</p>
          </div>
        ) : (
          filtered.map((video) => {
            const fmt = video.formats.find((f) => f.resolution === '2160p') || video.formats[0];

            return (
              <div
                key={video.id}
                className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  darkMode
                    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Thumbnail & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => onPlayVideo(video)}>
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                    {video.is4K && (
                      <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[7px] font-black bg-rose-600 text-white">
                        4K UHD
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1 px-1 text-[8px] font-mono bg-black/80 text-white rounded">
                      {video.duration}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold truncate hover:text-rose-500 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {video.channel} • {fmt?.fileSizeFormatted || '180 MB'} • {fmt?.bitrate || '28 Mbps'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Cached Offline (Direct Playable)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <button
                    onClick={() => onPlayVideo(video)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Offline</span>
                  </button>

                  <button
                    onClick={() => onAddToPlaylist(video)}
                    className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
                    title="Add to Playlist"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteVideo(video.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete offline file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
