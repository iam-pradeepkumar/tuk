import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { X, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Maximize2, RotateCcw } from 'lucide-react';
import { MediaItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMediaId: string;
  items: MediaItem[];
}

export default function MediaViewerModal({ isOpen, onClose, initialMediaId, items }: MediaViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (initialMediaId && items && items.length > 0) {
      const foundIdx = items.findIndex(item => item.id === initialMediaId);
      if (foundIdx !== -1) {
        setCurrentIndex(foundIdx);
        // Reset player states
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
      }
    }
  }, [initialMediaId, isOpen, items]);

  if (!isOpen || !items || items.length === 0) return null;

  const currentMedia = items[currentIndex];

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Video Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.log('Video play error:', err));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = Number(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time (e.g., 01:23)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
      {/* Absolute Close Header Button */}
      <button
        onClick={onClose}
        id="close-media-btn"
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900 border border-slate-800 text-white hover:text-amber-400 hover:scale-105 transition-all cursor-pointer shadow"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Slide Controls */}
      <button
        onClick={handlePrev}
        id="media-prev-btn"
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 border border-slate-800 text-white hover:text-amber-400 transition-all cursor-pointer shadow z-10"
      >
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
      </button>
      <button
        onClick={handleNext}
        id="media-next-btn"
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 border border-slate-800 text-white hover:text-amber-400 transition-all cursor-pointer shadow z-10"
      >
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Core Viewer Area */}
      <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMedia.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative flex items-center justify-center aspect-video"
          >
            {currentMedia.type === 'photo' ? (
              <img
                src={currentMedia.url}
                alt={currentMedia.title}
                className="w-full h-full object-contain max-h-[70vh]"
                referrerPolicy="no-referrer"
              />
            ) : (
              /* Custom Video Player with Control Bar Overlay */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Big Center Play Button Overlay if Paused */}
                {!isPlaying && (
                  <button
                    onClick={togglePlay}
                    className="absolute p-5 rounded-full bg-amber-400 text-indigo-950 font-black hover:scale-110 shadow-lg transition-transform cursor-pointer"
                  >
                    <Play className="w-8 h-8 fill-indigo-950" />
                  </button>
                )}

                {/* Custom Control Bar Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                  {/* Progress bar */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleProgressChange}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400 hover:h-1.5 transition-all"
                  />

                  {/* Operational parameters bar */}
                  <div className="flex justify-between items-center text-white text-xs">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause icon */}
                      <button onClick={togglePlay} className="hover:text-amber-400 cursor-pointer">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white hover:fill-amber-400" />}
                      </button>

                      {/* Reset icon */}
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            setCurrentTime(0);
                            videoRef.current.play().catch(() => {});
                            setIsPlaying(true);
                          }
                        }}
                        className="hover:text-amber-400 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Mute toggle */}
                      <button onClick={toggleMute} className="hover:text-amber-400 cursor-pointer">
                        {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                      </button>

                      {/* Clock timestamp */}
                      <span className="font-mono text-[11px] text-slate-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">
                        HD 1080P
                      </span>
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (document.fullscreenElement) {
                              document.exitFullscreen();
                            } else {
                              videoRef.current.requestFullscreen().catch(() => {});
                            }
                          }
                        }}
                        className="hover:text-amber-400 cursor-pointer"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Media metadata footer information */}
        <div className="text-center space-y-1 px-4 text-white max-w-2xl">
          <span className="text-xs bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800 text-amber-400 font-bold uppercase tracking-wide">
            {currentMedia.tag}
          </span>
          <h4 className="font-display font-medium text-base md:text-lg leading-snug">
            {currentMedia.title}
          </h4>
          <p className="text-xs text-slate-400 font-medium font-sans">
            கோப்பு வடிவம்: {currentMedia.type === 'photo' ? 'புகைப்படம் (JPG)' : 'ஊடகக் காணொளி (MP4)'} • உருப்படி {currentIndex + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>
  );
}
