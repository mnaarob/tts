import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import type { AuthTurnstileHandle } from '../components/AuthTurnstile';
import { AuthTurnstile, TURNSTILE_SITE_KEY } from '../components/AuthTurnstile';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabase';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<AuthTurnstileHandle | undefined>(undefined);

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError('Complete the verification below.');
      return;
    }
    setLoading(true);

    // redirectTo is the base URL — Supabase appends #access_token=...&type=recovery
    // The index.tsx interceptor rewrites that hash to #/reset-password?access_token=...
    const redirectTo = window.location.origin + window.location.pathname;

    // Fire-and-forget. We deliberately ignore the error and always show the
    // same "check your email" message so this endpoint can't be used to
    // enumerate which addresses have an account.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
      ...(captchaToken ? { captchaToken } : {}),
    });
    if (resetError) {
      // Log to the console for operators; never echo to the UI.
      console.warn('resetPasswordForEmail', resetError.message);
    }

    setLoading(false);
    setSent(true);
    resetCaptcha();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2">
          <Logo className="w-11 h-11 text-slate-900" />
          <span className="font-bold text-2xl text-slate-900">Tech to Store</span>
        </Link>
        <h2 className="mt-6 text-center text-xl font-bold text-slate-900">Reset your password</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl border border-slate-200">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Check your email</h3>
              <p className="mt-2 text-sm text-slate-600">
                If an account exists for <strong>{email}</strong>, we just sent it a
                password reset link. Click the link in the email to set a new password.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <form className="space-y-5" onSubmit={handleSubmit}>
                {!TURNSTILE_SITE_KEY && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg text-sm">
                    CAPTCHA is enabled on this project. Add <code className="font-mono text-xs">VITE_TURNSTILE_SITE_KEY</code> to{' '}
                    <code className="font-mono text-xs">.env.local</code> (see <code className="font-mono text-xs">.env.example</code>).
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {TURNSTILE_SITE_KEY && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 text-center">Verification</p>
                    <AuthTurnstile ref={turnstileRef} onTokenChange={setCaptchaToken} />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (Boolean(TURNSTILE_SITE_KEY) && !captchaToken)}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-slate-600">
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
