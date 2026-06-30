import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Defence-in-depth: when the user is signed out from anywhere
      // (token revoked, password reset, manager removed them), wipe any
      // app-level state cached in storage.
      if (event === 'SIGNED_OUT') {
        try {
          sessionStorage.clear();
        } catch {
          // Ignore — private mode etc.
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, captchaToken?: string) => {
    const emailNorm = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailNorm,
      password,
      ...(captchaToken ? { options: { captchaToken } } : {}),
    });
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Explicit `global` revokes every refresh token tied to this user, so a
    // stolen token from another device/browser is invalidated immediately.
    await supabase.auth.signOut({ scope: 'global' });
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
