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
      className="relative h-6 w-11 rounded-full bg-ink-800 p-0.5 transition-colors duration-200 hover:bg-ink-700"
    >
      <div
        className={`h-5 w-5 rounded-full transition-all duration-200 ${
          dark
            ? 'translate-x-5 bg-accent'
            : 'translate-x-0 bg-ink-300'
        }`}
      />
    </button>
  );
}
