/**
 * Common application information, branding, navigation, and system metadata.
 * Centralized store for reusable constants across the Traceri application.
 */

export interface NavLinkItem {
  to: string;
  label: string;
  exact?: boolean;
  description?: string;
  iconName?: string;
  badge?: string;
}

export interface RouteMeta {
  path: string;
  label: string;
  section: string;
  title: string;
  description: string;
}

export const APP_INFO = {
  name: 'TRACERI',
  displayName: 'Traceri',
  appUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL) || 'https://traceri.vercel.app',
  letters: ['T', 'R', 'A', 'C', 'E', 'R', 'I'] as const,
  subtitle: 'DIGITAL LIFE ARCHIVE',
  tagline: 'Every moment leaves a trace.',
  headline: 'An Editorial Visualization of a Life',
  description:
    'An interactive digital life archive, editorial magazine, and empirical data archaeology. Transforming fragmented digital receipts into structured human stories through relational synthesis.',
  volume: 'VOL. 01',
  edition: '2026 EDITION',
  editionTag: 'DIGITAL TRACES EDITION',
  year: 2026,
  version: '1.0.0',
  engineStatus: 'ENGINE ONLINE',
  specification: 'Empirical Digital Life Archive · Deterministic Engine',
  keywords: [
    'Traceri',
    'Traceva',
    'Digital Life Archive',
    'Editorial Visualization',
    'Digital Footprint',
    'Data Archaeology',
    'Narrative Monograph',
    'Temporal Matrix',
    'Interactive Storytelling',
    'Personal Knowledge Graph',
  ],
} as const;

export const DEVELOPER_INFO = {
  name: 'Ankit',
  handle: 'ankit628792',
  instagram: {
    url: 'https://www.instagram.com/ankit_628792',
    handle: '@ankit_628792',
    platform: 'Instagram',
  },
  linkedin: {
    url: 'https://www.linkedin.com/in/ankit628792',
    handle: 'ankit628792',
    platform: 'LinkedIn',
  },
} as const;

export const PRIMARY_NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Archive', exact: true },
  { to: '/threads', label: 'Threads', exact: false },
  { to: '/story', label: 'Story', exact: false },
];

export const SECONDARY_NAV_LINKS: NavLinkItem[] = [
  {
    to: '/calendar',
    label: 'Calendar',
    description: 'Chronological life matrix',
    iconName: 'Calendar',
  },
  {
    to: '/atlas',
    label: 'Atlas',
    description: 'Spatial cartography & coordinates',
    iconName: 'Compass',
  },
  {
    to: '/discoveries',
    label: 'Discoveries',
    description: 'Algorithmic synthesis & deep insights',
    iconName: 'Sparkles',
  },
];

export const ROUTE_METADATA: Record<string, RouteMeta> = {
  '/': {
    path: '/',
    label: 'Archive',
    section: 'PRIMARY CATALOG',
    title: 'Primary Archive Catalog',
    description: 'Granular digital footprint receipts organized across time, space, and media.',
  },
  '/threads': {
    path: '/threads',
    label: 'Threads',
    section: 'RECURRENT SEQUENCES',
    title: 'Recurrent Threads & Sequences',
    description: 'Detected behavioral patterns, loops, and multi-day experiential arcs.',
  },
  '/story': {
    path: '/story',
    label: 'Story',
    section: 'NARRATIVE MONOGRAPH',
    title: 'Narrative Monograph & Chapters',
    description: 'Long-form editorial essays synthesizing chronological life events into chapters.',
  },
  '/calendar': {
    path: '/calendar',
    label: 'Calendar',
    section: 'TEMPORAL MATRIX',
    title: 'Chronological Life Matrix',
    description: 'A multi-scale temporal view visualizing density and distribution of life traces.',
  },
  '/atlas': {
    path: '/atlas',
    label: 'Atlas',
    section: 'SPATIAL CARTOGRAPHY',
    title: 'Spatial Cartography & Coordinates',
    description: 'Geographic and celestial mapping of visited places, neighborhoods, and journeys.',
  },
  '/discoveries': {
    path: '/discoveries',
    label: 'Discoveries',
    section: 'SYNTHESIS & PATTERNS',
    title: 'Algorithmic Discoveries & Patterns',
    description: 'Emergent insights, cross-category correlations, and serendipitous connections.',
  },
};

export const BRAND_PALETTE = {
  accentGold: '#CFA04E',
  accentGoldHover: '#E5B660',
  accentPurple: '#8B78C2',
  accentRed: '#D25A5A',
  accentGreen: '#5F9E7D',
  accentCyan: '#569CA6',
  backgroundDark: '#0A0B0D',
  cardBackground: '#13161C',
  borderDark: '#232730',
  textLight: '#FAF8F5',
  textMuted: '#8E939E',
} as const;
