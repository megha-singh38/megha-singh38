import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const categoryVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
        },
    }),
}

const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
        opacity: 1,
        scale: 1,
        transition: {
            delay: 0.3 + i * 0.03,
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1],
        },
    }),
}

export default function Skills({ data }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })

    const categories = data?.categories || []

    return (
        <section id="skills" ref={ref}>
            <div className="container">
                <motion.span
                    className="section-label"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5 }}
                >
                    Toolkit
                </motion.span>
                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Skills & Tech Stack
                </motion.h2>

                {categories.length > 0 && (
                    <div className="skills-grid">
                        {categories.map((category, catIndex) => (
                            <motion.div
                                key={category.name}
                                className="skill-category"
                                variants={categoryVariants}
                                initial="hidden"
                                animate={isInView ? 'visible' : 'hidden'}
                                custom={catIndex}
                            >
                                <h3 className="skill-category-name">{category.name}</h3>
                                <div className="skill-list">
                                    {category.skills.map((skill, skillIndex) => (
                                        <motion.span
                                            key={skill}
                                            className="skill-item"
                                            variants={skillVariants}
                                            initial="hidden"
                                            animate={isInView ? 'visible' : 'hidden'}
                                            custom={catIndex * 5 + skillIndex}
                                            whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                        >
                                            {skill}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
