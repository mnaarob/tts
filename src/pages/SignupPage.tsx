import React, { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Store, Hash, Mail, Lock } from 'lucide-react';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { AuthTurnstile, TURNSTILE_SITE_KEY } from '../components/AuthTurnstile';
import { supabase } from '../lib/supabase';

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

    const normalizedStoreName = storeName.trim().replace(/[\u2018\u2019\u201C\u201D\u0060]/g, "'");

    const { data, error: fnError } = await supabase.functions.invoke<{
      ok?: boolean;
      error?: string;
      message?: string;
    }>('claim-employee-signup', {
      body: {
        store_name: normalizedStoreName,
        employee_id: employeeId.trim().toUpperCase(),
        email: email.trim(),
        password,
        captchaToken: captchaToken ?? undefined,
      },
    });

    setLoading(false);

    if (fnError) {
      setError(fnError.message || 'Could not create account. Try again.');
      resetCaptcha();
      return;
    }

    if (data && typeof data === 'object' && data.ok === false) {
      setError(data.error || 'Could not create account.');
      resetCaptcha();
      return;
    }

    navigate('/login', {
      replace: true,
      state: { message: 'signup_complete' },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2">
          <div className="bg-blue-900 p-1.5 rounded-lg">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-2xl text-slate-900">Tech to Store</span>
        </Link>
        <h2 className="mt-6 text-center text-xl font-bold text-slate-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-slate-500 max-w-md mx-auto px-2">
          Your manager adds you in <strong className="text-slate-700">Team</strong> with your name and email, then shares your{' '}
          <strong className="text-slate-700">Employee ID</strong>. Use the <strong className="text-slate-700">same email</strong> your manager entered, plus your store name, ID, and a new password.
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">At least 6 characters</p>
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
