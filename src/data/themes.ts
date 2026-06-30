export type ThemeSlug =
  | 'corner'
  | 'market'
  | 'provisions'
  | 'boucherie'
  | 'tide'
  | 'dumpling'
  | 'granary'
  | 'brew';

export interface ThemeEntry {
  slug: ThemeSlug;
  displayName: string;
  tagline: string;
  description: string;
  thumbnailPath: string;
  accentColor: string;
  features: string[];
}

export const THEMES: ThemeEntry[] = [
  {
    slug: 'corner',
    displayName: 'Corner',
    tagline: 'A cozy one-page lookbook for a single-location shop',
    description:
      'A single, scrollable storefront with a generous hero, eight featured products, and a "visit us" block — built for a small neighbourhood grocer who wants warmth over volume.',
    thumbnailPath: '/themes/_assets/heroes/hero-1.jpg',
    accentColor: '#5d6e44',
    features: ['Single page', 'Cozy serif feel', 'Visit & hours block', 'Mobile-first'],
  },
  {
    slug: 'market',
    displayName: 'Market',
    tagline: 'A bright multi-page supermarket storefront',
    description:
      'Five pages — home, shop with filters, product detail, about, contact — built for a full-service grocery with weekly deals, categories, trust strip and a working-feel checkout flow.',
    thumbnailPath: '/themes/_assets/heroes/hero-2.jpg',
    accentColor: '#226d3d',
    features: ['Shop & filters', 'Product detail', 'Trust strip', 'Contact form'],
  },
  {
    slug: 'provisions',
    displayName: 'Provisions',
    tagline: 'Editorial premium grocery with recipes & journal',
    description:
      'Six pages with a magazine layout — home, shop, product, recipes, journal, about. For premium grocers who tell the story behind every shelf, with weekly recipes and producer profiles.',
    thumbnailPath: '/themes/_assets/heroes/hero-5.jpg',
    accentColor: '#7c2d2d',
    features: ['Recipes', 'Journal', 'Editorial layout', 'Weekly deals'],
  },
  {
    slug: 'boucherie',
    displayName: 'Boucherie',
    tagline: 'French-Canadian butcher & charcuterie',
    description:
      'Five pages — boutique, cuts, the bench, special-order form, visit — for a whole-animal butcher with house charcuterie. Earthy oxblood and butcher-paper cream, slab-serif typography, big meat photography.',
    thumbnailPath: '/themes/_assets/photos/butcher/counter.jpg',
    accentColor: '#6b1e1a',
    features: ['Whole-animal cuts', 'House charcuterie', 'Special-order form', 'Slab-serif feel'],
  },
  {
    slug: 'tide',
    displayName: 'Tide',
    tagline: 'Pacific seafood & oyster bar',
    description:
      'Five pages — home, raw bar, kitchen, story, reservations — inspired by Vancouver coastal raw-bars and Granville Island fish markets. Pacific blues and sand, modern sans-serif, a chalkboard-feel daily catch.',
    thumbnailPath: '/themes/_assets/photos/seafood/raw-bar.jpg',
    accentColor: '#2c5f7e',
    features: ['Daily oyster list', 'Raw bar + kitchen', 'Reservations form', 'Coastal palette'],
  },
  {
    slug: 'dumpling',
    displayName: 'Dumpling',
    tagline: 'Cantonese dim sum & dumpling house',
    description:
      'Four pages — home, full menu, our story, reservations — inspired by Toronto Chinatown and Vancouver dumpling houses. Warm scarlet, ink-black and bamboo green, with bilingual touches and bamboo-cart styling.',
    thumbnailPath: '/themes/_assets/photos/dimsum/dumplings.jpg',
    accentColor: '#c8242b',
    features: ['Bilingual menu', 'Cart-style sections', 'Reservations form', 'Tea-house palette'],
  },
  {
    slug: 'granary',
    displayName: 'Granary',
    tagline: 'Prairie bulk-foods & wholefoods market',
    description:
      'Five pages — home, shop the bins, how loose works, recipes, visit — for a bulk-foods / zero-waste market. Wheat and sand palette, friendly serif, recipe cards, a step-by-step "loose" explainer.',
    thumbnailPath: '/themes/_assets/photos/bulk/bins.jpg',
    accentColor: '#9d8038',
    features: ['Bulk bins', 'How-it-works guide', 'Recipe cards', 'FAQ + visit'],
  },
  {
    slug: 'brew',
    displayName: 'Brew',
    tagline: 'Third-wave coffee & all-day cafe',
    description:
      'Four pages — home, drinks & food menu, the beans, visit — for a third-wave roaster and cafe. Minimal monochrome with a single ember-orange accent, generous whitespace, single-origin bean cards with tasting notes.',
    thumbnailPath: '/themes/_assets/photos/cafe/espresso.jpg',
    accentColor: '#e85a1a',
    features: ['Bean cards', 'All-day menu', 'Open-roast events', 'Minimal monochrome'],
  },
];

export function getTheme(slug: string): ThemeEntry | undefined {
  return THEMES.find((t) => t.slug === slug);
}
