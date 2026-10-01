import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('finishes loading once the session resolves', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: { user: { id: 'u1' } } } } as never);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual({ id: 'u1' });
  });

  it('REGRESSION: flags slowLoading after 5s of loading, and clears it afterwards', async () => {
    vi.useFakeTimers();
    let resolve!: (v: unknown) => void;
    vi.mocked(supabase.auth.getSession).mockReturnValue(new Promise((r) => (resolve = r)) as never);
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.slowLoading).toBe(false);
    act(() => void vi.advanceTimersByTime(4999));
    expect(result.current.slowLoading).toBe(false);
    act(() => void vi.advanceTimersByTime(1));
    expect(result.current.slowLoading).toBe(true);
    await act(async () => resolve({ data: { session: null } }));
    expect(result.current.loading).toBe(false);
    expect(result.current.slowLoading).toBe(false);
    vi.useRealTimers();
  });

  it('unsubscribes from auth changes on unmount', async () => {
    const unsubscribe = vi.fn();
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({ data: { subscription: { unsubscribe } } } as never);
    const { unmount } = renderHook(() => useAuth(), { wrapper });
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('signUp reports when email confirmation is needed', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({ data: { session: null }, error: null } as never);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(result.current.signUpWithPassword('a@b.co', 'secret1')).resolves.toEqual({
      error: null,
      needsEmailConfirmation: true,
    });
  });

  it('REGRESSION: auth errors are translated to friendly messages', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {},
      error: new Error('Invalid login credentials'),
    } as never);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(result.current.signInWithPassword('a@b.co', 'bad')).resolves.toEqual({
      error: 'Incorrect email or password.',
    });
  });

  it('magic link passes the site origin as redirect', async () => {
    vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({ error: null } as never);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.signInWithMagicLink('a@b.co');
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'a@b.co',
      options: { emailRedirectTo: window.location.origin },
    });
  });
});
