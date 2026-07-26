import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

type LegalPageLayoutProps = {
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPageLayout({ title, updated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <Header />
      <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted mb-3">
            Legal
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink tracking-tight">
            {title}
          </h1>
          <p className="mt-4 text-sm text-muted">
            Last updated: {updated}
          </p>
          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-ink/90 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-brand [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:text-muted [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:text-muted [&_a]:text-crimson [&_a]:underline-offset-2 hover:[&_a]:underline">
            {children}
          </div>
          <p className="mt-14 pt-8 border-t border-line text-sm text-muted">
            Questions?{' '}
            <a href="mailto:contact@techtostore.com" className="form-link">
              contact@techtostore.com
            </a>
            {' · '}
            <Link to="/" className="form-link">
              Back to home
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
