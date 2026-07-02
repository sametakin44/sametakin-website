import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { href: '/#work', label: 'work' },
  { href: '/videos', label: 'videos' },
  { href: '/writing', label: 'writing' },
  { href: '/experience', label: 'experience' },
  { href: '/contact', label: 'contact' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        className="md:hidden flex flex-col gap-1.5 p-1"
      >
        <span
          className={`block h-0.5 w-5 bg-ink-primary transition-transform duration-300 ${
            open ? 'translate-y-2 rotate-45' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-ink-primary transition-opacity duration-300 ${
            open ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-ink-primary transition-transform duration-300 ${
            open ? '-translate-y-2 -rotate-45' : ''
          }`}
        />
      </button>

      {/* Fullscreen drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 top-14 z-40 bg-bg-base flex flex-col items-center justify-center gap-8"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-3xl text-ink-secondary hover:text-accent transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
