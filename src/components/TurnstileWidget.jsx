'use client';

import { useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Cloudflare Turnstile challenge.
//
// Renders nothing at all unless NEXT_PUBLIC_TURNSTILE_SITE_KEY was present at
// BUILD time (see the ARG in the Dockerfile) — so with no key configured the
// form is untouched.
//
// The server half is src/server/turnstile.js. Both must be configured for the
// check to actually apply: a site key without a secret key shows a widget that
// nothing verifies.
// ---------------------------------------------------------------------------

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export const isTurnstileConfigured = Boolean(SITE_KEY);

/* One script tag for the page however many widgets mount. */
let scriptPromise = null;

const loadScript = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => {
      scriptPromise = null; // let a later mount retry
      reject(new Error('Could not load the verification challenge.'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
};

const TurnstileWidget = ({ onToken }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isTurnstileConfigured) return undefined;

    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: 'dark',
          callback: (token) => onToken(token),
          /* A stale token is worse than none — drop it and make them redo it. */
          'expired-callback': () => onToken(null),
          'error-callback': () => {
            onToken(null);
            setError('Verification failed to load. Please refresh and try again.');
          },
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [onToken]);

  if (!isTurnstileConfigured) return null;

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default TurnstileWidget;
