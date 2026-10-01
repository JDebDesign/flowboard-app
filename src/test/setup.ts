import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Never create the real Supabase client in tests.
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => {
      throw new Error('supabase.from called without a test-specific mock');
    }),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

afterEach(() => {
  if (typeof document === 'undefined') return; // node-environment tests
  cleanup();
  document.head.innerHTML = '';
  document.body.style.overflow = '';
});
