import React, { useCallback, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Store, Hash, Mail, Lock } from 'lucide-react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { AuthTurnstile, TURNSTILE_SITE_KEY } from '../components/AuthTurnstile';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { clearPendingInvite, getPendingInvite } from '../lib/pendingInvite';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as { email?: string })?.email ?? '';
  const pendingInvite = getPendingInvite();
  const [storeName, setStoreName] = useState(pendingInvite?.store_name ?? '');
  const [employeeId, setEmployeeId] = useState(pendingInvite?.employee_id ?? '');
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const { signIn } = useAuth();

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  }, []);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/inventory';
  const stateMsg = (location.state as { message?: string })?.message;
  const confirmMessage = stateMsg === 'confirm_email';
  const signupCompleteMessage = stateMsg === 'signup_complete';
  const accountExistsMessage = stateMsg === 'account_exists';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError('Complete the verification below.');
      return;
    }
    setLoading(true);

    // Step 1: Supabase email + password auth
    const { error: signInError } = await signIn(
      email,
      password,
      captchaToken ?? undefined,
    );
    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      resetCaptcha();
      return;
    }

    // Step 2: Validate store name + employee ID against DB
    // Normalize curly/smart quotes to straight apostrophes (phone keyboards auto-correct)
    const normalizedStoreName = storeName.trim().replace(/[\u2018\u2019\u201C\u201D\u0060]/g, "'");
    const empUpper = employeeId.trim().toUpperCase();

    // If we got here from a "account already exists" signup attempt, finish
    // claiming the invite now — the RPC trusts auth.uid()/auth.email() so
    // the user can never claim someone else's invite.
    const pending = getPendingInvite();
    if (pending) {
      const { data: claim, error: claimErr } = await supabase.rpc('claim_employee_invite', {
        p_store_name: pending.store_name,
        p_employee_id: pending.employee_id,
      });
      if (!claimErr && claim && (claim as { ok?: boolean }).ok) {
        clearPendingInvite();
        setLoading(false);
        navigate(from, { replace: true });
        return;
      }
      // Either the invite no longer matches or it was already claimed —
      // keep going through the regular validation path so the user gets a
      // single, generic error if everything fails.
    }

    const { data: valid, error: rpcError } = await supabase.rpc('validate_employee_login', {
      p_store_name: normalizedStoreName,
      p_employee_id: empUpper,
    });

    if (rpcError) {
      await supabase.auth.signOut();
      setLoading(false);
      setError(`Validation failed: ${rpcError.message}`);
      resetCaptcha();
      return;
    }

    if (!valid) {
      await supabase.auth.signOut();
      setLoading(false);
      setError('Store name or Employee ID is incorrect.');
      resetCaptcha();
      return;
    }

    clearPendingInvite();
    setLoading(false);
    navigate(from, { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2">
          <Logo className="w-11 h-11 text-slate-900" />
          <span className="font-bold text-2xl text-slate-900">Tech to Store</span>
        </Link>
        <h2 className="mt-6 text-center text-xl font-bold text-slate-900">Sign in to your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl border border-slate-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {confirmMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                Check your email and click the confirmation link, then sign in here.
              </div>
            )}
            {signupCompleteMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                Account created. Sign in below with the same store name, Employee ID, email, and password.
              </div>
            )}
            {accountExistsMessage && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                You already have an account with this email. Sign in with your <strong>existing</strong> password —
                we'll link your invite as soon as you're in.
              </div>
            )}
            {!TURNSTILE_SITE_KEY && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg text-sm">
                CAPTCHA is enabled on this project. Add <code className="font-mono text-xs">VITE_TURNSTILE_SITE_KEY</code> to{' '}
                <code className="font-mono text-xs">.env</code> (see <code className="font-mono text-xs">.env.example</code>).
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm space-y-2">
                <p>{error}</p>
                {/invalid login credentials/i.test(error) && (
                  <p className="text-xs text-red-600/90 leading-relaxed">
                    This comes from email/password verification (before store checks). Confirm your{' '}
                    <strong>Supabase project</strong> matches production (see <code className="font-mono text-[11px]">.env</code>{' '}
                    <code className="font-mono text-[11px]">VITE_SUPABASE_URL</code>), your email is confirmed, and complete the
                    verification widget again — an expired Turnstile token can block sign-in.
                  </p>
                )}
              </div>
            )}

            {/* Store Name */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 mb-1">
                Store Name
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="storeName"
                  type="text"
                  autoComplete="organization"
                  required
                  placeholder="e.g. Fresh Grocery Mart"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Employee ID */}
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 mb-1">
                Employee ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="employeeId"
                  type="text"
                  autoComplete="off"
                  required
                  maxLength={6}
                  placeholder="6-character ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono tracking-widest uppercase"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-400 bg-white px-2">
                account credentials
              </div>
            </div>

            {/* Email */}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {TURNSTILE_SITE_KEY && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 text-center">Verification</p>
                <AuthTurnstile ref={turnstileRef} onTokenChange={setCaptchaToken} />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            New employee?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Create account
            </Link>
            {' '}with your Employee ID from your manager.
          </p>
        </div>
      </div>
    </div>
  );
}
