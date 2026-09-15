import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  Sparkles,
  Music,
  FolderPlus,
  Clock,
  HardDrive
} from 'lucide-react';
import { VideoItem, VideoFormat, Playlist } from '../types';

interface DownloadModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onConfirmDownload: (video: VideoItem, format: VideoFormat, targetPlaylistId?: string) => void;
  playlists: Playlist[];
  darkMode: boolean;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  video,
  onClose,
  onConfirmDownload,
  playlists,
  darkMode,
}) => {
  if (!video) return null;

  const [selectedFormatId, setSelectedFormatId] = useState<string>(
    video.formats.find((f) => f.resolution === '2160p')?.id || video.formats[0]?.id || 'fmt-1080p'
  );
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>('');

  const selectedFormat = video.formats.find((f) => f.id === selectedFormatId) || video.formats[0];

  const handleDownload = () => {
    if (selectedFormat) {
      onConfirmDownload(video, selectedFormat, targetPlaylistId || undefined);
      onClose();
    }
  };

  return (
    <div
      id="download-format-modal-overlay"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
    >
      <div
        className={`w-full max-w-lg rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          darkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-600/10 text-rose-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Download Video & Audio</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select resolution & offline quality</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Preview Snapshot */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
          <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-800">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
            />
            {video.is4K && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white tracking-wider">
                4K UHD
              </span>
            )}
            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white">
              {video.duration}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-semibold truncate">{video.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{video.channel} • {video.views}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                Fast Direct Download
              </span>
            </div>
          </div>
        </div>

        {/* Format Selection List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
            Available Formats & Bitrates
          </label>

          {video.formats.map((fmt) => {
            const isSelected = fmt.id === selectedFormatId;
            const is4K = fmt.resolution === '2160p';
            const isAudio = fmt.resolution === 'audio';

            return (
              <div
                key={fmt.id}
                onClick={() => setSelectedFormatId(fmt.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    is4K
                      ? 'bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-sm'
                      : isAudio
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {is4K ? <Sparkles className="w-5 h-5" /> : isAudio ? <Music className="w-5 h-5" /> : <Download className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{fmt.label}</span>
                      {is4K && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                          PREMIUM 4K
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {fmt.codec} • {fmt.bitrate} • {fmt.container.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-xs font-bold block">{fmt.fileSizeFormatted}</span>
                    <span className="text-[10px] text-slate-400">~{Math.ceil(fmt.fileSizeBytes / (1024 * 1024 * 12))}s</span>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-400 dark:border-slate-600'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add to Playlist selector */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5" />
              Save Directly To Offline Playlist (Optional)
            </label>
            <select
              value={targetPlaylistId}
              onChange={(e) => setTargetPlaylistId(e.target.value)}
              className={`w-full text-xs font-medium px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <option value="">(No playlist, download to storage only)</option>
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  📁 {pl.title} ({pl.videoIds.length} videos)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Target: Internal Storage / Videos</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Speed ~ 18.5 MB/s (Hardware accelerated)</span>
            </div>
          </div>

          <button
            id="btn-confirm-download-action"
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 transition-all active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Start Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
