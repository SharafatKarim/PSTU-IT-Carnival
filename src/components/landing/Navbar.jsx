'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { MenuIcon, CloseIcon } from './Icons';
import { landingNav, ROUTES, isRouteHref } from '@/lib/routes';

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <img
      src="/logo.png"
      alt="PSTU IT Carnival Logo"
      className="h-19 w-auto object-contain"
    />
    <span className="text-sm font-bold leading-tight text-white">
      PSTU IT Carnival
      <span className="block text-[11px] font-medium text-mist-400">
        Tech &amp; Gaming Fest 2026
      </span>
    </span>
  </div>
);

/* In-page anchors stay plain <a>; anything that changes route (including
   "/#about" style cross-page anchors) goes through next/link. */
const NavLink = ({ href, className, onClick, children }) =>
  isRouteHref(href) ? (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );

const Navbar = ({
  links = landingNav,
  homeHref = '#top',
  ctaLabel = 'Pre-Register',
  ctaHref = ROUTES.register,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Which same-page section is on screen. Scroll position alone cannot answer
     this — the sections are different heights — so an observer reports it and
     the header marks the matching link. Route links never match, so on a detail
     page nothing lights up, which is correct.

     rootMargin pulls the top edge below the sticky header and the bottom edge
     up, leaving a band across the upper third: the section crossing that band
     is the one being read. */
  const anchors = links.map((link) => link.href).filter((h) => h.startsWith('#'));
  const anchorKey = anchors.join(',');

  useEffect(() => {
    const ids = anchorKey ? anchorKey.split(',').map((h) => h.slice(1)) : [];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (sections.length === 0) return undefined;

    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.isIntersecting
            ? visible.add(entry.target.id)
            : visible.delete(entry.target.id)
        );
        /* Ties go to the first in document order, so scrolling down does not
           flicker between two sections that share the band. */
        const first = ids.find((id) => visible.has(id));
        setActive(first || null);
      },
      { rootMargin: '-72px 0px -65% 0px', threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [anchorKey]);

  const close = useCallback(() => setOpen(false), []);

  /* An open menu owns the screen: Escape closes it and the page behind it does
     not scroll away under the panel. */
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const ctaClasses =
    'rounded-lg bg-gold-400 px-4 py-2 text-sm font-bold text-ink-950 shadow-glow-gold transition hover:bg-gold-300';

  const renderCta = (extraClasses, onDone) => (
    <NavLink
      href={ctaHref}
      className={`${ctaClasses} ${extraClasses}`}
      onClick={onDone}
    >
      {ctaLabel}
    </NavLink>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-ink-900/80 shadow-card backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
      >
        <NavLink href={homeHref} className="shrink-0">
          <Logo />
        </NavLink>

        <div className="hidden items-center gap-6 md:flex lg:gap-8">
          {links.map((link) => {
            const current = link.href === `#${active}`;
            return (
              <NavLink
                key={link.href}
                href={link.href}
                aria-current={current ? 'true' : undefined}
                className={`text-sm font-medium transition ${
                  current ? 'text-white' : 'text-mist-300 hover:text-white'
                }`}
              >
                {link.label}
              </NavLink>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block">{renderCta('inline-block')}</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
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
        <div
          id="mobile-menu"
          className="border-t border-white/10 bg-ink-900/95 backdrop-blur-md md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {links.map((link) => {
              const current = link.href === `#${active}`;
              return (
                <NavLink
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={current ? 'true' : undefined}
                  className={`rounded-lg px-2 py-2.5 text-sm font-medium transition hover:bg-white/10 hover:text-white ${
                    current ? 'bg-white/5 text-white' : 'text-mist-200'
                  }`}
                >
                  {link.label}
                </NavLink>
              );
            })}
            {renderCta('mt-2 block text-center', close)}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
