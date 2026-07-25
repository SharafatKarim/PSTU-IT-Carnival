'use client';

import { useEffect, useState } from 'react';
import { MenuIcon, CloseIcon } from './Icons';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Events', href: '#events' },
  { label: 'Timeline', href: '#timeline' },
  { label: 'Format', href: '#format' },
  { label: 'Prizes', href: '#prizes' },
  { label: 'FAQ', href: '#faq' },
];

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-carnival text-sm font-extrabold text-white shadow-glow-grape">
      PC
    </span>
    <span className="text-sm font-bold leading-tight text-white">
      PSTU IT Carnival
      <span className="block text-[11px] font-medium text-mist-400">
        Tech &amp; Gaming Fest 2026
      </span>
    </span>
  </div>
);

const Navbar = ({ onRegister }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-ink-900/80 shadow-card backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#top" className="shrink-0">
          <Logo />
        </a>

        <div className="hidden items-center gap-6 md:flex lg:gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mist-300 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRegister}
            className="hidden rounded-lg bg-gold-400 px-4 py-2 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300 sm:inline-block"
          >
            Register Now
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-mist-200 transition hover:bg-white/10 md:hidden"
          >
            {open ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-ink-900/95 backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-mist-200 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onRegister();
              }}
              className="mt-2 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300"
            >
              Register Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
