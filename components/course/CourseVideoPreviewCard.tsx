"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react"

export interface CourseVideoPreviewCardProps {
  authorAvatarUrl?: string | null
  displayAuthor: string
  displayUsername: string
  authorInitials: string
  videoSrc?: string
  posterUrl?: string
}

export default function CourseVideoPreviewCard({
  authorAvatarUrl,
  displayAuthor,
  displayUsername,
  authorInitials,
  videoSrc = "/boradingui.mp4",
  posterUrl = "/ink-dome-bg.jpg"
}: CourseVideoPreviewCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(120)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group w-full max-w-md mx-auto select-none"
    >
      {/* Ambient Glow Aura */}
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#00C4B4]/25 via-indigo-500/25 to-pink-500/25 blur-2xl opacity-60 group-hover:opacity-90 transition duration-700 pointer-events-none" />

      {/* Main Minimalist Frame */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-slate-950/80 p-1.5 shadow-[0_20px_50px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <div className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-slate-900">
          
          {/* HTML5 Video Element */}
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            muted={isMuted}
            playsInline
            className="size-full object-cover"
          />

          {/* Vignette Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/40 transition-opacity duration-300 pointer-events-none ${
              isHovered || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Minimal Floating Preview Tag (Top Left) */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
            <span className="size-2 rounded-full bg-[#00C4B4] animate-pulse" />
            <span>Course Preview</span>
          </div>

          {/* Centered Glassmorphic Play/Pause Button */}
          <AnimatePresence>
            {(!isPlaying || isHovered) && (
              <motion.button
                onClick={togglePlay}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isPlaying ? "Pause video" : "Play video"}
                className="absolute inset-0 m-auto z-20 grid size-16 place-items-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md shadow-2xl text-white hover:bg-white/30 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <Pause size={24} className="fill-white" />
                ) : (
                  <Play size={24} className="translate-x-0.5 fill-white" />
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Bottom Hover Overlay Controls */}
          <div
            className={`absolute inset-x-0 bottom-0 z-20 p-3.5 flex flex-col gap-2 transition-opacity duration-300 ${
              isHovered || isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Interactive Progress Line */}
            <div className="relative flex items-center group/slider cursor-pointer">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/25 rounded-lg appearance-none cursor-pointer accent-[#00C4B4]"
              />
              <div
                className="absolute left-0 top-0 h-1 rounded-l-lg bg-gradient-to-r from-[#00C4B4] to-[#4F46E5] pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between text-xs font-semibold text-white/90">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={togglePlay}
                  className="hover:text-[#00C4B4] transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <span className="text-[11px] font-mono text-white/70">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

