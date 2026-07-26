import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { Features } from '../components/Features';
import { ThemesPeek } from '../components/ThemesPeek';
import { Footer } from '../components/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <Header overHero />
      <main>
        <Hero />
        <Services />
        <Features />
        <ThemesPeek />
      </main>
      <Footer />
    </div>
  );
}
