import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

import page1Url from '../assets/pese/essay-page-1.png?url'
import page2Url from '../assets/pese/essay-page-2.png?url'
import page3Url from '../assets/pese/essay-page-3.png?url'

const ESSAY_PAGES = [page1Url, page2Url, page3Url]

const YOUTUBE_ID = 'WCh_DGHHG14'

/* ─── Canvas Page-Curl Book Viewer ─── */
function useImage(src) {
    const [img, setImg] = useState(null)
    useEffect(() => {
        if (!src) return
        const i = new Image()
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
    const loaded = useRef([])
    const [imagesReady, setImagesReady] = useState(0)
    useEffect(() => {
        ESSAY_PAGES.forEach((src, i) => {
            const img = new Image()
            img.onload = () => {
                loaded.current[i] = true
                setImagesReady(n => n + 1)
            }
            img.onerror = () => { loaded.current[i] = false }
            img.src = src
            images.current[i] = img
        })
    }, [])

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
        ctx.imageSmoothingEnabled = false
        const W = canvas.width
        const H = canvas.height
        const fs = flipState.current

        ctx.clearRect(0, 0, W, H)

        const currentImg = images.current[currentPage]
        const nextIdx = currentPage + fs.direction
        const nextImg = images.current[nextIdx]

        const canDraw = (img, idx) => img && loaded.current[idx] === true

        // ── Draw base page (destination) ──
        if (fs.active && canDraw(nextImg, nextIdx)) {
            ctx.drawImage(nextImg, 0, 0, W, H)
        } else if (canDraw(currentImg, currentPage)) {
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
        if (canDraw(currentImg, currentPage)) ctx.drawImage(currentImg, 0, 0, W, H)
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
            if (canDraw(currentImg, currentPage)) {
                ctx.drawImage(currentImg,
                    dir > 0 ? W - flapWidth : 0, 0, flapWidth, H,
                    foldX, 0, flapDrawW, H
                )
            }
        } else {
            ctx.beginPath()
            ctx.rect(foldX - flapDrawW, 0, flapDrawW, H)
            ctx.clip()
            if (canDraw(currentImg, currentPage)) {
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

    // Redraw when page changes or images load
    useEffect(() => {
        const id = setTimeout(draw, 30)
        return () => clearTimeout(id)
    }, [currentPage, draw, imagesReady])

    // Resize canvas to match container
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ro = new ResizeObserver(() => {
            const rect = canvas.parentElement.getBoundingClientRect()
            const dpr = window.devicePixelRatio || 1
            const displayWidth = rect.width
            const displayHeight = rect.width * (4 / 3) // 3:4 portrait ratio
            
            // Set canvas internal size to match physical pixels
            canvas.width = displayWidth * dpr
            canvas.height = displayHeight * dpr
            
            // Set canvas display size
            canvas.style.width = displayWidth + 'px'
            canvas.style.height = displayHeight + 'px'
            
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

function VideoPlayer() {
    return (
        <div className="vp-container">
            <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1`}
                title="Self Introduction"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', zIndex: 1 }}
            />
            <a
                href={`https://www.youtube.com/watch?v=${YOUTUBE_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-link"
                style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 2 }}
            >
                Open on YouTube
            </a>
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
