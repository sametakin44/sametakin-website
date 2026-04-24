import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { href: '/#calismalar', label: 'çalışmalar' },
  { href: '/videolar', label: 'videolar' },
  { href: '/yazilar', label: 'yazılar' },
  { href: '/cv', label: 'cv' },
  { href: '/iletisim', label: 'iletişim' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menü"
        className="md:hidden flex flex-col gap-1.5 p-1"
      >
        <span
          className={`block h-0.5 w-5 bg-ink-100 transition-transform duration-200 ${
            open ? 'translate-y-2 rotate-45' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-ink-100 transition-opacity duration-200 ${
            open ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-ink-100 transition-transform duration-200 ${
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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 top-14 z-40 bg-ink-950 flex flex-col items-center justify-center gap-8"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-2xl font-mono text-ink-300 hover:text-accent transition-colors duration-200"
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
