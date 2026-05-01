import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Replace these with your actual image imports or URLs ──
const ESSAY_PAGES = [
    '/pese/essay-page-1.jpg',
    '/pese/essay-page-2.jpg',
    '/pese/essay-page-3.jpg',
    '/pese/essay-page-4.jpg',
]

const VIDEO_SRC = '/pese/self-intro.mp4'

/* ─── Canvas Page-Curl Book Viewer ─── */
function useImage(src) {
    const [img, setImg] = useState(null)
    useEffect(() => {
        if (!src) return
        const i = new Image()
        i.crossOrigin = 'anonymous'
        i.onload = () => setImg(i)
        i.src = src
    }, [src])
    return img
}

function BookViewer() {
    const canvasRef = useRef(null)
    const rafRef = useRef(null)
    const [currentPage, setCurrentPage] = useState(0)
    const [flipping, setFlipping] = useState(false)
    const flipState = useRef({ progress: 0, direction: 1, active: false })
    const total = ESSAY_PAGES.length

    // Preload all images
    const images = useRef([])
    useEffect(() => {
        ESSAY_PAGES.forEach((src, i) => {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = src
            images.current[i] = img
        })
    }, [])

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const W = canvas.width
        const H = canvas.height
        const fs = flipState.current

        ctx.clearRect(0, 0, W, H)

        const currentImg = images.current[currentPage]
        const nextIdx = currentPage + fs.direction
        const nextImg = images.current[nextIdx]

        // ── Draw base page (destination) ──
        if (fs.active && nextImg?.complete) {
            ctx.drawImage(nextImg, 0, 0, W, H)
        } else if (currentImg?.complete) {
            ctx.drawImage(currentImg, 0, 0, W, H)
        }

        if (!fs.active) return

        // ── Page flip math ──
        // progress: 0 = flat on current, 1 = fully turned
        const p = fs.progress  // 0 → 1
        const dir = fs.direction // 1 = forward (right-to-left fold), -1 = backward

        // The fold line x position sweeps across the page
        // Forward: fold starts at right edge (W), sweeps to left (0)
        // Backward: fold starts at left edge (0), sweeps to right (W)
        const foldX = dir > 0
            ? W - p * W          // right → left
            : p * W              // left → right

        // ── Draw the page being turned (clipped to unturned half) ──
        ctx.save()
        ctx.beginPath()
        if (dir > 0) {
            ctx.rect(0, 0, foldX, H)
        } else {
            ctx.rect(foldX, 0, W - foldX, H)
        }
        ctx.clip()
        if (currentImg?.complete) ctx.drawImage(currentImg, 0, 0, W, H)
        ctx.restore()

        // ── Draw the folded flap (perspective-squished) ──
        const flapWidth = Math.max(0, (dir > 0 ? W - foldX : foldX))
        if (flapWidth < 1) return

        // The flap is the turning page, squished horizontally to simulate 3D fold
        // As p→1 the flap width → 0 (fully turned)
        const squish = 1 - p  // 1 at start, 0 at end
        const flapDrawW = flapWidth * squish

        if (flapDrawW < 1) return

        ctx.save()

        // Clip to flap region
        if (dir > 0) {
            ctx.beginPath()
            ctx.rect(foldX, 0, flapDrawW, H)
            ctx.clip()
            // Draw current page squished into flap area
            if (currentImg?.complete) {
                ctx.drawImage(currentImg,
                    dir > 0 ? W - flapWidth : 0, 0, flapWidth, H,  // source: the turning portion
                    foldX, 0, flapDrawW, H                           // dest: squished
                )
            }
        } else {
            ctx.beginPath()
            ctx.rect(foldX - flapDrawW, 0, flapDrawW, H)
            ctx.clip()
            if (currentImg?.complete) {
                ctx.drawImage(currentImg,
                    0, 0, flapWidth, H,
                    foldX - flapDrawW, 0, flapDrawW, H
                )
            }
        }

        // ── Fold shadow gradient on the flap ──
        const shadowX = dir > 0 ? foldX : foldX - flapDrawW
        const grad = ctx.createLinearGradient(shadowX, 0, shadowX + flapDrawW, 0)
        if (dir > 0) {
            grad.addColorStop(0, 'rgba(0,0,0,0.35)')
            grad.addColorStop(0.3, 'rgba(0,0,0,0.12)')
            grad.addColorStop(1, 'rgba(0,0,0,0.0)')
        } else {
            grad.addColorStop(0, 'rgba(0,0,0,0.0)')
            grad.addColorStop(0.7, 'rgba(0,0,0,0.12)')
            grad.addColorStop(1, 'rgba(0,0,0,0.35)')
        }
        ctx.fillStyle = grad
        ctx.fillRect(shadowX, 0, flapDrawW, H)

        ctx.restore()

        // ── Cast shadow on the destination page ──
        ctx.save()
        const castW = flapDrawW * 0.6
        const castX = dir > 0 ? foldX - castW : foldX + flapDrawW
        const castGrad = ctx.createLinearGradient(castX, 0, castX + (dir > 0 ? castW : -castW), 0)
        castGrad.addColorStop(0, `rgba(0,0,0,${0.22 * (1 - p)})`)
        castGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = castGrad
        if (dir > 0) {
            ctx.fillRect(castX, 0, castW, H)
        } else {
            ctx.fillRect(castX - castW, 0, castW, H)
        }
        ctx.restore()

        // ── Fold crease highlight ──
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(foldX, 0)
        ctx.lineTo(foldX, H)
        const creaseGrad = ctx.createLinearGradient(foldX - 3, 0, foldX + 3, 0)
        creaseGrad.addColorStop(0, 'rgba(255,255,255,0.0)')
        creaseGrad.addColorStop(0.5, `rgba(255,255,255,${0.25 * squish})`)
        creaseGrad.addColorStop(1, 'rgba(255,255,255,0.0)')
        ctx.strokeStyle = creaseGrad
        ctx.lineWidth = 6
        ctx.stroke()
        ctx.restore()
    }, [currentPage])

    // Animation loop
    const animate = useCallback((targetPage, dir) => {
        const DURATION = 600 // ms
        const start = performance.now()
        flipState.current = { progress: 0, direction: dir, active: true }

        const tick = (now) => {
            const elapsed = now - start
            const raw = Math.min(elapsed / DURATION, 1)
            // Ease: cubic-bezier feel — fast start, slow finish
            const t = raw < 0.5
                ? 4 * raw * raw * raw
                : 1 - Math.pow(-2 * raw + 2, 3) / 2

            flipState.current.progress = t
            draw()

            if (raw < 1) {
                rafRef.current = requestAnimationFrame(tick)
            } else {
                flipState.current = { progress: 0, direction: dir, active: false }
                setCurrentPage(targetPage)
                setFlipping(false)
                draw()
            }
        }
        rafRef.current = requestAnimationFrame(tick)
    }, [draw])

    // Redraw when page changes
    useEffect(() => {
        // Wait a tick for images to be ready
        const id = setTimeout(draw, 30)
        return () => clearTimeout(id)
    }, [currentPage, draw])

    // Resize canvas to match container
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ro = new ResizeObserver(() => {
            const rect = canvas.parentElement.getBoundingClientRect()
            canvas.width = rect.width
            canvas.height = rect.width * (4 / 3) // 3:4 portrait ratio
            draw()
        })
        ro.observe(canvas.parentElement)
        return () => ro.disconnect()
    }, [draw])

    useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

    const go = (dir) => {
        if (flipping) return
        const next = currentPage + dir
        if (next < 0 || next >= total) return
        setFlipping(true)
        animate(next, dir)
    }

    return (
        <div className="book-wrapper">
            {/* Click zones */}
            <div className="book-stage" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                go(x > rect.width / 2 ? 1 : -1)
            }}>
                <canvas ref={canvasRef} className="book-canvas" />
                {/* Hover hint arrows */}
                <div className="book-hint book-hint-left">‹</div>
                <div className="book-hint book-hint-right">›</div>
            </div>

            <div className="book-controls">
                <button className="book-btn" onClick={() => go(-1)} disabled={currentPage === 0 || flipping} aria-label="Previous page">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <div className="book-pagination">
                    {ESSAY_PAGES.map((_, i) => (
                        <button
                            key={i}
                            className={`book-dot ${i === currentPage ? 'active' : ''}`}
                            onClick={() => !flipping && go(i - currentPage)}
                            aria-label={`Go to page ${i + 1}`}
                        />
                    ))}
                </div>

                <button className="book-btn" onClick={() => go(1)} disabled={currentPage === total - 1 || flipping} aria-label="Next page">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>

            <p className="book-page-label">
                Page {currentPage + 1} <span>/ {total}</span>
            </p>
        </div>
    )
}

/* ─── Aesthetic Video Player ─── */
function VideoPlayer() {
    const videoRef = useRef(null)
    const progressRef = useRef(null)
    const [playing, setPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [muted, setMuted] = useState(false)
    const [volume, setVolume] = useState(1)
    const [showControls, setShowControls] = useState(true)
    const [fullscreen, setFullscreen] = useState(false)
    const hideTimer = useRef(null)
    const containerRef = useRef(null)

    const fmt = (s) => {
        const m = Math.floor(s / 60)
        const sec = Math.floor(s % 60)
        return `${m}:${sec.toString().padStart(2, '0')}`
    }

    const resetHideTimer = () => {
        setShowControls(true)
        clearTimeout(hideTimer.current)
        if (playing) {
            hideTimer.current = setTimeout(() => setShowControls(false), 2500)
        }
    }

    const togglePlay = () => {
        const v = videoRef.current
        if (!v) return
        if (v.paused) { v.play(); setPlaying(true) }
        else { v.pause(); setPlaying(false) }
        resetHideTimer()
    }

    const onTimeUpdate = () => {
        const v = videoRef.current
        if (!v) return
        setCurrentTime(v.currentTime)
        setProgress((v.currentTime / v.duration) * 100 || 0)
    }

    const onLoadedMetadata = () => {
        setDuration(videoRef.current?.duration || 0)
    }

    const seek = (e) => {
        const rect = progressRef.current.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        videoRef.current.currentTime = ratio * videoRef.current.duration
    }

    const toggleMute = () => {
        videoRef.current.muted = !muted
        setMuted(!muted)
    }

    const changeVolume = (e) => {
        const v = parseFloat(e.target.value)
        videoRef.current.volume = v
        setVolume(v)
        setMuted(v === 0)
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen()
            setFullscreen(true)
        } else {
            document.exitFullscreen()
            setFullscreen(false)
        }
    }

    useEffect(() => {
        const handler = () => setFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', handler)
        return () => {
            document.removeEventListener('fullscreenchange', handler)
            clearTimeout(hideTimer.current)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className={`vp-container ${playing && !showControls ? 'vp-hide-cursor' : ''}`}
            onMouseMove={resetHideTimer}
            onMouseLeave={() => playing && setShowControls(false)}
        >
            {/* Ambient glow */}
            <div className="vp-glow" />

            <video
                ref={videoRef}
                src={VIDEO_SRC}
                className="vp-video"
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={() => { setPlaying(false); setShowControls(true) }}
                onClick={togglePlay}
                playsInline
            />

            {/* Big play button overlay when paused */}
            <AnimatePresence>
                {!playing && (
                    <motion.button
                        className="vp-big-play"
                        onClick={togglePlay}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        aria-label="Play"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Controls bar */}
            <motion.div
                className="vp-controls"
                animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 8 }}
                transition={{ duration: 0.25 }}
            >
                {/* Progress bar */}
                <div
                    ref={progressRef}
                    className="vp-progress-track"
                    onClick={seek}
                    role="slider"
                    aria-label="Seek"
                >
                    <div className="vp-progress-fill" style={{ width: `${progress}%` }}>
                        <div className="vp-progress-thumb" />
                    </div>
                </div>

                <div className="vp-controls-row">
                    {/* Play/Pause */}
                    <button className="vp-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                        {playing ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5,3 19,12 5,21" />
                            </svg>
                        )}
                    </button>

                    {/* Volume */}
                    <div className="vp-volume-group">
                        <button className="vp-btn" onClick={toggleMute} aria-label="Toggle mute">
                            {muted || volume === 0 ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                                    <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                </svg>
                            )}
                        </button>
                        <input
                            type="range" min="0" max="1" step="0.05"
                            value={muted ? 0 : volume}
                            onChange={changeVolume}
                            className="vp-volume-slider"
                            aria-label="Volume"
                        />
                    </div>

                    {/* Time */}
                    <span className="vp-time">{fmt(currentTime)} / {fmt(duration)}</span>

                    {/* Fullscreen */}
                    <button className="vp-btn vp-btn-right" onClick={toggleFullscreen} aria-label="Fullscreen">
                        {fullscreen ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                            </svg>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

/* ─── Main Section ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: 0.1 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    }),
}

export default function PeseAssessment() {
    return (
        <section className="pese-section" id="pese">
            <div className="container">
                <motion.p className="section-label" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    Assessment
                </motion.p>
                <motion.h2 className="section-title" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
                    PESE Assessment
                </motion.h2>

                <div className="pese-grid">
                    {/* Essay */}
                    <motion.div
                        className="pese-card"
                        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
                    >
                        <div className="pese-card-header">
                            <span className="pese-tag">A</span>
                            <div>
                                <h3 className="pese-card-title">Handwritten Essay</h3>
                                <p className="pese-card-sub">Future of Higher Education in India</p>
                            </div>
                        </div>
                        <BookViewer />
                    </motion.div>

                    {/* Video */}
                    <motion.div
                        className="pese-card"
                        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}
                    >
                        <div className="pese-card-header">
                            <span className="pese-tag">B</span>
                            <div>
                                <h3 className="pese-card-title">Self Introduction</h3>
                                <p className="pese-card-sub">Recorded for Career Opportunity · 1 min</p>
                            </div>
                        </div>
                        <VideoPlayer />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
