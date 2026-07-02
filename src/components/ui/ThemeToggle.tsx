import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Tema değiştir"
      className="relative h-6 w-11 rounded-[2px] bg-bg-elevated border border-line-sub p-0.5 transition-colors duration-300 hover:border-line-em"
    >
      <div
        className={`h-4 w-4 rounded-[1px] transition-all duration-300 ease-out ${
          dark
            ? 'translate-x-5 bg-accent'
            : 'translate-x-0 bg-warm'
        }`}
      />
    </button>
  );
}
