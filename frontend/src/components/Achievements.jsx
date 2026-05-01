import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.12,
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
        },
    }),
}

export default function Achievements({ data }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    return (
        <section id="achievements" ref={ref}>
            <div className="container">
                <motion.span
                    className="section-label"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    Recognition
                </motion.span>
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Hackathons
                </motion.h2>

                {data && data.length > 0 && (
                    <div className="achievements-grid">
                        {data.map((item, i) => (
                            <motion.article
                                key={item.id}
                                className="achievement-card"
                                variants={cardVariants}
                                initial="hidden"
                                animate={isInView ? 'visible' : 'hidden'}
                                custom={i}
                                whileHover={{ y: -6, transition: { duration: 0.3 } }}
                            >
                                <span className="achievement-type">{item.type}</span>
                                <h3 className="achievement-title">{item.title}</h3>
                                <p className="achievement-desc">{item.description}</p>

                                {item.mediaPlaceholder && (
                                    <div className="achievement-media-placeholder">
                                        📷 Photo / Video placeholder
                                    </div>
                                )}
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
