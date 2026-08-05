"use client";

import { useEffect, useRef, useState } from "react";

// How long the colour cross-fade runs. Must match the .theme-transition
// duration in globals.css.
const TRANSITION_MS = 320;

// Light/dark toggle. The initial class is set by the inline script in the root
// layout (before paint) to avoid a flash; this just keeps React in sync and
// persists the user's choice.
//
// Toggling adds .theme-transition to <html> for the duration of the switch so
// every colour cross-fades instead of snapping. It is removed afterwards so the
// blanket transition never interferes with hover states or the first paint.
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");

    root.classList.add("theme-transition");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);

    // Re-toggling mid-fade restarts the window rather than cutting it short.
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      root.classList.remove("theme-transition");
      timer.current = null;
    }, TRANSITION_MS);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted && dark ? "Switch to light mode" : "Switch to dark mode"}
      title={mounted && dark ? "Light mode" : "Dark mode"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-concrete-300 text-concrete-500 transition-colors hover:border-brand-400 hover:text-brand-700 ${className}`}
    >
      {/* Both icons are always rendered and swapped with CSS on the .dark class,
          so they cross-fade on toggle and never flash on hydration. */}
      <span className="relative block h-[18px] w-[18px]">
        {/* Sun — visible in dark mode (click to go light) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="theme-icon absolute inset-0 h-[18px] w-[18px] rotate-90 scale-0 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
        {/* Moon — visible in light mode (click to go dark) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="theme-icon absolute inset-0 h-[18px] w-[18px] rotate-0 scale-100 opacity-100 dark:-rotate-90 dark:scale-0 dark:opacity-0"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
}
