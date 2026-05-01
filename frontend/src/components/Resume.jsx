import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const base = import.meta.env.BASE_URL || '/'
const withBase = (path) => `${base}${String(path).replace(/^\//, '')}`
const RESUME_PDF = withBase('MeghaResumeSWE.pdf')
const RESUME_SRC = `${RESUME_PDF}#view=FitH&toolbar=0&navpanes=0`

export default function Resume() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    return (
        <section id="resume" className="resume-section" ref={ref}>
            <div className="resume-section-glow" aria-hidden />

            <div className="container">
                <motion.span
                    className="section-label"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    Credentials
                </motion.span>
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Résumé
                </motion.h2>

                <motion.article
                    className="resume-showcase"
                    initial={{ opacity: 0, y: 36 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -4, transition: { duration: 0.35 } }}
                >
                    <div className="resume-showcase-header">
                        <div className="resume-showcase-copy">
                            <span className="resume-file-tag">
                                <span className="resume-file-dot" aria-hidden />
                                PDF · Megha Singh
                            </span>
                            <p className="resume-lead">
                                Final-year AI/ML profile with backend architecture, data systems,
                                internships, and hackathon results in one place.
                                Open in a new tab for the sharpest view, or grab the file for
                                applications.
                            </p>
                            <ul className="resume-mini-list">
                                <li>Backend architecture + relational data modeling</li>
                                <li>Peerprep internship + extraction performance impact</li>
                                <li>Hackathon wins, education, and contact details</li>
                            </ul>
                        </div>
                        <div className="resume-showcase-actions">
                            <a
                                href={RESUME_PDF}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hero-link primary"
                            >
                                Open full PDF
                            </a>
                            <a
                                href={RESUME_PDF}
                                download="MeghaResumeSWE.pdf"
                                className="hero-link"
                            >
                                Download
                            </a>
                        </div>
                    </div>

                    <div className="resume-showcase-preview-bleed">
                        <div className="resume-preview-shell">
                            <div className="resume-preview-chrome" aria-hidden>
                                <span className="resume-preview-dot" />
                                <span className="resume-preview-dot" />
                                <span className="resume-preview-dot" />
                                <span className="resume-preview-url">resume.pdf</span>
                            </div>
                            <div className="resume-preview-viewport">
                                <iframe
                                    title="Résumé PDF preview"
                                    src={RESUME_SRC}
                                    className="resume-frame"
                                    loading="lazy"
                                />
                                <div className="resume-preview-fade" aria-hidden />
                                {/* Fallback shown when iframe is blocked */}
                                <div className="resume-fallback">
                                    <p>PDF preview unavailable in this browser.</p>
                                    <a href={RESUME_PDF} target="_blank" rel="noopener noreferrer" className="hero-link primary">
                                        Open PDF →
                                    </a>
                                </div>
                            </div>
                        </div>
                        <p className="resume-preview-hint">
                            Preview — use <strong>Open full PDF</strong> for zoom and print.
                        </p>
                    </div>
                </motion.article>
            </div>
        </section>
    )
}
