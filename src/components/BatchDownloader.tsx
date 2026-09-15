import React, { useState } from 'react';
import {
  Layers,
  Download,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Music,
  FolderPlus,
  Zap,
  Sliders,
  RefreshCw,
  FileText
} from 'lucide-react';
import { DownloadJob, VideoItem, Playlist, VideoFormat, VideoResolution } from '../types';

interface BatchDownloaderProps {
  downloadQueue: DownloadJob[];
  onStartBatch: (urls: string[], formatRes: VideoResolution, targetPlaylistId?: string) => void;
  onPauseJob: (jobId: string) => void;
  onResumeJob: (jobId: string) => void;
  onCancelJob: (jobId: string) => void;
  onClearCompleted: () => void;
  onPauseAll: () => void;
  onResumeAll: () => void;
  playlists: Playlist[];
  onCreatePlaylist: (title: string, desc: string) => string;
  onPlayVideo: (video: VideoItem) => void;
  darkMode: boolean;
  maxConcurrency: number;
  onConcurrencyChange: (val: number) => void;
}

export const BatchDownloader: React.FC<BatchDownloaderProps> = ({
  downloadQueue,
  onStartBatch,
  onPauseJob,
  onResumeJob,
  onCancelJob,
  onClearCompleted,
  onPauseAll,
  onResumeAll,
  playlists,
  onCreatePlaylist,
  onPlayVideo,
  darkMode,
  maxConcurrency,
  onConcurrencyChange,
}) => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<VideoResolution>('2160p');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [newPlaylistName, setNewPlaylistName] = useState<string>('');
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  // Preset demo batches for fast user testing
  const presets = [
    {
      title: 'Top 4K Nature Clips (3 Videos)',
      urls: [
        'https://www.youtube.com/watch?v=1La4QzGeaaQ',
        'https://www.youtube.com/watch?v=Sagg08DrO5U',
        'https://www.youtube.com/watch?v=libKVRa01L8',
      ],
      quality: '2160p' as VideoResolution,
    },
    {
      title: 'Lofi Audio Master Mix (320kbps MP3)',
      urls: [
        'https://www.youtube.com/watch?v=jfKfPfyJRdk',
        'https://www.youtube.com/watch?v=5qap5aO4i9A',
      ],
      quality: 'audio' as VideoResolution,
    },
    {
      title: 'Tech Architecture Deep Dives (1080p)',
      urls: [
        'https://www.youtube.com/watch?v=M7FIvfx5J10',
        'https://www.youtube.com/watch?v=0-S5a0eXPoc',
      ],
      quality: '1080p' as VideoResolution,
    },
  ];

  const handleApplyPreset = (urls: string[], quality: VideoResolution) => {
    setUrlInput(urls.join('\n'));
    setSelectedQuality(quality);
  };

  const handleStartDownload = () => {
    const urls = urlInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) return;

    let targetPl = selectedPlaylistId;
    if (showNewPlaylistInput && newPlaylistName.trim()) {
      targetPl = onCreatePlaylist(newPlaylistName.trim(), 'Created via Batch Downloader');
    }

    onStartBatch(urls, selectedQuality, targetPl || undefined);
    setUrlInput('');
    setNewPlaylistName('');
    setShowNewPlaylistInput(false);
  };

  // Queue metrics
  const activeCount = downloadQueue.filter((j) => j.status === 'downloading').length;
  const queuedCount = downloadQueue.filter((j) => j.status === 'queued').length;
  const completedCount = downloadQueue.filter((j) => j.status === 'completed').length;
  const totalDownloadedBytes = downloadQueue.reduce((acc, j) => acc + j.downloadedBytes, 0);
  const totalBytes = downloadQueue.reduce((acc, j) => acc + (j.totalBytes || 1), 0);
  const totalSpeedMbps = downloadQueue
    .filter((j) => j.status === 'downloading')
    .reduce((acc, j) => acc + j.downloadSpeedMbps, 0);
  const aggregateProgress = totalBytes > 0 ? Math.round((totalDownloadedBytes / totalBytes) * 100) : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className={`p-5 rounded-3xl border shadow-sm relative overflow-hidden ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800'
          : 'bg-gradient-to-br from-rose-50/70 via-white to-orange-50/40 border-rose-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-900/30">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold">Multi-Stream Batch Downloader</h2>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-600 text-white tracking-wider">
                4K UHD READY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Queue multiple YouTube videos simultaneously. Download 4K HDR streams, extract high-bitrate MP3 audio, and assemble offline playlists with hardware-accelerated muxing.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, i) => (
              <button
                key={i}
                onClick={() => handleApplyPreset(preset.urls, preset.quality)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
                  darkMode
                    ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-white hover:bg-rose-50 border-slate-200 text-slate-700'
                }`}
              >
                ⚡ {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* URL Input Box */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <textarea
              id="batch-urls-input"
              rows={3}
              placeholder="Paste multiple YouTube URLs (one URL per line)...&#10;https://www.youtube.com/watch?v=1La4QzGeaaQ&#10;https://www.youtube.com/watch?v=M7FIvfx5J10"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className={`w-full p-3 text-xs font-mono rounded-2xl border resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed ${
                darkMode
                  ? 'bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
            {urlInput && (
              <button
                onClick={() => setUrlInput('')}
                className="absolute top-2.5 right-2.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800/40"
              >
                Clear
              </button>
            )}
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Batch Resolution Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Batch Resolution</label>
              <select
                id="batch-resolution-select"
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value as VideoResolution)}
                className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500 ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="2160p">✨ 4K Ultra HD (2160p 60fps)</option>
                <option value="1440p">📺 2K Quad HD (1440p)</option>
                <option value="1080p">🎬 Full HD (1080p 60fps)</option>
                <option value="720p">📱 HD (720p)</option>
                <option value="audio">🎵 Audio Only (MP3 320kbps)</option>
              </select>
            </div>

            {/* Target Playlist */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Assign to Offline Playlist</label>
              {!showNewPlaylistInput ? (
                <div className="flex gap-1.5">
                  <select
                    id="batch-playlist-select"
                    value={selectedPlaylistId}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    className={`flex-1 text-xs font-semibold px-3 py-2 rounded-xl border focus:ring-2 focus:ring-rose-500 ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="">(None, general storage)</option>
                    {playlists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowNewPlaylistInput(true)}
                    className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300"
                    title="Create new playlist"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="New Playlist Name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className={`flex-1 text-xs px-3 py-2 rounded-xl border ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                    }`}
                  />
                  <button
                    onClick={() => setShowNewPlaylistInput(false)}
                    className="px-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Concurrent Streams Control */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400">Concurrent Threads</label>
                <span className="text-[11px] font-mono font-bold text-rose-500">{maxConcurrency} parallel</span>
              </div>
              <input
                id="batch-concurrency-slider"
                type="range"
                min={1}
                max={5}
                value={maxConcurrency}
                onChange={(e) => onConcurrencyChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>
          </div>

          {/* Trigger Button */}
          <div className="pt-2 flex justify-end">
            <button
              id="btn-trigger-batch-download"
              onClick={handleStartDownload}
              disabled={!urlInput.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg ${
                urlInput.trim()
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                Download Batch (
                {urlInput.split('\n').filter((u) => u.trim().length > 0).length || 0}{' '}
                Videos)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Queue Status Card */}
      {downloadQueue.length > 0 && (
        <div className={`p-4 rounded-2xl border ${
          darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold">Queue Statistics</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>{downloadQueue.length} total</span>
                <span>•</span>
                <span className="text-rose-500 font-bold">{activeCount} downloading</span>
                <span>•</span>
                <span className="text-emerald-500 font-bold">{completedCount} complete</span>
              </div>
            </div>

            {/* Global Queue Controls */}
            <div className="flex items-center gap-2">
              <button
                id="btn-pause-all-batch"
                onClick={onPauseAll}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause All</span>
              </button>

              <button
                id="btn-resume-all-batch"
                onClick={onResumeAll}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume All</span>
              </button>

              {completedCount > 0 && (
                <button
                  id="btn-clear-completed-batch"
                  onClick={onClearCompleted}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Done</span>
                </button>
              )}
            </div>
          </div>

          {/* Aggregate Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Overall Progress: {aggregateProgress}%</span>
              <span>Speed: {totalSpeedMbps > 0 ? `${totalSpeedMbps.toFixed(1)} MB/s` : 'Idle'}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${aggregateProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Download Items List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Active & Queued Downloads ({downloadQueue.length})
        </h3>

        {downloadQueue.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border border-dashed ${
            darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'
          }`}>
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">No items currently queued in batch downloader.</p>
            <p className="text-[11px] mt-1 text-slate-400">Paste links above or choose a demo preset to test batch download speed.</p>
          </div>
        ) : (
          downloadQueue.map((job) => {
            const isCompleted = job.status === 'completed';
            const isDownloading = job.status === 'downloading';
            const isPaused = job.status === 'paused';
            const is4K = job.selectedFormat.resolution === '2160p';

            return (
              <div
                key={job.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center gap-3 ${
                  darkMode
                    ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-28 h-18 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                  <img
                    src={job.video.thumbnailUrl}
                    alt={job.video.title}
                    className="w-full h-full object-cover"
                  />
                  {is4K && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-rose-600 text-white">
                      4K UHD
                    </span>
                  )}
                  <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] font-mono bg-black/80 text-white">
                    {job.video.duration}
                  </span>
                </div>

                {/* Info & Progress */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold truncate">{job.video.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isDownloading
                        ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                        : isPaused
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-700/40 text-slate-400'
                    }`}>
                      {job.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{job.selectedFormat.label}</span>
                    <span>•</span>
                    <span>{job.selectedFormat.fileSizeFormatted}</span>
                    {isDownloading && (
                      <>
                        <span>•</span>
                        <span className="text-rose-400 font-mono font-semibold">
                          {job.downloadSpeedMbps.toFixed(1)} MB/s
                        </span>
                        <span>•</span>
                        <span>ETA: {job.etaSeconds}s</span>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isPaused
                          ? 'bg-amber-500'
                          : 'bg-rose-600'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0">
                  {isDownloading && (
                    <button
                      onClick={() => onPauseJob(job.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Pause"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}

                  {isPaused && (
                    <button
                      onClick={() => onResumeJob(job.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400"
                      title="Resume"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}

                  {isCompleted && (
                    <button
                      onClick={() => onPlayVideo(job.video)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play</span>
                    </button>
                  )}

                  <button
                    onClick={() => onCancelJob(job.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Remove from queue"
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
