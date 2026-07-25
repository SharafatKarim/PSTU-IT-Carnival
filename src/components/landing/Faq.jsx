'use client';

import { useState } from 'react';
import { FAQS } from '../../data/content';
import { ChevronDownIcon } from './Icons';

const FaqItem = ({ item, isOpen, onToggle }) => (
  <div className="overflow-hidden rounded-xl border border-ink-600 bg-ink-800/40 transition hover:border-grape-500/40">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
    >
      <span className="text-sm font-semibold text-white sm:text-base">
        {item.q}
      </span>
      <ChevronDownIcon
        className={`h-5 w-5 shrink-0 text-mist-400 transition-transform duration-300 ${
          isOpen ? 'rotate-180 text-aqua-400' : ''
        }`}
      />
    </button>
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}
    >
      <div className="overflow-hidden">
        <p className="px-5 pb-5 text-sm leading-relaxed text-mist-300">
          {item.a}
        </p>
      </div>
    </div>
  </div>
);

/* `items` defaults to the carnival FAQs; the gaming pages pass their own. */
const Faq = ({ items = FAQS }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <FaqItem
          key={i}
          item={item}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
        />
      ))}
    </div>
  );
};

export default Faq;
