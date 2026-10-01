import { friendlyError } from '../lib/errors';
import { createContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthResult {
  error: string | null;
  needsEmailConfirmation?: boolean;
}

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  slowLoading: boolean;
  signUpWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signInWithMagicLink: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      setSlowLoading(false);
      return;
    }
    const timer = setTimeout(() => setSlowLoading(true), 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      slowLoading,

      async signUpWithPassword(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) return { error: friendlyError(error, 'Could not create your account. Please try again.') };
        const needsEmailConfirmation = !data.session;
        return { error: null, needsEmailConfirmation };
      },

      async signInWithPassword(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? friendlyError(error, 'Something went wrong. Please try again.') : null };
      },

      async signInWithMagicLink(email) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin },
        });
        return { error: error ? friendlyError(error, 'Something went wrong. Please try again.') : null };
      },

      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [session, loading, slowLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
