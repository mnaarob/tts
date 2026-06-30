import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pause,
  Play,
  ArrowRight,
  Package,
  Barcode,
  AlertTriangle,
  TrendingUp,
  Tag,
  RefreshCcw,
  Clock,
  Search,
  MapPin,
  Star,
  Globe,
  Smartphone,
  ShoppingCart,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

type ChapterId = 'inventory' | 'esl' | 'seo' | 'website';

interface Step {
  title: string;
  benefit: string;
  bullets: string[];
}

interface Chapter {
  id: ChapterId;
  name: string;
  tagline: string;
  Icon: typeof Package;
  accentText: string;
  accentBg: string;
  accentSoft: string;
  steps: Step[];
}

const STEP_DURATION_MS = 5000;

const CHAPTERS: Chapter[] = [
  {
    id: 'inventory',
    name: 'Inventory',
    tagline: 'Know your stock at a glance',
    Icon: Package,
    accentText: 'text-emerald-700',
    accentBg: 'bg-emerald-500',
    accentSoft: 'bg-emerald-50 ring-emerald-200',
    steps: [
      {
        title: 'See your whole store at a glance',
        benefit: 'Walk in. See everything. No clipboard.',
        bullets: [
          'Live KPIs: total products, low stock, today\u2019s sales',
          'Updates the moment a sale happens',
          'Works on phone, tablet, or your back-office laptop',
        ],
      },
      {
        title: 'Add products by scanning, not typing',
        benefit: '30-second product entry, not 3 minutes typing.',
        bullets: [
          'Point your camera at the barcode',
          'Name, brand and image auto-fill from our database',
          'Set price, quantity, low-stock threshold and you\u2019re done',
        ],
      },
      {
        title: 'Reorder before you run out',
        benefit: 'Never get caught with empty shelves again.',
        bullets: [
          'Smart low-stock alerts based on your own threshold',
          'See what\u2019s about to run out today, this week, this month',
          'Export shopping lists straight to your suppliers',
        ],
      },
      {
        title: 'Spot what sells \u2014 and what doesn\u2019t',
        benefit: 'Stop ordering the slow movers. Double down on winners.',
        bullets: [
          'Daily, weekly, monthly sales charts',
          'Top sellers and dead stock surfaced automatically',
          'Compare any two periods side-by-side',
        ],
      },
    ],
  },
  {
    id: 'esl',
    name: 'Electronic Shelf Labels',
    tagline: 'Change a price once. Update every shelf.',
    Icon: Tag,
    accentText: 'text-purple-700',
    accentBg: 'bg-purple-500',
    accentSoft: 'bg-purple-50 ring-purple-200',
    steps: [
      {
        title: 'Update one price in the dashboard',
        benefit: 'Type the new number. That\u2019s it.',
        bullets: [
          'No printing. No re-tagging. No mistakes.',
          'Works for one product or a thousand at once',
          'Schedule the change for a future date if you want',
        ],
      },
      {
        title: 'Watch all your shelf tags sync',
        benefit: 'Every label across your store updates in seconds.',
        bullets: [
          'Wireless e-paper tags, battery lasts 5+ years',
          'No staff time wasted walking the aisles',
          'Always-correct prices = no checkout disputes',
        ],
      },
      {
        title: 'Run flash sales without lifting a finger',
        benefit: 'Promo countdowns and sale prices, automated.',
        bullets: [
          'Set a sale start and end time',
          'Tags switch to promo mode automatically',
          'Revert to normal price when the sale ends',
        ],
      },
      {
        title: 'Stay compliant, always',
        benefit: 'Shelf price always matches your point of sale.',
        bullets: [
          'No more 9-cent fines from price-mismatch laws',
          'Audit log shows every change, by whom, when',
          'One source of truth: your dashboard',
        ],
      },
    ],
  },
  {
    id: 'seo',
    name: 'Local SEO',
    tagline: 'Get found on Google by people nearby',
    Icon: Search,
    accentText: 'text-blue-700',
    accentBg: 'bg-blue-500',
    accentSoft: 'bg-blue-50 ring-blue-200',
    steps: [
      {
        title: 'Where you are today',
        benefit: 'If you\u2019re not on page one, you\u2019re invisible.',
        bullets: [
          '93% of searchers never click past page 1',
          'Most local stores rank below #20',
          'Every position you climb = real foot traffic',
        ],
      },
      {
        title: 'We do the technical heavy lifting',
        benefit: 'Schema, citations, speed, reviews \u2014 all handled.',
        bullets: [
          'Structured data so Google understands you',
          'Listings on Google Business, Bing, Apple Maps',
          'Site speed tuned to 95+ on Lighthouse',
        ],
      },
      {
        title: 'You climb the rankings',
        benefit: 'Watch your store move up where buyers can see it.',
        bullets: [
          'Targeted local keywords for your city',
          'Monthly rank-tracking reports',
          'Most clients hit page 1 within 90 days',
        ],
      },
      {
        title: 'More traffic, more customers',
        benefit: 'Top-spot traffic is 10\u00d7 the click rate of position 5.',
        bullets: [
          'Real visits, not vanity metrics',
          'Tracked walk-ins, calls and online orders',
          'Quarterly business review with your strategist',
        ],
      },
    ],
  },
  {
    id: 'website',
    name: 'Website',
    tagline: 'A storefront that actually sells',
    Icon: Globe,
    accentText: 'text-rose-700',
    accentBg: 'bg-rose-500',
    accentSoft: 'bg-rose-50 ring-rose-200',
    steps: [
      {
        title: 'Pick a template, make it yours',
        benefit: 'Live in days, not months \u2014 and looks bespoke.',
        bullets: [
          'Six grocery-ready templates, fully customisable',
          'Your colours, your photos, your brand voice',
          'Mobile-first design, looks great on every screen',
        ],
      },
      {
        title: 'Built to convert visitors into buyers',
        benefit: 'Every pixel earns its keep.',
        bullets: [
          'Optimised checkout flow (1-page, guest-friendly)',
          'Clear add-to-cart and call-to-action everywhere',
          'Trust signals: reviews, hours, contact in the header',
        ],
      },
      {
        title: 'Pages that load instantly, anywhere',
        benefit: 'Slow sites lose 53% of mobile visitors.',
        bullets: [
          '95+ Lighthouse score out of the box',
          'Edge-hosted on a global CDN \u2014 sub-second load times',
          'A+ accessibility & SEO scores baked in',
        ],
      },
      {
        title: 'Connected to everything you sell',
        benefit: 'One dashboard. Website, inventory, prices, all in sync.',
        bullets: [
          'Online stock matches in-store stock automatically',
          'Update a price once, it changes everywhere',
          'No double-entry, no spreadsheets, no surprises',
        ],
      },
    ],
  },
];

export function InteractiveDemo() {
  const [chapterId, setChapterId] = useState<ChapterId>('inventory');
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedAt = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  const chapter = useMemo(
    () => CHAPTERS.find((c) => c.id === chapterId)!,
    [chapterId],
  );
  const totalSteps = chapter.steps.length;
  const current = chapter.steps[step];

  useEffect(() => {
    setStep(0);
  }, [chapterId]);

  useEffect(() => {
    startedAt.current = Date.now();
    setProgress(0);
    if (paused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    function tick() {
      const elapsed = Date.now() - startedAt.current;
      const pct = Math.min(elapsed / STEP_DURATION_MS, 1);
      setProgress(pct);
      if (pct >= 1) {
        setStep((s) => (s + 1) % totalSteps);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [step, paused, totalSteps]);

  function chooseStep(i: number) {
    setStep(i);
    setPaused(true);
  }

  function selectChapter(id: ChapterId) {
    setChapterId(id);
    setPaused(false);
  }

  return (
    <section
      id="demo"
      className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
    >
      <div className="absolute top-1/4 -right-24 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-4">
            See it in action
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            How Tech to Store grows your business, step by step
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            A guided tour of inventory, electronic shelf labels, local SEO and your new website
            — with the benefits made obvious.
          </p>
        </div>

        {/* Chapter tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {CHAPTERS.map((c) => {
            const isActive = c.id === chapterId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectChapter(c.id)}
                className={`group flex flex-col text-left p-4 rounded-2xl border transition-all ${
                  isActive
                    ? `${c.accentSoft} ring-2 border-transparent shadow-sm`
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${c.accentBg}`}
                  >
                    <c.Icon className="w-4 h-4" />
                  </div>
                  <div
                    className={`text-sm font-bold tracking-tight ${
                      isActive ? c.accentText : 'text-slate-900'
                    }`}
                  >
                    {c.name}
                  </div>
                </div>
                <div className="text-xs text-slate-500 leading-snug">{c.tagline}</div>
              </button>
            );
          })}
        </div>

        {/* Body: mockup + narrative */}
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Mockup */}
          <div className="lg:col-span-3">
            <div className="relative rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                <div className="ml-2 flex-1 truncate text-xs text-slate-500 font-mono">
                  techtostore.com / {chapter.id}
                </div>
              </div>
              <div className="relative bg-slate-50 min-h-[440px] sm:min-h-[480px] p-4 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${chapter.id}-${step}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="absolute inset-0 p-4 sm:p-6"
                  >
                    {chapter.id === 'inventory' && <InventoryMockup step={step} />}
                    {chapter.id === 'esl' && <EslMockup step={step} />}
                    {chapter.id === 'seo' && <SeoMockup step={step} />}
                    {chapter.id === 'website' && <WebsiteMockup step={step} />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-xs font-bold tracking-widest uppercase ${chapter.accentText}`}
                >
                  {chapter.name}
                </span>
                <span className="text-xs text-slate-400">
                  Step {step + 1} of {totalSteps}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${chapter.id}-narr-${step}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="flex-1"
                >
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-3">
                    {current.title}
                  </h3>
                  <p className="text-base text-slate-600 mb-5">{current.benefit}</p>
                  <ul className="space-y-3">
                    {current.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${chapter.accentText}`}
                        />
                        <span className="text-sm text-slate-700 leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              {/* Stepper + autoplay */}
              <div className="mt-7 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors"
                    aria-label={paused ? 'Play' : 'Pause'}
                  >
                    {paused ? (
                      <Play className="w-4 h-4 ml-0.5" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1 flex items-center gap-2">
                    {chapter.steps.map((_, i) => {
                      const active = i === step;
                      const filled = active ? progress : i < step ? 1 : 0;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => chooseStep(i)}
                          aria-label={`Step ${i + 1}`}
                          className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden cursor-pointer"
                        >
                          <div
                            className={`h-full ${chapter.accentBg}`}
                            style={{
                              width: `${filled * 100}%`,
                              transition: active ? 'none' : 'width 200ms',
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-5">
            Ready to put your store inside that dashboard?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Create your account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/themes"
              className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:shadow-sm px-6 py-3 rounded-xl text-sm font-semibold transition-all"
            >
              Browse website templates
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
   Inventory mockup
---------------------------------------------------------------------------- */

function InventoryMockup({ step }: { step: number }) {
  return (
    <div className="h-full flex flex-col">
      <DashChrome activeTab="Dashboard" />
      <div className="flex-1 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Total products" value="1,248" trend="+18 today" tone="emerald" />
          <KpiCard label="Low stock" value="12" trend="needs reorder" tone="amber" />
          <KpiCard label="Out of stock" value="3" trend="urgent" tone="rose" />
          <KpiCard label="Today\u2019s sales" value="$4,820" trend="+12% vs avg" tone="blue" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col min-h-[230px]">
          {step === 0 && <ProductTablePreview highlight={null} />}
          {step === 1 && <ScannerPreview />}
          {step === 2 && <ProductTablePreview highlight="lowstock" />}
          {step === 3 && <SalesChartPreview />}
        </div>
      </div>
    </div>
  );
}

function DashChrome({ activeTab }: { activeTab: string }) {
  const tabs = ['Dashboard', 'Products', 'Stock', 'Suppliers'];
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center text-white text-xs font-bold">
            T
          </div>
          <div className="text-sm font-bold text-slate-900">Tech to Store</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="px-4 flex items-center gap-1 overflow-x-auto">
        {tabs.map((t) => (
          <div
            key={t}
            className={`text-xs font-semibold px-3 py-2 border-b-2 ${
              t === activeTab
                ? 'border-emerald-500 text-emerald-700'
                : 'border-transparent text-slate-500'
            }`}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

interface KpiProps {
  label: string;
  value: string;
  trend: string;
  tone: 'emerald' | 'amber' | 'rose' | 'blue';
}

function KpiCard({ label, value, trend, tone }: KpiProps) {
  const tones = {
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    rose: 'text-rose-600 bg-rose-50',
    blue: 'text-blue-600 bg-blue-50',
  } as const;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-slate-200 bg-white p-3"
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="text-xl font-bold text-slate-900 mt-1">{value}</div>
      <div className={`text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded font-semibold ${tones[tone]}`}>
        {trend}
      </div>
    </motion.div>
  );
}

const PRODUCT_ROWS = [
  { name: 'Coca-Cola 355mL', sku: 'CCL-355', stock: 84, price: '$1.49' },
  { name: 'Organic Bananas', sku: 'BAN-ORG', stock: 12, price: '$0.79/lb' },
  { name: 'Whole Milk 2L', sku: 'MILK-2L', stock: 41, price: '$5.49' },
  { name: 'Sourdough Loaf', sku: 'BR-SOUR', stock: 7, price: '$4.99' },
];

function ProductTablePreview({ highlight }: { highlight: 'lowstock' | null }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
        <span>Recent products</span>
        <Package className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex-1 divide-y divide-slate-100">
        {PRODUCT_ROWS.map((p, i) => {
          const isLow = highlight === 'lowstock' && (p.stock < 15);
          return (
            <div key={p.sku} className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">{p.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{p.sku}</div>
              </div>
              <div className="text-right">
                <motion.div
                  key={`${p.sku}-${highlight}`}
                  initial={{ scale: 1.2, color: '#dc2626' }}
                  animate={{ scale: 1, color: isLow ? '#dc2626' : '#0f172a' }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="text-sm font-bold"
                >
                  {p.stock}
                </motion.div>
                <div className="text-[10px] text-slate-400">{p.price}</div>
              </div>
              {isLow && (
                <motion.span
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded"
                >
                  Low
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScannerPreview() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
        <Barcode className="w-3.5 h-3.5" /> Scan barcode
      </div>
      <div className="flex-1 p-3 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[200px] aspect-[4/3] rounded-xl bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent" />
          <motion.div
            initial={{ y: '0%' }}
            animate={{ y: ['0%', '100%', '0%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-2 right-2 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399]"
          />
          <div className="absolute inset-3 border-2 border-white/40 rounded-md" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-3 w-full rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs"
        >
          <div className="font-semibold text-emerald-800">Coca-Cola 355mL</div>
          <div className="text-emerald-700 text-[10px] font-mono">5449000000996</div>
        </motion.div>
      </div>
    </div>
  );
}

function SalesChartPreview() {
  const points = [12, 18, 14, 22, 20, 28, 36, 30, 42, 48, 44, 60];
  const max = 60;
  const w = 220;
  const h = 110;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Sales last 12 days
        </span>
        <span className="text-emerald-600 font-bold">+34%</span>
      </div>
      <div className="flex-1 p-3 flex items-end">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={area}
            fill="url(#salesGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   ESL mockup
---------------------------------------------------------------------------- */

function EslMockup({ step }: { step: number }) {
  const oldPrice = '$3.49';
  const newPrice = '$2.99';
  const showNewPrice = step >= 1;
  const showSync = step === 1;
  const showThreeTags = step >= 2;
  const showCountdown = step === 3;

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Editor pane */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Edit price — Coca-Cola 355mL
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-slate-400 font-mono">SKU CCL-355</div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 line-through">{oldPrice}</span>
            <motion.div
              key={`${showNewPrice}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-lg border-2 border-purple-300 bg-purple-50 px-3 py-1.5 text-base font-bold text-purple-700"
            >
              {showNewPrice ? newPrice : oldPrice}
            </motion.div>
          </div>
        </div>
        {showSync && (
          <div className="mt-3">
            <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1.5">
              <RefreshCcw className="w-3 h-3 animate-spin" /> Syncing 28 shelf tags…
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="h-full bg-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex-1 grid grid-cols-3 gap-3 items-center">
        {(showThreeTags ? [0, 1, 2] : [0]).map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className={`${i === 0 ? 'col-span-3 sm:col-span-1' : ''} ${
              showThreeTags ? '' : 'col-span-3'
            }`}
          >
            <ShelfTag
              brand="Coca-Cola"
              detail="355 mL bottle"
              price={showNewPrice ? newPrice : oldPrice}
              wasPrice={showNewPrice ? oldPrice : undefined}
              countdown={showCountdown}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ShelfTag({
  brand,
  detail,
  price,
  wasPrice,
  countdown,
}: {
  brand: string;
  detail: string;
  price: string;
  wasPrice?: string;
  countdown?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-100 p-2 shadow-inner">
      <div
        className="rounded-lg p-3"
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-700">
              {brand}
            </div>
            <div className="text-[9px] text-slate-500">{detail}</div>
          </div>
          <Tag className="w-3 h-3 text-slate-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          {wasPrice && (
            <span className="text-[9px] text-slate-400 line-through">{wasPrice}</span>
          )}
          <span className="text-2xl font-black text-slate-900 tracking-tight">{price}</span>
        </div>
        {countdown ? (
          <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-rose-700">
            <Clock className="w-2.5 h-2.5" />
            <span>SALE ENDS 02:14:33</span>
          </div>
        ) : (
          <div className="mt-1.5 text-[9px] font-mono text-slate-400">SKU CCL-355</div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   SEO mockup
---------------------------------------------------------------------------- */

interface SerpResult {
  id: string;
  rank: number;
  title: string;
  url: string;
  snippet: string;
  isYou?: boolean;
}

const BASE_RESULTS: SerpResult[] = [
  { id: 'a', rank: 1, title: 'Loblaws \u2014 Online Grocery', url: 'loblaws.ca', snippet: 'Shop fresh produce and organic groceries online.' },
  { id: 'b', rank: 2, title: 'Sobeys Canada', url: 'sobeys.com', snippet: 'Your neighbourhood grocer with delivery.' },
  { id: 'c', rank: 3, title: 'Whole Foods Market', url: 'wholefoodsmarket.com', snippet: 'Premium organic produce and pantry.' },
  { id: 'you', rank: 21, isYou: true, title: 'Your Store \u2014 Local Organic Grocer', url: 'yourstore.com', snippet: 'Family-owned, fresh daily.' },
  { id: 'd', rank: 4, title: 'FreshCo', url: 'freshco.com', snippet: 'Lowest prices on fresh groceries.' },
  { id: 'e', rank: 5, title: 'No Frills', url: 'nofrills.ca', snippet: 'Won\u2019t be beat on price.' },
];

function SeoMockup({ step }: { step: number }) {
  // step 0: rank 21
  // step 1: optimisation overlay
  // step 2: rank moves to 1
  // step 3: traffic chart
  const youRank = step >= 2 ? 1 : 21;
  const ordered = useMemo(() => {
    const list = BASE_RESULTS.map((r) => (r.isYou ? { ...r, rank: youRank } : r));
    return list.sort((a, b) => a.rank - b.rank).slice(0, 5);
  }, [youRank]);

  return (
    <div className="h-full flex flex-col">
      {/* Faux Google search bar */}
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-700 truncate">organic grocery near me</span>
        <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Toronto, ON
        </span>
      </div>

      {step === 3 ? (
        <TrafficChart />
      ) : (
        <div className="relative flex-1 mt-3 rounded-xl border border-slate-200 bg-white p-3 overflow-hidden">
          <div className="space-y-2">
            {ordered.map((r) => (
              <motion.div
                layout
                key={r.id}
                transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                className={`rounded-lg p-2.5 ${
                  r.isYou
                    ? 'ring-2 ring-blue-400 bg-blue-50'
                    : step === 0 && r.rank > 5
                    ? ''
                    : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      r.isYou ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    #{r.rank}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {r.title}
                    </div>
                    <div className="text-[10px] text-slate-400">{r.url}</div>
                  </div>
                </div>
                <div className="mt-1 text-[10px] text-slate-500 line-clamp-1">{r.snippet}</div>
              </motion.div>
            ))}
          </div>

          {step === 0 && (
            <div className="absolute inset-x-0 bottom-0 px-3 pb-2">
              <div className="text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 rounded-md px-2 py-1.5 text-center">
                Your store is on page 3. 93% of searchers won’t see it.
              </div>
            </div>
          )}

          {step === 1 && <OptimisationOverlay />}
        </div>
      )}
    </div>
  );
}

function OptimisationOverlay() {
  const items = [
    'Schema markup',
    'Local citations',
    'Site speed 98',
    'Reviews snippet',
    'Mobile-first',
  ];
  return (
    <div className="absolute inset-0 backdrop-blur-[2px] bg-white/70 flex items-center justify-center p-4">
      <div className="rounded-xl bg-white shadow-xl border border-slate-200 p-4 w-full max-w-xs">
        <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
          Tech to Store SEO toolkit
        </div>
        <div className="space-y-1.5">
          {items.map((it, i) => (
            <motion.div
              key={it}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.18 }}
              className="flex items-center gap-2 text-xs text-slate-700"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {it}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrafficChart() {
  const points = [120, 180, 240, 320, 460, 620, 880, 1100, 1340, 1620, 1840];
  const max = 1840;
  const w = 280;
  const h = 160;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * h * 0.92 - 4;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;

  return (
    <div className="flex-1 mt-3 rounded-xl border border-slate-200 bg-white p-4 flex flex-col">
      <div className="flex items-center justify-between text-xs">
        <div>
          <div className="font-bold text-slate-900">Weekly organic visitors</div>
          <div className="text-[10px] text-slate-500">Last 11 weeks</div>
        </div>
        <div className="text-right">
          <div className="text-emerald-600 font-bold">+1,420%</div>
          <div className="text-[10px] text-slate-400">vs starting traffic</div>
        </div>
      </div>
      <div className="flex-1 mt-2">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="seoTraffic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={area}
            fill="url(#seoTraffic)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
          <motion.circle
            cx={w}
            cy={h - (points[points.length - 1] / max) * h * 0.92 - 4}
            r="5"
            fill="#3b82f6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          />
        </svg>
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
        <span>120 / wk</span>
        <span className="text-blue-600 font-bold">1,840 / wk</span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Website mockup
---------------------------------------------------------------------------- */

function WebsiteMockup({ step }: { step: number }) {
  // 0: customise (template + accent colour)
  // 1: convert (cart + CTA)
  // 2: speed (lighthouse score)
  // 3: connected (sync diagram)
  return (
    <div className="h-full flex flex-col">
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex-1 flex flex-col">
        <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> Your storefront preview
        </div>
        <div className="flex-1 p-3">
          {step === 0 && <CustomiseStorefront />}
          {step === 1 && <ConversionFlow />}
          {step === 2 && <LighthouseScore />}
          {step === 3 && <SyncDiagram />}
        </div>
      </div>
    </div>
  );
}

function CustomiseStorefront() {
  const colors = ['#10b981', '#0ea5e9', '#a855f7', '#f43f5e', '#f59e0b'];
  return (
    <div className="h-full flex flex-col gap-3">
      {/* Faux storefront header */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <div
          className="h-2"
          style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}
        />
        <div className="px-3 py-2 flex items-center justify-between bg-white">
          <div className="text-sm font-extrabold text-emerald-700 tracking-tight">
            Acme Grocery
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span>Shop</span>
            <span>About</span>
            <span>Contact</span>
            <ShoppingCart className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          Fresh today
        </div>
        <div className="text-lg font-bold text-emerald-900 leading-tight mt-1">
          Locally grown,<br />delivered to your door.
        </div>
        <button className="mt-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-md">
          Shop produce
        </button>
      </div>

      {/* Brand colour picker */}
      <div className="rounded-lg border border-slate-200 bg-white p-2.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Brand colour
        </div>
        <div className="flex items-center gap-2">
          {colors.map((c, i) => (
            <motion.span
              key={c}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className={`w-6 h-6 rounded-full ring-2 ring-offset-1 ${
                i === 0 ? 'ring-slate-900' : 'ring-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ConversionFlow() {
  return (
    <div className="h-full grid grid-cols-2 gap-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Cart
        </div>
        <div className="mt-2 space-y-1.5 flex-1">
          {[
            { name: 'Bananas \u00d7 2', price: '$1.58' },
            { name: 'Whole Milk', price: '$5.49' },
            { name: 'Sourdough', price: '$4.99' },
          ].map((it, i) => (
            <motion.div
              key={it.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-slate-700">{it.name}</span>
              <span className="font-mono text-slate-900">{it.price}</span>
            </motion.div>
          ))}
        </div>
        <div className="border-t border-slate-100 pt-2 mt-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Total
          </span>
          <span className="text-base font-black text-slate-900">$12.06</span>
        </div>
      </div>
      <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 flex flex-col">
        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
          Checkout
        </div>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-2 space-y-2 flex-1"
        >
          <div className="rounded-md bg-white px-2 py-1.5 text-[10px] text-slate-500 border border-slate-200">
            Email
          </div>
          <div className="rounded-md bg-white px-2 py-1.5 text-[10px] text-slate-500 border border-slate-200">
            Address
          </div>
          <div className="rounded-md bg-white px-2 py-1.5 text-[10px] text-slate-500 border border-slate-200 flex items-center gap-1.5">
            <CreditCard className="w-3 h-3" /> Card details
          </div>
        </motion.div>
        <motion.button
          initial={{ scale: 0.95 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="mt-2 bg-rose-600 text-white text-xs font-bold py-1.5 rounded-md"
        >
          Place order
        </motion.button>
      </div>
    </div>
  );
}

function LighthouseScore() {
  const dials: { label: string; value: number; color: string }[] = [
    { label: 'Performance', value: 98, color: '#10b981' },
    { label: 'Accessibility', value: 100, color: '#3b82f6' },
    { label: 'Best Practices', value: 95, color: '#a855f7' },
    { label: 'SEO', value: 100, color: '#f43f5e' },
  ];
  return (
    <div className="h-full flex flex-col">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
        <Smartphone className="w-3.5 h-3.5" /> Lighthouse — Mobile
      </div>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
        {dials.map((d, i) => (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex flex-col items-center"
          >
            <DialSvg value={d.value} color={d.color} />
            <div className="mt-1 text-[10px] font-semibold text-slate-700 text-center">
              {d.label}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-800 font-semibold text-center">
        Pages load in under 1 second on 4G mobile.
      </div>
    </div>
  );
}

function DialSvg({ value, color }: { value: number; color: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function SyncDiagram() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
        One dashboard — everywhere in sync
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-md items-center">
        <SyncNode icon={<Globe className="w-4 h-4" />} label="Website" tone="rose" />
        <div className="flex flex-col items-center justify-center gap-1">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center"
          >
            <RefreshCcw className="w-4 h-4" />
          </motion.div>
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
            sync
          </span>
        </div>
        <SyncNode icon={<Package className="w-4 h-4" />} label="Inventory" tone="emerald" />
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-md items-center">
        <SyncNode icon={<Tag className="w-4 h-4" />} label="Shelf labels" tone="purple" />
        <div className="text-center text-[9px] text-slate-400">all backed by</div>
        <SyncNode icon={<Search className="w-4 h-4" />} label="SEO" tone="blue" />
      </div>
    </div>
  );
}

function SyncNode({
  icon,
  label,
  tone,
}: {
  icon: ReactNode;
  label: string;
  tone: 'emerald' | 'rose' | 'purple' | 'blue';
}) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    purple: 'bg-purple-50 text-purple-700 ring-purple-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  } as const;
  return (
    <div
      className={`rounded-xl ring-1 px-3 py-2.5 flex flex-col items-center gap-1 ${tones[tone]}`}
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </div>
  );
}
