import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const cardVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.2,
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1],
        },
    }),
}

export default function Experience({ data }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    return (
        <section id="experience" ref={ref}>
            <div className="container">
                <motion.span
                    className="section-label"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    Background
                </motion.span>
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Experience
                </motion.h2>

                {data && data.length > 0 && (
                    <div className="experience-list">
                        {data.map((item, i) => (
                            <motion.article
                                key={item.id}
                                className="experience-card"
                                variants={cardVariants}
                                initial="hidden"
                                animate={isInView ? 'visible' : 'hidden'}
                                custom={i}
                                whileHover={{ x: 8, transition: { duration: 0.3 } }}
                            >
                                <div className="experience-meta">
                                    <span className="experience-period">{item.period}</span>
                                    <span className="experience-type">{item.type}</span>
                                </div>

                                <div>
                                    <h3 className="experience-company">{item.company}</h3>
                                    <p className="experience-role">{item.role}</p>

                                    <ul className="experience-highlights">
                                        {item.highlights.map((highlight, j) => (
                                            <li key={j}>{highlight}</li>
                                        ))}
                                    </ul>

                                    {item.tools && item.tools.length > 0 && (
                                        <div className="experience-tools">
                                            {item.tools.map((tool) => (
                                                <span key={tool} className="tech-tag">{tool}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
