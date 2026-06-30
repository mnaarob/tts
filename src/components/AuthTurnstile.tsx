import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

/** Public site key; undefined if not configured (CAPTCHA disabled or missing env). */
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

const FRESH_TOKEN_TIMEOUT_MS = 120_000;

export type AuthTurnstileHandle = {
  reset: () => void;
  /** Reset widget and resolve when Turnstile issues a new token (tokens are single-use). */
  getFreshToken: () => Promise<string>;
};

type AuthTurnstileProps = {
  onTokenChange: (token: string | null) => void;
};

export const AuthTurnstile = forwardRef<AuthTurnstileHandle | undefined, AuthTurnstileProps>(
  function AuthTurnstile({ onTokenChange }, ref) {
    const innerRef = useRef<TurnstileInstance | undefined>(undefined);
    const pendingRef = useRef<{
      resolve: (token: string) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    } | null>(null);

    const clearPending = useCallback((error?: Error) => {
      const pending = pendingRef.current;
      if (!pending) return;
      clearTimeout(pending.timer);
      pendingRef.current = null;
      if (error) pending.reject(error);
    }, []);

    const settlePending = useCallback(
      (token: string | null, errorMessage?: string) => {
        const pending = pendingRef.current;
        if (!pending) return;
        clearTimeout(pending.timer);
        pendingRef.current = null;
        if (token) pending.resolve(token);
        else pending.reject(new Error(errorMessage ?? 'CAPTCHA verification failed'));
      },
      [],
    );

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          clearPending(new Error('CAPTCHA reset'));
          onTokenChange(null);
          innerRef.current?.reset();
        },
        getFreshToken: () =>
          new Promise<string>((resolve, reject) => {
            if (pendingRef.current) {
              reject(new Error('CAPTCHA refresh already in progress'));
              return;
            }
            const timer = setTimeout(() => {
              settlePending(null, 'CAPTCHA timed out. Complete verification and try again.');
            }, FRESH_TOKEN_TIMEOUT_MS);
            pendingRef.current = { resolve, reject, timer };
            onTokenChange(null);
            innerRef.current?.reset();
          }),
      }),
      [clearPending, onTokenChange, settlePending],
    );

    if (!TURNSTILE_SITE_KEY) return null;

    return (
      <div className="flex justify-center min-h-[65px] items-center">
        <Turnstile
          ref={innerRef}
          siteKey={TURNSTILE_SITE_KEY}
          options={{ refreshExpired: 'auto', retry: 'auto' }}
          onSuccess={(token) => {
            onTokenChange(token);
            settlePending(token);
          }}
          onExpire={() => {
            onTokenChange(null);
            settlePending(null, 'CAPTCHA expired. Complete verification again.');
          }}
          onError={() => {
            onTokenChange(null);
            settlePending(null, 'CAPTCHA failed to load. Check your connection and try again.');
          }}
          onTimeout={() => {
            onTokenChange(null);
            settlePending(null, 'CAPTCHA timed out. Complete verification again.');
          }}
        />
      </div>
    );
  },
);
