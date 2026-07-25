'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MenuIcon, CloseIcon } from './Icons';
import { landingNav, ROUTES, isRouteHref } from '../../lib/routes';

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
  ctaLabel = 'Register Now',
  ctaHref = ROUTES.register,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLink href={homeHref} className="shrink-0">
          <Logo />
        </NavLink>

        <div className="hidden items-center gap-6 md:flex lg:gap-8">
          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mist-300 transition hover:text-white"
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block">{renderCta('inline-block')}</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
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
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-mist-200 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </NavLink>
            ))}
            {renderCta('mt-2 block text-center', () => setOpen(false))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
