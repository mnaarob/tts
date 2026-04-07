import React, { forwardRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

/** Public site key; undefined if not configured (CAPTCHA disabled or missing env). */
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

type AuthTurnstileProps = {
  onTokenChange: (token: string | null) => void;
};

export const AuthTurnstile = forwardRef<TurnstileInstance | undefined, AuthTurnstileProps>(
  function AuthTurnstile({ onTokenChange }, ref) {
    if (!TURNSTILE_SITE_KEY) return null;

    return (
      <div className="flex justify-center min-h-[65px] items-center">
        <Turnstile
          ref={ref}
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={(token) => onTokenChange(token)}
          onExpire={() => onTokenChange(null)}
          onError={() => onTokenChange(null)}
        />
      </div>
    );
  },
);
