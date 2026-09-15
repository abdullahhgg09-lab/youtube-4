import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronDown,
  Sparkles,
  Repeat,
  FastForward,
  SkipForward,
  SkipBack,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { VideoItem, VideoFormat } from '../types';

interface BuiltInMediaPlayerProps {
  currentVideo: VideoItem | null;
  onClose: () => void;
  playlistVideos?: VideoItem[];
  currentIndex?: number;
  onSelectTrack?: (index: number) => void;
  darkMode: boolean;
}

export const BuiltInMediaPlayer: React.FC<BuiltInMediaPlayerProps> = ({
  currentVideo,
  onClose,
  playlistVideos = [],
  currentIndex = 0,
  onSelectTrack,
  darkMode,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<string>('2160p');
  const [audioVisualizerBars, setAudioVisualizerBars] = useState<number[]>([40, 70, 95, 60, 85, 45, 90, 65]);
  const [playerMode, setPlayerMode] = useState<'youtube' | 'local'>('youtube');

  const ytId = currentVideo?.youtubeId || (currentVideo?.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i)?.[1]);

  useEffect(() => {
    if (currentVideo) {
      setIsPlaying(true);
      setCurrentTime(0);
      setSelectedResolution(currentVideo.is4K ? '2160p' : '1080p');
      if (ytId) {
        setPlayerMode('youtube');
      } else {
        setPlayerMode('local');
      }
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentVideo?.id, ytId]);

  // Audio equalizer oscillation effect when playing
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioVisualizerBars((prev) =>
          prev.map(() => Math.floor(25 + Math.random() * 70))
        );
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!currentVideo) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || currentVideo.durationSeconds || 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipTime = (delta: number) => {
    if (videoRef.current) {
      const next = Math.min(Math.max(0, videoRef.current.currentTime + delta), duration);
      videoRef.current.currentTime = next;
      setCurrentTime(next);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const hasNext = playlistVideos.length > 0 && currentIndex < playlistVideos.length - 1;
  const hasPrev = playlistVideos.length > 0 && currentIndex > 0;

  // Mini-Player Dock at bottom
  if (isMiniPlayer) {
    return (
      <div
        id="media-mini-player"
        className={`fixed bottom-16 left-0 right-0 max-w-md mx-auto z-40 px-3 py-2 transition-all duration-200`}
      >
        <div className={`flex items-center gap-3 p-2.5 rounded-2xl shadow-xl border backdrop-blur-xl ${
          darkMode
            ? 'bg-slate-900/95 border-slate-800 text-white'
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}>
          {/* Hidden video element keeping state */}
          <video
            ref={videoRef}
            src={currentVideo.videoSourceUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              if (isLooping && videoRef.current) {
                videoRef.current.play();
              } else if (hasNext && onSelectTrack) {
                onSelectTrack(currentIndex + 1);
              } else {
                setIsPlaying(false);
              }
            }}
            loop={isLooping}
            className="hidden"
          />

          <img
            src={currentVideo.thumbnailUrl}
            alt={currentVideo.title}
            className="w-12 h-10 object-cover rounded-lg shrink-0"
          />

          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setIsMiniPlayer(false)}>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white uppercase tracking-wider">
                {currentVideo.is4K ? '4K UHD' : 'HD'}
              </span>
              <p className="text-xs font-semibold truncate">{currentVideo.title}</p>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{currentVideo.channel} • {formatSeconds(currentTime)}</p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-rose-600 text-white hover:bg-rose-500 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>
            <button
              onClick={() => setIsMiniPlayer(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-100"
              title="Expand Media Player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-100"
              title="Close Player"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="built-in-media-player-overlay"
      className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Top Bar Controls */}
      <div className="px-4 py-3 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <button
          id="btn-player-minimize"
          onClick={() => setIsMiniPlayer(true)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
          title="Minimize to Floating Player"
        >
          <Minimize2 className="w-4 h-4" />
          <span className="hidden sm:inline">Mini Player</span>
        </button>

        {/* Center Mode Switcher if YouTube video */}
        {ytId && (
          <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-full text-xs">
            <button
              onClick={() => setPlayerMode('youtube')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                playerMode === 'youtube'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              YouTube Live Stream
            </button>
            <button
              onClick={() => setPlayerMode('local')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                playerMode === 'local'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Offline 4K Stream
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* 4K Resolution Badge & Selector */}
          <div className="relative">
            <button
              id="btn-player-resolution"
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/90 text-white text-xs font-bold shadow-lg shadow-rose-900/30 hover:bg-rose-500 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{selectedResolution === '2160p' ? '4K 60FPS' : selectedResolution.toUpperCase()}</span>
            </button>

            {showQualityMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-30 text-white">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">
                  Select Stream Resolution
                </div>
                {['2160p', '1440p', '1080p', '720p', 'audio'].map((res) => (
                  <button
                    key={res}
                    onClick={() => {
                      setSelectedResolution(res);
                      setShowQualityMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedResolution === res ? 'bg-rose-600/20 text-rose-400' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{res === '2160p' ? '4K Ultra HD' : res === '1440p' ? '2K Quad HD' : res === 'audio' ? 'Audio Only (Master)' : `${res} Full HD`}</span>
                    {selectedResolution === res && <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            id="btn-player-close"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Player"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Video Screen Container */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-2">
        {playerMode === 'youtube' && ytId ? (
          <div className="w-full h-full max-h-[75vh] flex items-center justify-center relative">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0`}
              title={currentVideo.title}
              className="w-full h-full aspect-video max-h-[75vh] rounded-2xl border border-slate-800 shadow-2xl bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              src={currentVideo.videoSourceUrl}
              autoPlay
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                if (isLooping && videoRef.current) {
                  videoRef.current.play();
                } else if (hasNext && onSelectTrack) {
                  onSelectTrack(currentIndex + 1);
                } else {
                  setIsPlaying(false);
                }
              }}
              className="w-full h-full max-h-[75vh] object-contain cursor-pointer"
              onClick={togglePlay}
            />

            {/* Audio Visualizer Overlay if Audio Only resolution is selected */}
            {selectedResolution === 'audio' && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center mb-4">
                  <Headphones className="w-10 h-10 text-rose-500 animate-pulse" />
                </div>
                <div className="flex items-end gap-1.5 h-16 mb-4">
                  {audioVisualizerBars.map((height, i) => (
                    <div
                      key={i}
                      className="w-2 bg-gradient-to-t from-rose-600 to-amber-400 rounded-full transition-all duration-300"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <p className="text-white font-bold text-base">Studio High-Res Audio Mode</p>
                <p className="text-slate-400 text-xs mt-1">Direct Master 320kbps Stream</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Media Player Controls & Timeline */}
      <div className="px-4 pt-2 pb-6 bg-gradient-to-t from-black via-black/90 to-transparent z-20 space-y-3">
        {/* Scrubber Bar */}
        <div className="space-y-1">
          <input
            id="player-seek-slider"
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-600 hover:h-2 transition-all"
          />
          <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Video Info Header */}
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-4">
            <h2 className="text-sm sm:text-base font-bold text-white truncate">{currentVideo.title}</h2>
            <p className="text-xs text-slate-400 truncate">{currentVideo.channel} • Offline Master Stream</p>
          </div>
          <span className="shrink-0 text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {currentVideo.isDownloaded ? 'Offline Cache Ready' : 'Streaming 4K'}
          </span>
        </div>

        {/* Main Action Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Left Controls: Loop & Previous */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-full transition-colors ${
                isLooping ? 'text-rose-500 bg-rose-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title="Loop video"
            >
              <Repeat className="w-4 h-4" />
            </button>

            <button
              onClick={() => hasPrev && onSelectTrack && onSelectTrack(currentIndex - 1)}
              disabled={!hasPrev}
              className={`p-2 rounded-full transition-colors ${
                hasPrev ? 'text-slate-200 hover:text-white' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Previous in playlist"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={() => skipTime(-10)}
              className="p-2 rounded-full text-slate-300 hover:text-white transition-colors"
              title="Skip 10 seconds back"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Center: Play / Pause */}
          <button
            id="btn-player-play-pause"
            onClick={togglePlay}
            className="w-13 h-13 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 transform active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>

          {/* Right Controls: Skip Forward, Next, Speed, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => skipTime(10)}
              className="p-2 rounded-full text-slate-300 hover:text-white transition-colors"
              title="Skip 10 seconds forward"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              onClick={() => hasNext && onSelectTrack && onSelectTrack(currentIndex + 1)}
              disabled={!hasNext}
              className={`p-2 rounded-full transition-colors ${
                hasNext ? 'text-slate-200 hover:text-white' : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Next in playlist"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                id="btn-player-speed"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded-md text-xs font-bold text-slate-300 hover:text-white bg-white/10"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 right-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 w-24 text-white z-30">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`w-full text-left px-2.5 py-1 text-xs rounded-md ${
                        playbackSpeed === s ? 'bg-rose-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full text-slate-300 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Audio Volume control */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button onClick={toggleMute} className="text-slate-400 hover:text-white">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />
        </div>
      </div>
    </div>
  );
};
