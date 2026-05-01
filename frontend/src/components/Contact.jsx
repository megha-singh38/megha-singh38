import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    }),
}

export default function Contact({ data }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    if (!data) return null

    return (
        <section className="contact" id="contact" ref={ref}>
            <div className="container">
                <motion.span
                    className="section-label"
                    style={{ justifyContent: 'center' }}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    Let's Connect
                </motion.span>

                <motion.h2
                    className="contact-heading"
                    variants={fadeUp}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    custom={1}
                >
                    Get In Touch
                </motion.h2>

                <motion.p
                    className="contact-text"
                    variants={fadeUp}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    custom={2}
                >
                    Open to internship opportunities, collaborations, and interesting conversations
                    about backend engineering, AI/ML, and system design.
                </motion.p>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    custom={3}
                >
                    <a href={`mailto:${data.email}`} className="contact-email">
                        Say Hello →
                    </a>
                </motion.div>

                <motion.div
                    className="contact-socials"
                    variants={fadeUp}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    custom={4}
                >
                    <a
                        href={data.github}
                        className="contact-social"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub
                    </a>
                    <a
                        href={data.linkedin}
                        className="contact-social"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        LinkedIn
                    </a>
                    <a href={`mailto:${data.email}`} className="contact-social">
                        {data.email}
                    </a>
                </motion.div>
            </div>

            <footer className="footer">
                <div className="container">
                    <p className="footer-text">
                        Built by Megha Singh · {new Date().getFullYear()}
                    </p>
                </div>
            </footer>
        </section>
    )
}
