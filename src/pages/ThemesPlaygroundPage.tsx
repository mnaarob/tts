import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Store,
} from 'lucide-react';
import { Header } from '../components/Header';
import { THEMES, getTheme, type ThemeSlug } from '../data/themes';

interface PersonalizationData {
  name: string;
  address: string;
  email: string;
  phone: string;
  hours: string;
}

const STORAGE_KEY = 'tts.themePersonalization';

const DEFAULTS: PersonalizationData = {
  name: 'Your Store Name',
  address: '123 Main Street, Your City, ST 00000',
  email: 'hello@yourstore.com',
  phone: '+1 (555) 123-4567',
  hours: 'Mon - Sat: 8:00am to 9:00pm',
};

const SAMPLE: PersonalizationData = {
  name: 'Acme Fresh Market',
  address: '742 Evergreen Terrace, Springfield, IL 62701',
  email: 'hello@acmefresh.com',
  phone: '+1 (217) 555-0142',
  hours: 'Mon - Sun: 7:00am to 10:00pm',
};

function buildHash(d: PersonalizationData): string {
  const parts: string[] = [];
  (Object.keys(d) as (keyof PersonalizationData)[]).forEach((k) => {
    const v = d[k];
    if (v && v.trim()) {
      parts.push(`${k}=${encodeURIComponent(v.trim())}`);
    }
  });
  return parts.length ? '#' + parts.join('&') : '';
}

function loadStored(): PersonalizationData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersonalizationData>;
    return {
      name: parsed.name ?? '',
      address: parsed.address ?? '',
      email: parsed.email ?? '',
      phone: parsed.phone ?? '',
      hours: parsed.hours ?? '',
    };
  } catch {
    return null;
  }
}

function persist(data: PersonalizationData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* swallow quota / disabled storage */
  }
}

function clearStored() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function ThemesPlaygroundPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const initialSlug: ThemeSlug = useMemo(() => {
    const match = slug && getTheme(slug);
    return (match ? (slug as ThemeSlug) : THEMES[0].slug);
  }, [slug]);

  const [data, setData] = useState<PersonalizationData | null>(() => loadStored());
  const [activeSlug, setActiveSlug] = useState<ThemeSlug>(initialSlug);

  useEffect(() => {
    if (slug && getTheme(slug)) {
      setActiveSlug(slug as ThemeSlug);
    }
  }, [slug]);

  function handleOnboardingSave(next: PersonalizationData) {
    persist(next);
    setData(next);
  }

  function handleSkip() {
    persist(DEFAULTS);
    setData(DEFAULTS);
  }

  function handleReset() {
    clearStored();
    setData(null);
    navigate('/themes');
  }

  function handleSlugChange(next: ThemeSlug) {
    setActiveSlug(next);
    navigate(`/themes/${next}`, { replace: true });
  }

  function handleDataChange(next: PersonalizationData) {
    setData(next);
    persist(next);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Header />
      <main className="pt-28 pb-16">
        {data === null ? (
          <OnboardingPhase onSave={handleOnboardingSave} onSkip={handleSkip} />
        ) : (
          <PlaygroundPhase
            data={data}
            onChange={handleDataChange}
            activeSlug={activeSlug}
            onSlugChange={handleSlugChange}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}

/* ============================================================================
 * Phase A — onboarding
 * ============================================================================ */

function OnboardingPhase({
  onSave,
  onSkip,
}: {
  onSave: (data: PersonalizationData) => void;
  onSkip: () => void;
}) {
  const [draft, setDraft] = useState<PersonalizationData>({
    name: '',
    address: '',
    email: '',
    phone: '',
    hours: '',
  });

  function update<K extends keyof PersonalizationData>(key: K, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const filled: PersonalizationData = {
      name: draft.name.trim() || DEFAULTS.name,
      address: draft.address.trim() || DEFAULTS.address,
      email: draft.email.trim() || DEFAULTS.email,
      phone: draft.phone.trim() || DEFAULTS.phone,
      hours: draft.hours.trim() || DEFAULTS.hours,
    };
    onSave(filled);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-5">
          <Sparkles className="w-4 h-4" />
          Live, personalizable demos
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
          See your store come to life
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
          Tell us a few details about your business. We'll instantly drop them into every template
          so you can preview your storefront — and switch designs without retyping a thing.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">About your store</h2>
            <p className="text-xs text-slate-500">
              All fields optional — leave blank to use sample text.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Store name"
            value={draft.name}
            placeholder={DEFAULTS.name}
            onChange={(v) => update('name', v)}
            autoFocus
          />
          <Field
            label="Phone"
            type="tel"
            value={draft.phone}
            placeholder={DEFAULTS.phone}
            onChange={(v) => update('phone', v)}
          />
          <Field
            label="Email"
            type="email"
            value={draft.email}
            placeholder={DEFAULTS.email}
            onChange={(v) => update('email', v)}
          />
          <Field
            label="Business hours"
            value={draft.hours}
            placeholder={DEFAULTS.hours}
            onChange={(v) => update('hours', v)}
          />
          <div className="sm:col-span-2">
            <Field
              label="Address"
              value={draft.address}
              placeholder={DEFAULTS.address}
              onChange={(v) => update('address', v)}
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 flex-1"
          >
            See your templates
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 hover:border-slate-300 px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Skip with sample data
          </button>
        </div>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Your details stay in this browser only — no account required.
      </p>
    </div>
  );
}

/* ============================================================================
 * Phase B — playground
 * ============================================================================ */

function PlaygroundPhase({
  data,
  onChange,
  activeSlug,
  onSlugChange,
  onReset,
}: {
  data: PersonalizationData;
  onChange: (data: PersonalizationData) => void;
  activeSlug: ThemeSlug;
  onSlugChange: (slug: ThemeSlug) => void;
  onReset: () => void;
}) {
  const theme = getTheme(activeSlug)!;

  const [debouncedData, setDebouncedData] = useState<PersonalizationData>(data);
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedData(data), 500);
    return () => window.clearTimeout(t);
  }, [data]);

  const hash = useMemo(() => buildHash(debouncedData), [debouncedData]);
  const iframeSrc = `/themes/${theme.slug}/index.html${hash}`;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeSrc;
    }
  }, [iframeSrc]);

  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Heading + reset */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Your store, six ways
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalized for{' '}
            <span className="font-semibold text-slate-700">{data.name || DEFAULTS.name}</span>.
            Switch templates anytime — your info stays put.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={iframeSrc}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open full preview
          </a>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2.5 transition-colors bg-white"
            title="Start over"
          >
            <RotateCcw className="w-4 h-4" />
            Start over
          </button>
        </div>
      </div>

      {/* Template selector */}
      <div className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {THEMES.map((t) => {
            const isActive = t.slug === activeSlug;
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => onSlugChange(t.slug)}
                className={`group relative flex flex-col text-left rounded-xl border-2 bg-white overflow-hidden transition-all ${
                  isActive
                    ? 'shadow-md -translate-y-0.5'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
                style={isActive ? { borderColor: t.accentColor } : undefined}
              >
                <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={t.thumbnailPath}
                    alt={`${t.displayName} thumbnail`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="px-2.5 py-2">
                  <div
                    className={`text-xs font-bold tracking-tight truncate ${
                      isActive ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {t.displayName}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{t.tagline}</div>
                </div>
                {isActive && (
                  <span
                    className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: t.accentColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Big preview */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="ml-2 flex-1 truncate text-xs text-slate-500 font-mono">
            {(data.name || DEFAULTS.name).toLowerCase().replace(/\s+/g, '')}.
            {theme.slug}.demo
          </div>
          <span
            className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded"
            style={{ backgroundColor: theme.accentColor }}
          >
            {theme.displayName}
          </span>
        </div>
        <div className="w-full h-[75vh] bg-white">
          <iframe
            ref={iframeRef}
            title={`${theme.displayName} live preview`}
            src={iframeSrc}
            className="w-full h-full border-0"
          />
        </div>
      </section>

      {/* Edit panel */}
      <section className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setEditorOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Edit your info</div>
              <div className="text-xs text-slate-500">
                Updates land in the preview after a short pause.
              </div>
            </div>
          </div>
          {editorOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {editorOpen && (
          <div className="px-5 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Store name"
                value={data.name}
                placeholder={DEFAULTS.name}
                onChange={(v) => onChange({ ...data, name: v })}
              />
              <Field
                label="Phone"
                type="tel"
                value={data.phone}
                placeholder={DEFAULTS.phone}
                onChange={(v) => onChange({ ...data, phone: v })}
              />
              <Field
                label="Email"
                type="email"
                value={data.email}
                placeholder={DEFAULTS.email}
                onChange={(v) => onChange({ ...data, email: v })}
              />
              <Field
                label="Business hours"
                value={data.hours}
                placeholder={DEFAULTS.hours}
                onChange={(v) => onChange({ ...data, hours: v })}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Address"
                  value={data.address}
                  placeholder={DEFAULTS.address}
                  onChange={(v) => onChange({ ...data, address: v })}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onChange(SAMPLE)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
              >
                Use sample store
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => onChange(DEFAULTS)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2"
              >
                Reset fields
              </button>
            </div>
          </div>
        )}
      </section>

      {/* CTA card */}
      <section
        className="mt-6 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.accentColor}dd)`,
        }}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-80">
              Ready to launch?
            </div>
            <h3 className="mt-1 text-xl sm:text-2xl font-bold">
              Make {data.name || DEFAULTS.name} your real storefront.
            </h3>
            <p className="mt-1.5 text-sm text-white/85 max-w-xl">
              Create an account and we'll wire this template up to your live inventory, hours and
              pricing — usually in under a day.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-50 px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Create your account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================================
 * Shared field
 * ============================================================================ */

interface FieldProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
  onChange: (v: string) => void;
}

function Field({ label, value, placeholder, type = 'text', autoFocus, onChange }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-colors"
      />
    </label>
  );
}
