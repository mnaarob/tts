import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CheckCircle2, Mail, MessageSquare, Phone, User } from 'lucide-react';
import type { AuthTurnstileHandle } from '../components/AuthTurnstile';
import { AuthTurnstile, TURNSTILE_SITE_KEY } from '../components/AuthTurnstile';
import { Header } from '../components/Header';
import { Logo } from '../components/Logo';
import { submitContactForm } from '../lib/contactSubmit';

export function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<AuthTurnstileHandle | undefined>(undefined);

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Contact email provider is activated for www — never submit from apex.
    if (window.location.hostname === 'techtostore.com') {
      window.location.replace(
        `https://www.techtostore.com/${window.location.hash || '#/contact'}`,
      );
      return;
    }

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError('Complete the verification below.');
      return;
    }

    setLoading(true);
    try {
      const result = await submitContactForm(
        {
          name,
          phone,
          email,
          businessName,
          message,
        },
        captchaToken ?? undefined,
      );

      if (!result.ok) {
        setError(result.error);
        resetCaptcha();
        return;
      }

      setSent(true);
    } catch {
      setError('Could not send your message. Please try again.');
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <Header />
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <Link to="/" className="flex justify-center items-center gap-2.5 mb-6">
            <Logo className="w-10 h-10" />
            <span className="font-display font-bold text-2xl text-ink lowercase tracking-brand">
              tech to store
            </span>
          </Link>
          <h1 className="font-display text-center text-2xl sm:text-3xl font-bold tracking-brand text-ink">
            {sent ? 'Thank you' : 'Talk to us'}
          </h1>
          <p className="mt-3 text-center text-muted text-sm sm:text-base leading-relaxed">
            {sent
              ? 'We appreciate your message and will reach out shortly.'
              : "Tell us about your store — we'll get back to you at the email you provide."}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-line">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-pin/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-pin" />
                </div>
                <h2 className="font-display text-xl font-bold text-ink mb-2">Message received</h2>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  A member of our team will follow up at the email you provided.
                </p>
                <Link to="/" className="btn-primary">
                  Back to home
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-ink/80 mb-1">
                    Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input pl-10"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-ink/80 mb-1">
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input pl-10"
                      placeholder="204 555 0100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink/80 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input pl-10"
                      placeholder="you@store.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="business" className="block text-sm font-medium text-ink/80 mb-1">
                    Business name <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="business"
                      type="text"
                      autoComplete="organization"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="form-input pl-10"
                      placeholder="Your store name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-ink/80 mb-1">
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-muted absolute left-3.5 top-3.5" />
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="form-input pl-10 resize-y min-h-[120px]"
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                {TURNSTILE_SITE_KEY && (
                  <div>
                    <p className="block text-sm font-medium text-ink/80 mb-2">Verification</p>
                    <AuthTurnstile ref={turnstileRef} onTokenChange={setCaptchaToken} />
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
                  {loading ? 'Sending…' : 'Send message'}
                </button>

                <p className="text-center text-xs text-muted">
                  Or email{' '}
                  <a href="mailto:contact@techtostore.com" className="form-link">
                    contact@techtostore.com
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
