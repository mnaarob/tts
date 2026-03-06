import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error, session } = await signUp(email, password, storeName || undefined);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // If we have a session (email confirmation disabled), go straight to dashboard
    if (session) {
      navigate('/inventory', { replace: true });
      return;
    }
    // Email confirmation required - show success and redirect to login
    setSuccess(true);
    setTimeout(() => navigate('/login', { replace: true, state: { message: 'confirm_email' } }), 3000);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Account created!</h2>
          <p className="mt-2 text-slate-600">
            Check your email for a confirmation link. Once confirmed, you can sign in.
          </p>
          <p className="mt-4 text-sm text-slate-500">Redirecting to sign in...</p>
        </div>
      </div>
    );
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
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-slate-700">Store name</label>
              <input
                id="storeName"
                type="text"
                placeholder="e.g. Fresh Mart Grocery"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-slate-500">At least 6 characters</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
