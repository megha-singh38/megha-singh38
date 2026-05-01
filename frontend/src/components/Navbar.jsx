import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    const links = [
        { label: 'PESE', href: '#pese' },
        { label: 'Projects', href: '#projects' },
        { label: 'Achievements', href: '#achievements' },
        { label: 'Skills', href: '#skills' },
        { label: 'Experience', href: '#experience' },
        { label: 'Resume', href: '#resume' },
        { label: 'Contact', href: '#contact' },
    ]

    return (
        <motion.nav
            className={`navbar ${scrolled ? 'scrolled' : ''} ${open ? 'menu-open' : ''}`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="container navbar-inner">
                <a href="#" className="navbar-logo" aria-label="Home">
                    Megha <span>Singh</span>
                </a>

                <ul className={`navbar-links ${open ? 'open' : ''}`}>
                    {links.map(({ label, href }, i) => (
                        <motion.li
                            key={href}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                        >
                            <a href={href} onClick={() => setOpen(false)}>
                                {label}
                            </a>
                        </motion.li>
                    ))}
                </ul>

                <button
                    className={`navbar-mobile-toggle ${open ? 'active' : ''}`}
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={open}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </motion.nav>
    )
}
