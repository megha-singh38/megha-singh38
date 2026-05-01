import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const cardVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.15,
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
        },
    }),
}

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
}

export default function Projects({ data }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    return (
        <section id="projects" ref={ref}>
            <div className="container">
                <motion.span
                    className="section-label"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    Featured Work
                </motion.span>
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Projects
                </motion.h2>

                {data && data.length > 0 && (
                    <motion.div
                        className="projects-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        animate={isInView ? 'visible' : 'hidden'}
                    >
                        {data.map((project, i) => (
                            <motion.article
                                key={project.id}
                                className={`project-card ${project.featured ? 'featured' : ''}`}
                                variants={cardVariants}
                                custom={i}
                                whileHover={{ scale: 1.01 }}
                            >
                                {project.featured && (
                                    <span className="project-badge">★ Featured</span>
                                )}

                                <div className="project-header">
                                    <div>
                                        <h3 className="project-title">{project.title}</h3>
                                        <p className="project-subtitle">{project.subtitle}</p>
                                    </div>
                                    <span className="project-date">{project.date}</span>
                                </div>

                                <p className="project-section-label">Problem</p>
                                <p className="project-text">{project.problem}</p>

                                <p className="project-section-label">Approach</p>
                                <p className="project-text">{project.approach}</p>

                                {project.outcomes && project.outcomes.length > 0 && (
                                    <>
                                        <p className="project-section-label">Key Outcomes</p>
                                        <ul className="project-outcomes">
                                            {project.outcomes.map((outcome, j) => (
                                                <li key={j}>{outcome}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                <div className="project-tech">
                                    {project.techStack.map((tech) => (
                                        <span key={tech} className="tech-tag">{tech}</span>
                                    ))}
                                </div>

                                <div className="project-links">
                                    {project.github && (
                                        <a
                                            href={project.github}
                                            className="project-link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                            </svg>
                                            Source Code
                                        </a>
                                    )}
                                    {project.demo && (
                                        <a
                                            href={project.demo}
                                            className="project-link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                                                <polyline points="15 3 21 3 21 9" />
                                                <line x1="10" y1="14" x2="21" y2="3" />
                                            </svg>
                                            Live Demo
                                        </a>
                                    )}
                                    {!project.demo && (
                                        <span className="project-link" style={{ color: 'var(--text-tertiary)', cursor: 'default' }}>
                                            Demo coming soon
                                        </span>
                                    )}
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    )
}
