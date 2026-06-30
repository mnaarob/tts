import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';
import { MIN_PASSWORD_LENGTH, PASSWORD_HELP_TEXT, checkPassword } from '../lib/password';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Tokens may be in the query string (rewritten by index.tsx interceptor)
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error: sessErr }) => {
          if (!sessErr) {
            setSessionReady(true);
            // Strip tokens from the URL so they don't leak via referer headers,
            // browser history, screen-share, or analytics.
            try {
              window.history.replaceState({}, '', '#/reset-password');
            } catch {
              // history API blocked — best-effort only.
            }
          } else {
            setError('Reset link is invalid or expired. Please request a new one.');
          }
        });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setSessionReady(true);
      });
    }

    return () => subscription.unsubscribe();
  }, [location.search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const pwCheck = checkPassword(password);
    if (!pwCheck.ok) {
      setError(pwCheck.reason);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Force every other refresh token (including the recovery one) to be
    // revoked so an attacker who already had the old session can't keep using it.
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      // Best effort — never block the success flow.
    }

    setDone(true);
    setTimeout(() => navigate('/login', { replace: true }), 3000);
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900 mx-auto mb-4" />
          <p className="text-slate-600 text-sm">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2">
          <Logo className="w-11 h-11 text-slate-900" />
          <span className="font-bold text-2xl text-slate-900">Tech to Store</span>
        </Link>
        <h2 className="mt-6 text-center text-xl font-bold text-slate-900">
          {done ? 'Password updated' : 'Set a new password'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl border border-slate-200">
          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-sm text-slate-600">
                Your password has been updated. Redirecting to sign in...
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  New password
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
                <p className="mt-1 text-xs text-slate-500">{PASSWORD_HELP_TEXT}</p>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm new password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
