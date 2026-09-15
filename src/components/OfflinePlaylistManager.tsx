import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  Shuffle,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Cloud,
  Share2,
  HardDrive,
  FolderOpen,
  CheckCircle2,
  X
} from 'lucide-react';
import { Playlist, VideoItem } from '../types';

interface OfflinePlaylistManagerProps {
  playlists: Playlist[];
  videos: VideoItem[];
  onCreatePlaylist: (title: string, description: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRemoveVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  onMoveVideoInPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  onPlayPlaylist: (playlist: Playlist, startIndex?: number) => void;
  onToggleCloudSync: (playlistId: string) => void;
  darkMode: boolean;
}

export const OfflinePlaylistManager: React.FC<OfflinePlaylistManagerProps> = ({
  playlists,
  videos,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveVideoFromPlaylist,
  onMoveVideoInPlaylist,
  onPlayPlaylist,
  onToggleCloudSync,
  darkMode,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(playlists[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];

  // Resolve videos in current playlist
  const playlistVideos: VideoItem[] = activePlaylist
    ? activePlaylist.videoIds
        .map((vidId) => videos.find((v) => v.id === vidId))
        .filter((v): v is VideoItem => Boolean(v))
    : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreatePlaylist(newTitle.trim(), newDesc.trim() || 'Offline user playlist');
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  const calculatePlaylistStorage = (items: VideoItem[]) => {
    const totalBytes = items.reduce((acc, item) => {
      const fmt = item.formats.find((f) => f.resolution === '2160p') || item.formats[0];
      return acc + (fmt ? fmt.fileSizeBytes : 0);
    }, 0);
    if (totalBytes > 1024 * 1024 * 1024) {
      return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${Math.round(totalBytes / (1024 * 1024))} MB`;
  };

  const handleExportPlaylist = (pl: Playlist) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pl, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${pl.title.toLowerCase().replace(/\s+/g, '-')}-playlist.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <ListMusic className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold">Offline Playlist Manager</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize downloaded 4K videos and audio tracks into custom playlists for playback without an internet connection.
          </p>
        </div>

        <button
          id="btn-new-playlist"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Playlists Horizontal / Grid Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {playlists.map((pl) => {
          const isSelected = pl.id === selectedPlaylistId;
          const count = pl.videoIds.length;

          return (
            <div
              key={pl.id}
              onClick={() => setSelectedPlaylistId(pl.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                isSelected
                  ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold truncate">{pl.title}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{count} videos offline</p>
                  </div>
                </div>

                {/* Cloud sync badge */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCloudSync(pl.id);
                  }}
                  className={`p-1 rounded-lg transition-colors ${
                    pl.isAutoSync ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={pl.isAutoSync ? 'Cloud Sync Enabled' : 'Click to enable Cloud Sync'}
                >
                  <Cloud className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                {pl.description}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800/80 pt-2">
                <span>{pl.isAutoSync ? '☁️ Auto-Synced' : 'Local Only'}</span>
                <span className="text-rose-500 font-semibold">{isSelected ? 'Active Selection' : 'Click to open'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Playlist Detail & Track Listing */}
      {activePlaylist && (
        <div className={`p-4 sm:p-5 rounded-3xl border ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Playlist Info Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">{activePlaylist.title}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                  {calculatePlaylistStorage(playlistVideos)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activePlaylist.description}
              </p>
            </div>

            {/* Actions for active playlist */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="btn-play-all-playlist"
                onClick={() => onPlayPlaylist(activePlaylist, 0)}
                disabled={playlistVideos.length === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold shadow-lg transition-all ${
                  playlistVideos.length > 0
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Play All ({playlistVideos.length})</span>
              </button>

              <button
                onClick={() => {
                  if (playlistVideos.length > 0) {
                    const randomIdx = Math.floor(Math.random() * playlistVideos.length);
                    onPlayPlaylist(activePlaylist, randomIdx);
                  }
                }}
                disabled={playlistVideos.length === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-2xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
                title="Shuffle Play"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>

              <button
                onClick={() => handleExportPlaylist(activePlaylist)}
                className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Export Playlist JSON"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {playlists.length > 1 && (
                <button
                  onClick={() => onDeletePlaylist(activePlaylist.id)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  title="Delete this playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Videos inside Playlist */}
          <div className="mt-4 space-y-2">
            {playlistVideos.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No videos in this playlist yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Add videos to "{activePlaylist.title}" from the Explore tab or the Batch Downloader!
                </p>
              </div>
            ) : (
              playlistVideos.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    darkMode
                      ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Order number & thumbnail */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-xs font-mono font-bold text-slate-400 w-5 text-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className="relative w-20 h-13 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                      {item.is4K && (
                        <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[7px] font-black bg-rose-600 text-white">
                          4K
                        </span>
                      )}
                      <span className="absolute bottom-1 right-1 px-1 text-[8px] font-mono bg-black/80 text-white rounded">
                        {item.duration}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.channel} • {item.views}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Offline Cache Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Controls: Play, Reorder, Remove */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onPlayPlaylist(activePlaylist, idx)}
                      className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow transition-transform active:scale-95"
                      title="Play this video"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </button>

                    <div className="flex flex-col">
                      <button
                        onClick={() => idx > 0 && onMoveVideoInPlaylist(activePlaylist.id, idx, idx - 1)}
                        disabled={idx === 0}
                        className={`p-1 rounded hover:bg-slate-800 ${
                          idx === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => idx < playlistVideos.length - 1 && onMoveVideoInPlaylist(activePlaylist.id, idx, idx + 1)}
                        disabled={idx === playlistVideos.length - 1}
                        className={`p-1 rounded hover:bg-slate-800 ${
                          idx === playlistVideos.length - 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveVideoFromPlaylist(activePlaylist.id, item.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border p-5 shadow-2xl ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-rose-500" />
                <span>Create Offline Playlist</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Playlist Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4K Workout Mix, Tech Tutorials"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:ring-2 focus:ring-rose-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. High resolution offline videos for travel without Wi-Fi"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl border resize-none focus:ring-2 focus:ring-rose-500 ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
