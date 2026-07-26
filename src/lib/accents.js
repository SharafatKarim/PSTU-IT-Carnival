/* Accent palettes drawn from the carnival theme tokens.
   Full class strings only — Tailwind needs to see them literally.
   Lives in lib/ rather than components/gaming/ because the landing page and
   the events index colour-code by event family too, and importing a palette
   from a sibling feature folder was the drift smell it looks like. */

export const ACCENTS = {
  aqua: {
    text: 'text-aqua-300',
    textStrong: 'text-aqua-400',
    border: 'border-aqua-400/40',
    borderSoft: 'border-aqua-400/25',
    bgSoft: 'bg-aqua-400/10',
    bgFaint: 'bg-aqua-400/5',
    dot: 'bg-aqua-400',
    glow: 'shadow-glow-aqua',
    ring: 'ring-aqua-400/30',
    hoverBorder: 'hover:border-aqua-400/60',
    blob: 'bg-aqua-500/20',
  },
  gold: {
    text: 'text-gold-300',
    textStrong: 'text-gold-400',
    border: 'border-gold-400/40',
    borderSoft: 'border-gold-400/25',
    bgSoft: 'bg-gold-400/10',
    bgFaint: 'bg-gold-400/5',
    dot: 'bg-gold-400',
    glow: 'shadow-glow-gold',
    ring: 'ring-gold-400/30',
    hoverBorder: 'hover:border-gold-400/60',
    blob: 'bg-gold-400/20',
  },
  /* The house purple. Used for events that have no family of their own. */
  grape: {
    text: 'text-grape-300',
    textStrong: 'text-grape-400',
    border: 'border-grape-400/40',
    borderSoft: 'border-grape-400/25',
    bgSoft: 'bg-grape-500/10',
    bgFaint: 'bg-grape-500/5',
    dot: 'bg-grape-400',
    glow: 'shadow-glow-grape',
    ring: 'ring-grape-400/30',
    hoverBorder: 'hover:border-grape-400/60',
    blob: 'bg-grape-600/20',
  },
  magenta: {
    text: 'text-magenta-300',
    textStrong: 'text-magenta-400',
    border: 'border-magenta-500/40',
    borderSoft: 'border-magenta-500/25',
    bgSoft: 'bg-magenta-500/10',
    bgFaint: 'bg-magenta-500/5',
    dot: 'bg-magenta-400',
    glow: 'shadow-glow-magenta',
    ring: 'ring-magenta-400/30',
    hoverBorder: 'hover:border-magenta-500/60',
    blob: 'bg-magenta-500/20',
  },
};

export const accentOf = (key) => ACCENTS[key] || ACCENTS.grape;
