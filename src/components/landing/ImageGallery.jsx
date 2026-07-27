'use client';

import { useEffect, useRef, useState } from 'react';

// Year-based carousels. Each year gets its own section with alternating
// slide direction: 2026 right-to-left, 2024 left-to-right, 2023 right-to-left.

const MAX_PER_YEAR = 12;
const VISIBLE = 3;

const YEAR_CONFIGS = [
  { year: '2026', slideForward: false }, // right to left
  { year: '2024', slideForward: true },  // left to right
  { year: '2023', slideForward: false }, // right to left
];

const BASE_PATHS = ['/photo_galary', '/events/photogaraly'];

const checkImage = (url) =>
  new Promise((resolve) => {
    try {
      const img = new window.Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    } catch (e) {
      resolve(false);
    }
  });

const YearGallery = ({ year, slideForward }) => {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch('/photo_galary/index.json');
        if (res.ok) {
          const list = await res.json();
          if (mounted && Array.isArray(list) && list.length > 0) {
            const yearImages = list.filter((url) => url.includes(`/${year}/`));
            if (yearImages.length > 0) {
              setImages(yearImages);
              return;
            }
          }
        }
      } catch (e) {
        // ignore fallback to probing
      }

      const found = [];

      for (const base of BASE_PATHS) {
        for (let i = 1; i <= MAX_PER_YEAR; i++) {
          const pad = (`0${i}`).slice(-2);
          const candidates = [
            `${base}/${year}/${pad}_${year}.jpg`,
            `${base}/${year}/${pad}_${year}.png`,
            `${base}/${year}/${i}.jpg`,
            `${base}/${year}/${i}.png`,
            `${base}/${year}/${pad}.jpg`,
            `${base}/${year}/${pad}.png`,
          ];

          // eslint-disable-next-line no-await-in-loop
          for (const c of candidates) {
            if (found.includes(c)) continue;
            // eslint-disable-next-line no-await-in-loop
            if (await checkImage(c)) {
              found.push(c);
              break;
            }
          }
        }
      }

      if (mounted) setImages(found);
    })();

    return () => {
      mounted = false;
    };
  }, [year]);

  useEffect(() => {
    if (!images || images.length <= VISIBLE) return undefined;

    intervalRef.current = setInterval(() => {
      setIndex((prev) => {
        const next = slideForward ? prev + 1 : prev - 1;
        if (next < 0) return images.length - VISIBLE;
        if (next > images.length - VISIBLE) return 0;
        return next;
      });
    }, 3000);

    return () => clearInterval(intervalRef.current);
  }, [images, slideForward]);

  if (!images || images.length === 0) return null;

  const visible = images.slice(index, index + VISIBLE);
  if (visible.length < VISIBLE) {
    visible.push(...images.slice(0, VISIBLE - visible.length));
  }

  return (
    <div className="py-6">
      <h3 className="mb-4 text-center text-lg font-semibold text-white">Year {year}</h3>
      <div className="relative overflow-hidden rounded-2xl border border-ink-600 bg-ink-900/60 p-4 shadow-card">
        <div className="flex gap-3 transition-transform duration-700">
          {visible.map((src, i) => (
            <div key={`${src}-${i}`} className="flex-1 overflow-hidden rounded-lg">
              <img src={src} alt={`gallery-${i}`} className="h-48 w-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ImageGallery() {
  return (
    <section id="photogallery" className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">Photo Gallery</h2>
        <div className="space-y-8">
          {YEAR_CONFIGS.map((config) => (
            <YearGallery
              key={config.year}
              year={config.year}
              slideForward={config.slideForward}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
