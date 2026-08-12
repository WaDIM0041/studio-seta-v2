import { useId } from 'react';

export type Tone = 'graphite' | 'bone' | 'champagne' | 'noir' | 'rose';
export type Variant = 'droplet' | 'french' | 'rings' | 'golden';

interface TonePalette {
  base: [string, string];
  glow: string;
  accent: string;
  figure: string;
  figureAlt: string;
}

const TONES: Record<Tone, TonePalette> = {
  graphite: {
    base: ['#0b0b0c', '#1c1c20'],
    glow: 'rgba(212,175,55,0.42)',
    accent: '#d4af37',
    figure: '#f4f0e5',
    figureAlt: '#c7c0ae',
  },
  bone: {
    base: ['#e7e2d7', '#f8f6f1'],
    glow: 'rgba(140,109,31,0.28)',
    accent: '#8c6d1f',
    figure: '#d5cebd',
    figureAlt: '#beb5a1',
  },
  champagne: {
    base: ['#171309', '#2a2212'],
    glow: 'rgba(230,200,115,0.5)',
    accent: '#e6c873',
    figure: '#e9d9a8',
    figureAlt: '#c4ac74',
  },
  noir: {
    base: ['#000000', '#161616'],
    glow: 'rgba(255,255,255,0.16)',
    accent: '#e8e5dd',
    figure: '#2c2c2f',
    figureAlt: '#1d1d20',
  },
  rose: {
    base: ['#190f14', '#2c1b23'],
    glow: 'rgba(216,145,165,0.38)',
    accent: '#d68fa3',
    figure: '#e8d6db',
    figureAlt: '#c2a9b1',
  },
};

const BOKEH: Array<[number, number, number, number]> = [
  [1180, 180, 34, 0.1],
  [250, 640, 22, 0.14],
  [1330, 620, 46, 0.1],
  [90, 300, 14, 0.18],
  [520, 120, 18, 0.12],
];

/**
 * Placeholder "macro photography" art. In production each composition is
 * replaced by a real photo (see docs/PHOTO_BRIEF.md). The SVG renders the
 * same art direction: deep graphite/bone/champagne fields, warm gold light,
 * macro nail-detail silhouettes and film grain.
 */
export function MacroArt({
  variant = 'droplet',
  tone = 'graphite',
  className,
}: {
  variant?: Variant;
  tone?: Tone;
  className?: string;
}) {
  const uid = useId().replace(/[:]/g, '');
  const t = TONES[tone];

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
      role="img"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.base[0]} />
          <stop offset="1" stopColor={t.base[1]} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="0.72" cy="0.62" r="0.75">
          <stop offset="0" stopColor={t.glow} stopOpacity="0.9" />
          <stop offset="0.5" stopColor={t.glow} stopOpacity="0.25" />
          <stop offset="1" stopColor={t.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={t.figure} />
          <stop offset="1" stopColor={t.figureAlt} />
        </linearGradient>
        <radialGradient id={`drop-${uid}`} cx="0.32" cy="0.28" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.55" stopColor={t.figure} />
          <stop offset="1" stopColor={t.figureAlt} />
        </radialGradient>
        <filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.06" />
          </feComponentTransfer>
        </filter>
        <filter id={`soft-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="36" />
        </filter>
      </defs>

      <rect width="1600" height="900" fill={`url(#bg-${uid})`} />
      <rect width="1600" height="900" fill={`url(#glow-${uid})`} />

      {/* bokeh */}
      {BOKEH.map(([cx, cy, r, o], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={t.accent} strokeWidth="1" opacity={o} />
      ))}

      {variant === 'droplet' && (
        <g>
          <path
            d="M 855 180 C 855 430 640 505 640 685 a 168 168 0 0 0 336 0 C 976 505 855 430 855 180 Z"
            fill={`url(#drop-${uid})`}
          />
          <path
            d="M 855 180 C 855 430 640 505 640 685 a 168 168 0 0 0 336 0"
            fill="none"
            stroke={t.accent}
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          <ellipse cx="745" cy="470" rx="46" ry="26" fill="#ffffff" opacity="0.35" transform="rotate(-26 745 470)" filter={`url(#soft-${uid})`} />
          <circle cx="726" cy="470" r="9" fill="#ffffff" opacity="0.9" />
          <path d="M 320 860 C 620 700 980 700 1290 860" fill="none" stroke={t.accent} strokeOpacity="0.35" strokeWidth="1" />
        </g>
      )}

      {variant === 'french' && (
        <g transform="rotate(-18 820 500)">
          <path
            d="M 726 560 h 188 a 96 96 0 0 1 96 96 v 168 a 34 34 0 0 1 -34 34 h -312 a 34 34 0 0 1 -34 -34 v -168 a 96 96 0 0 1 96 -96 Z"
            fill={`url(#body-${uid})`}
          />
          <path
            d="M 726 560 h 188 a 96 96 0 0 1 96 96 v 58 h -380 v -58 a 96 96 0 0 1 96 -96 Z"
            fill="#f7f2e6"
            opacity="0.92"
          />
          <path d="M 862 686 h 70 a 34 34 0 0 1 34 34 v 138 a 34 34 0 0 1 -34 34 h -70 Z" fill="#d9cdb6" opacity="0.85" />
          <path
            d="M 850 656 h 82 a 0 0 0 0 1 0 0 v 34 a 96 96 0 0 1 -82 0 Z"
            fill="#f7f2e6"
            opacity="0.6"
          />
          <circle cx="862" cy="640" r="42" fill="none" stroke={t.accent} strokeOpacity="0.85" strokeWidth="2.5" />
        </g>
      )}

      {variant === 'rings' && (
        <g>
          <circle cx="820" cy="470" r="150" fill="none" stroke={t.accent} strokeWidth="3" opacity="0.95" />
          <circle cx="820" cy="470" r="118" fill="none" stroke={t.accent} strokeWidth="1.5" opacity="0.5" />
          <circle cx="1060" cy="600" r="96" fill="none" stroke={t.figureAlt} strokeWidth="2" opacity="0.6" />
          <circle cx="820" cy="470" r="150" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.5" transform="translate(9 9)" />
          <ellipse cx="820" cy="620" rx="200" ry="30" fill="#000000" opacity="0.35" filter={`url(#soft-${uid})`} />
          <circle cx="800" cy="440" r="10" fill="#ffffff" opacity="0.9" />
        </g>
      )}

      {variant === 'golden' && (
        <g>
          <circle cx="820" cy="450" r="420" fill={t.glow} filter={`url(#soft-${uid})`} />
          <g opacity="0.5">
            {[200, 330, 460, 590].map((y, i) => (
              <rect key={i} x={y % 2 === 0 ? 260 : 320} y={y} width={y % 2 === 0 ? 1080 : 960} height="2" fill={t.accent} opacity={0.5 - i * 0.08} />
            ))}
          </g>
          <circle cx="820" cy="450" r="180" fill="none" stroke={t.accent} strokeWidth="1" opacity="0.5" />
          <circle cx="820" cy="450" r="70" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.55" />
        </g>
      )}

      {/* frame + grain */}
      <rect x="26" y="26" width="1548" height="848" fill="none" stroke={t.accent} strokeOpacity="0.22" strokeWidth="1" />
      <rect width="1600" height="900" filter={`url(#grain-${uid})`} />
    </svg>
  );
}
