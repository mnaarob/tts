import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DISMISSED_KEY = 'mfa_banner_dismissed';

export function MfaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY) === 'true') return;

    supabase.auth.mfa.listFactors().then(({ data }) => {
      const hasTotpFactor = data?.totp && data.totp.length > 0;
      if (!hasTotpFactor) {
        setVisible(true);
      }
    });
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="flex items-start gap-3 px-4 py-3 mb-6 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
      <div className="flex-shrink-0 p-1.5 bg-amber-100 rounded-lg mt-0.5">
        <ShieldAlert className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">
          Secure your account with two-factor authentication
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          Protect your store data by enabling authenticator app (TOTP) MFA.{' '}
          <Link
            to="/settings/security"
            className="underline underline-offset-2 hover:text-amber-900 font-medium"
          >
            Set it up now →
          </Link>
        </p>
      </div>
      <button
        onClick={dismiss}
        className="flex-shrink-0 p-1.5 rounded-lg text-amber-500 hover:bg-amber-100 active:bg-amber-200 transition-colors"
        aria-label="Dismiss MFA reminder"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
