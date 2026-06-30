import React, { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Hash, Mail, Lock } from 'lucide-react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { AuthTurnstile, TURNSTILE_SITE_KEY } from '../components/AuthTurnstile';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { MIN_PASSWORD_LENGTH, PASSWORD_HELP_TEXT, checkPassword } from '../lib/password';
import { setPendingInvite } from '../lib/pendingInvite';

export function SignupPage() {
  const [storeName, setStoreName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | undefined>(undefined);
  const navigate = useNavigate();
  const { signIn } = useAuth();

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

    if (employeeId.trim().length !== 6) {
      setLoading(false);
      setError('Employee ID must be exactly 6 characters.');
      resetCaptcha();
      return;
    }

    const pwCheck = checkPassword(password);
    if (!pwCheck.ok) {
      setLoading(false);
      setError(pwCheck.reason);
      resetCaptcha();
      return;
    }

    const normalizedStoreName = storeName.trim().replace(/[\u2018\u2019\u201C\u201D\u0060]/g, "'");
    const empUpper = employeeId.trim().toUpperCase();
    const emailTrim = email.trim();

    const { data, error: fnError } = await supabase.functions.invoke<{
      ok?: boolean;
      error?: string;
      message?: string;
      code?: 'account_exists' | 'invalid' | 'rate_limited' | 'server_error';
    }>('claim-employee-signup', {
      body: {
        store_name: normalizedStoreName,
        employee_id: empUpper,
        email: emailTrim,
        password,
        captchaToken: captchaToken ?? undefined,
      },
    });

    if (fnError) {
      setLoading(false);
      setError(fnError.message || 'Could not create account. Try again.');
      resetCaptcha();
      return;
    }

    if (data && typeof data === 'object' && data.ok === false) {
      // The edge function refuses to overwrite an existing account.
      // Send the user to /login with the invite info pinned so we can
      // finish the link via the `claim_employee_invite` RPC after sign-in.
      if (data.code === 'account_exists') {
        setPendingInvite({ store_name: normalizedStoreName, employee_id: empUpper });
        setLoading(false);
        navigate('/login', {
          replace: true,
          state: {
            email: emailTrim,
            message: 'account_exists',
          },
        });
        return;
      }

      setLoading(false);
      setError(data.error || 'Could not create account.');
      resetCaptcha();
      return;
    }

    const { error: signInError } = await signIn(emailTrim, password, captchaToken ?? undefined);
    if (signInError) {
      setLoading(false);
      setError(
        signInError.message ||
          'Account is ready but sign-in failed. Use Sign in on the login page with the same email and password.',
      );
      resetCaptcha();
      return;
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
      setError('Could not open inventory: store or Employee ID did not match your new account. Try signing in from the login page.');
      resetCaptcha();
      return;
    }

    setLoading(false);
    navigate('/inventory', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2">
          <Logo className="w-11 h-11 text-slate-900" />
          <span className="font-bold text-2xl text-slate-900">Tech to Store</span>
        </Link>
        <h2 className="mt-6 text-center text-xl font-bold text-slate-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-slate-500 max-w-md mx-auto px-2">
          Your manager adds you in <strong className="text-slate-700">Team</strong> with your name and email, then shares your{' '}
          <strong className="text-slate-700">Employee ID</strong>. Enter the <strong className="text-slate-700">same email</strong>, store name, and ID, then choose a{' '}
          <strong className="text-slate-700">password</strong> you will use to sign in (even if you already used this email elsewhere—we will link your invite to your account).
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl border border-slate-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {!TURNSTILE_SITE_KEY && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg text-sm">
                CAPTCHA is enabled on this project. Add <code className="font-mono text-xs">VITE_TURNSTILE_SITE_KEY</code> to{' '}
                <code className="font-mono text-xs">.env</code> (see <code className="font-mono text-xs">.env.example</code>).
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                  placeholder="6-character ID from your manager"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono tracking-widest uppercase"
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-400 bg-white px-2">
                account credentials
              </div>
            </div>

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
              <p className="mt-1 text-xs text-slate-500">
                Must match the email your manager entered when they added you—otherwise signup will fail.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">{PASSWORD_HELP_TEXT} This becomes your password for Sign in after you join.</p>
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
