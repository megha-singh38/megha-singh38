import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Achievements from './components/Achievements'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Contact from './components/Contact'
import Resume from './components/Resume'
import PeseAssessment from './components/PeseAssessment'
import DebugAssets from './components/DebugAssets'
import about from './data/about.json'
import projects from './data/projects.json'
import skills from './data/skills.json'
import experience from './data/experience.json'
import achievements from './data/achievements.json'

/* ─── Blossom Loading Screen ─── */

const TARGET = 'MEGHA SINGH'

function useBloomProgress(durationMs = 1900) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        let raf
        let start

        const animate = (ts) => {
            if (!start) start = ts
            const elapsed = Math.min(ts - start, durationMs)
            const t = elapsed / durationMs
            const eased = 1 - Math.pow(1 - t, 3)
            setProgress(eased)

            if (elapsed < durationMs) {
                raf = requestAnimationFrame(animate)
            }
        }

        raf = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(raf)
    }, [durationMs])

    return progress
}

function LoadingScreen({ onComplete }) {
    const progress = useBloomProgress()
    const done = progress >= 0.999
    const [slidingUp, setSlidingUp] = useState(false)
    const triggered = useRef(false)

    useEffect(() => {
        if (!done || triggered.current) return
        triggered.current = true
        // brief pause so user sees 100%, then auto slide up
        const t = setTimeout(() => {
            setSlidingUp(true)
            setTimeout(onComplete, 1000)
        }, 600)
        return () => clearTimeout(t)
    }, [done, onComplete])

    return (
        <div className={`loader-screen${slidingUp ? ' sliding-up' : ''}`}>
            <div className="loader-bloom-bg" aria-hidden>
                <span className="loader-blob loader-blob-a" />
                <span className="loader-blob loader-blob-b" />
                <span className="loader-star loader-star-1">✦</span>
                <span className="loader-star loader-star-2">✦</span>
                <span className="loader-star loader-star-3">✦</span>
                <span className="loader-star loader-star-4">✦</span>
                <span className="loader-star loader-star-5">✦</span>
                <span className="loader-star loader-star-6">✦</span>
                <span className="loader-ring" />
            </div>

            <div className="loader-content">
                <motion.p
                    className="loader-greeting"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                >
                    Welcome to
                </motion.p>

                <motion.h1
                    className="loader-name"
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                >
                    {TARGET}
                </motion.h1>

                <p className="loader-subtitle">Backend Engineer · AI/ML Developer</p>

                <div className="loader-line-track">
                    <motion.div
                        className="loader-line-fill"
                        initial={{ width: '0%' }}
                        animate={{ width: `${Math.round(progress * 100)}%` }}
                        transition={{ duration: 0.2 }}
                    />
                </div>
            </div>
        </div>
    )
}


/* ─── Custom Magnetic Cursor ─── */
function CustomCursor() {
    const dotRef = useRef(null)
    const ringRef = useRef(null)
    const trailsRef = useRef([])
    const mousePos = useRef({ x: -100, y: -100 })
    const ringPos = useRef({ x: -100, y: -100 })
    const trailPositions = useRef(
        Array.from({ length: 5 }, () => ({ x: -100, y: -100 }))
    )

    useEffect(() => {
        const handler = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY }
        }
        window.addEventListener('mousemove', handler, { passive: true })

        let raf
        const animate = () => {
            // Dot follows immediately
            if (dotRef.current) {
                dotRef.current.style.transform = `translate(${mousePos.current.x}px, ${mousePos.current.y}px)`
            }

            // Ring lerps behind
            ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15
            ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15
            if (ringRef.current) {
                ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`
            }

            // Trails follow with increasing delay
            for (let i = 0; i < trailPositions.current.length; i++) {
                const target = i === 0 ? mousePos.current : trailPositions.current[i - 1]
                const speed = 0.08 - i * 0.012
                trailPositions.current[i].x += (target.x - trailPositions.current[i].x) * speed
                trailPositions.current[i].y += (target.y - trailPositions.current[i].y) * speed
                if (trailsRef.current[i]) {
                    trailsRef.current[i].style.transform = `translate(${trailPositions.current[i].x}px, ${trailPositions.current[i].y}px)`
                }
            }

            raf = requestAnimationFrame(animate)
        }
        raf = requestAnimationFrame(animate)

        // Scale ring on hoverable elements
        const addHover = () => {
            document.querySelectorAll('a, button, .project-card, .tech-tag, .skill-item, .resume-showcase').forEach((el) => {
                el.addEventListener('mouseenter', () => {
                    if (ringRef.current) ringRef.current.classList.add('cursor-hover')
                })
                el.addEventListener('mouseleave', () => {
                    if (ringRef.current) ringRef.current.classList.remove('cursor-hover')
                })
            })
        }
        // Delay to allow DOM to render
        const hoverTimer = setTimeout(addHover, 2000)

        return () => {
            window.removeEventListener('mousemove', handler)
            cancelAnimationFrame(raf)
            clearTimeout(hoverTimer)
        }
    }, [])

    return (
        <div className="custom-cursor-container">
            {/* Trailing particles */}
            {trailPositions.current.map((_, i) => (
                <div
                    key={i}
                    ref={(el) => (trailsRef.current[i] = el)}
                    className="cursor-trail"
                    style={{ opacity: 0.3 - i * 0.05, width: 4 - i * 0.5, height: 4 - i * 0.5 }}
                />
            ))}
            {/* Outer ring */}
            <div ref={ringRef} className="cursor-ring" />
            {/* Inner dot */}
            <div ref={dotRef} className="cursor-dot" />
        </div>
    )
}

export default function App() {
    const [showLoader, setShowLoader] = useState(true)

    // Lock body scroll while loader is visible
    useEffect(() => {
        if (showLoader) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [showLoader])

    const handleLoadComplete = useCallback(() => {
        window.scrollTo(0, 0)
        setShowLoader(false)
    }, [])

    return (
        <>
            {/* Main content renders underneath the loader */}
            <CustomCursor />
            <Navbar />
            <main>
                <Hero data={about} />
                <hr className="section-divider" />
                <PeseAssessment />
                <hr className="section-divider" />
                <Projects data={projects} />
                <hr className="section-divider" />
                <Experience data={experience} />
                <hr className="section-divider" />
                <Achievements data={achievements} />
                <hr className="section-divider" />
                <Skills data={skills} />
                <hr className="section-divider" />
                <Resume />
                <hr className="section-divider" />
                <Contact data={about} />
                <hr className="section-divider" />
                <DebugAssets />
            </main>

            {/* Loader overlay on top — slides up to reveal */}
            {showLoader && <LoadingScreen onComplete={handleLoadComplete} />}
        </>
    )
}
