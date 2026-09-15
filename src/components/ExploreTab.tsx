import React, { useState } from 'react';
import {
  Search,
  Download,
  Play,
  Sparkles,
  CheckCircle2,
  FolderPlus,
  Compass,
  ArrowRight,
  Flame,
  Film
} from 'lucide-react';
import { VideoItem } from '../types';

interface ExploreTabProps {
  videos: VideoItem[];
  onOpenDownloadModal: (video: VideoItem) => void;
  onPlayVideo: (video: VideoItem) => void;
  onInspectUrl: (url: string) => Promise<void>;
  isInspecting: boolean;
  onAddToPlaylistQuick: (video: VideoItem) => void;
  darkMode: boolean;
  inspectedVideo?: VideoItem | null;
  onClearInspectedVideo?: () => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  videos,
  onOpenDownloadModal,
  onPlayVideo,
  onInspectUrl,
  isInspecting,
  onAddToPlaylistQuick,
  darkMode,
  inspectedVideo,
  onClearInspectedVideo,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tags = ['All', '4K UHD', 'Stream', 'Tech', 'Music', 'Nature', 'Space', 'Coding'];

  const filteredVideos = videos.filter((video) => {
    const matchesTag = selectedTag === 'All' || video.tags.includes(selectedTag);
    const matchesSearch =
      searchQuery === '' ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleInspectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = urlInput.trim();
    if (clean) {
      setSelectedTag('All');
      setSearchQuery('');
      await onInspectUrl(clean);
    }
  };

  const sampleUrls = [
    { label: '4K Patagonia HDR', url: 'https://www.youtube.com/watch?v=1La4QzGeaaQ' },
    { label: 'React Native New Arch', url: 'https://www.youtube.com/watch?v=0-S5a0eXPoc' },
    { label: 'Lofi Study 320k', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Search & URL Inspector Hero */}
      <div className={`p-4 sm:p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800'
          : 'bg-gradient-to-br from-rose-50/80 via-white to-slate-50 border-rose-100'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">
            Node.js 4K Stream Extraction Engine
          </span>
        </div>

        <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
          Download YouTube Videos in 4K UHD & Audio Master
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
          Paste any YouTube video link to analyze stream formats, watch in built-in player, or download in 2160p 60fps AV01 codecs.
        </p>

        {/* Input Bar */}
        <form onSubmit={handleInspectSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="input-youtube-url"
              type="text"
              placeholder="Paste any YouTube video link (e.g. https://www.youtube.com/watch?v=... or youtu.be/...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-inner font-mono ${
                darkMode
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <button
            id="btn-inspect-download"
            type="submit"
            disabled={isInspecting || !urlInput.trim()}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-lg transition-all active:scale-95 ${
              urlInput.trim() && !isInspecting
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'
                : 'bg-slate-700/50 cursor-not-allowed text-slate-400'
            }`}
          >
            {isInspecting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Loading Video...</span>
              </span>
            ) : (
              <>
                <span>Inspect & Show Video</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Fast sample URL chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="font-semibold">Quick Demo Links:</span>
          {sampleUrls.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setUrlInput(sample.url);
                setSelectedTag('All');
                setSearchQuery('');
                onInspectUrl(sample.url);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent Spotlight Card for Inspected Video */}
      {inspectedVideo && (
        <div
          id="inspected-video-spotlight"
          className={`p-4 sm:p-5 rounded-3xl border-2 transition-all shadow-xl animate-in fade-in slide-in-from-top-3 duration-300 ${
            darkMode
              ? 'bg-slate-900/90 border-rose-500/80 shadow-rose-950/40'
              : 'bg-rose-50/80 border-rose-400 shadow-rose-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Video Found & Ready: {inspectedVideo.title.slice(0, 40)}...
              </span>
            </div>
            {onClearInspectedVideo && (
              <button
                onClick={onClearInspectedVideo}
                className="text-xs text-slate-400 hover:text-slate-100 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Dismiss Spotlight"
              >
                Dismiss
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start">
            {/* Thumbnail Box */}
            <div
              className="relative w-full md:w-72 aspect-video rounded-2xl overflow-hidden bg-slate-950 shrink-0 cursor-pointer group shadow-md"
              onClick={() => onPlayVideo(inspectedVideo)}
            >
              <img
                src={inspectedVideo.thumbnailUrl}
                alt={inspectedVideo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-600 text-white shadow">
                  4K UHD
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-900/90 text-white backdrop-blur-sm">
                  {inspectedVideo.duration}
                </span>
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Info & Action Buttons */}
            <div className="flex-1 flex flex-col justify-between min-w-0 space-y-3">
              <div>
                <h2
                  onClick={() => onPlayVideo(inspectedVideo)}
                  className="text-base sm:text-lg font-black line-clamp-2 cursor-pointer hover:text-rose-500 transition-colors"
                >
                  {inspectedVideo.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span className="font-semibold text-rose-400">{inspectedVideo.channel}</span>
                  <span>•</span>
                  <span>{inspectedVideo.views}</span>
                  <span>•</span>
                  <span>{inspectedVideo.uploadedAt}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {inspectedVideo.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  id="btn-spotlight-watch"
                  onClick={() => onPlayVideo(inspectedVideo)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Watch Video Now</span>
                </button>

                <button
                  id="btn-spotlight-download"
                  onClick={() => onOpenDownloadModal(inspectedVideo)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 text-rose-400" />
                  <span>Download 4K (2160p / 1080p / MP3)</span>
                </button>

                <button
                  onClick={() => onAddToPlaylistQuick(inspectedVideo)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-all"
                >
                  <FolderPlus className="w-4 h-4 text-slate-400" />
                  <span>Add to Playlist</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories & Filter Chips */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedTag === t
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/20'
                  : darkMode
                  ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === '4K UHD' ? '✨ 4K UHD' : t}
            </button>
          ))}
        </div>

        {/* In-tab filter search */}
        <div className="relative w-44 shrink-0 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Filter list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1 text-xs rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className={`rounded-3xl border overflow-hidden transition-all duration-200 flex flex-col group ${
              darkMode
                ? 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700 hover:shadow-xl hover:shadow-black/40'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg'
            }`}
          >
            {/* Thumbnail Box */}
            <div className="relative aspect-video w-full bg-slate-800 overflow-hidden cursor-pointer" onClick={() => onPlayVideo(video)}>
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Badges */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                {video.is4K && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-gradient-to-r from-rose-600 to-amber-500 text-white tracking-wider shadow-md">
                    4K ULTRA HD
                  </span>
                )}
                {video.isDownloaded && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/90 text-white flex items-center gap-0.5 backdrop-blur-sm">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Offline
                  </span>
                )}
              </div>

              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-black/80 text-white backdrop-blur-sm">
                {video.duration}
              </span>

              {/* Hover Play Button */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-900/50 transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-2.5">
                  {video.channelAvatar && (
                    <img
                      src={video.channelAvatar}
                      alt={video.channel}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3
                      onClick={() => onPlayVideo(video)}
                      className="text-xs sm:text-sm font-bold line-clamp-2 cursor-pointer hover:text-rose-500 transition-colors"
                      title={video.title}
                    >
                      {video.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {video.channel} • {video.views} • {video.uploadedAt}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onPlayVideo(video)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Play</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAddToPlaylistQuick(video)}
                    className="p-1.5 rounded-xl border border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Add to Offline Playlist"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenDownloadModal(video)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
