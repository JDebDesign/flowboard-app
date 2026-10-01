import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabaseClient';

vi.mock('../context/useAuth');

function setup(auth: Record<string, unknown> = {}) {
  const fns = {
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signInWithMagicLink: vi.fn().mockResolvedValue({ error: null }),
    signUpWithPassword: vi.fn().mockResolvedValue({ error: null, needsEmailConfirmation: true }),
  };
  vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, ...fns, ...auth } as never);
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/boards" element={<p>boards page</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return { ...fns, user: userEvent.setup() };
}

const tab = (name: string) => screen.getByRole('tab', { name });

describe('LoginPage tabs (a11y)', () => {
  it('REGRESSION: exposes tablist semantics with roving tabindex', () => {
    setup();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(tab('Password')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Password')).toHaveAttribute('tabindex', '0');
    expect(tab('Magic link')).toHaveAttribute('tabindex', '-1');
  });

  it('REGRESSION: arrow keys, Home and End move between tabs, wrapping around', async () => {
    const { user } = setup();
    tab('Password').focus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Magic link')).toHaveFocus();
    expect(tab('Magic link')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(tab('Sign up')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(tab('Password')).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(tab('Sign up')).toHaveFocus();
    await user.keyboard('{Home}');
    expect(tab('Password')).toHaveFocus();
  });
});

describe('LoginPage flows', () => {
  it('signs in with password and goes to /boards', async () => {
    const { user, signInWithPassword } = setup();
    await user.type(screen.getByLabelText('Email Address'), 'a@b.co');
    await user.type(screen.getByLabelText('Password', { selector: 'input' }), 'secret1');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(signInWithPassword).toHaveBeenCalledWith('a@b.co', 'secret1');
    expect(await screen.findByText('boards page')).toBeInTheDocument();
  });

  it('shows the error in an alert, and switching tabs clears it', async () => {
    const { user } = setup({ signInWithPassword: vi.fn().mockResolvedValue({ error: 'Incorrect email or password.' }) });
    await user.type(screen.getByLabelText('Email Address'), 'a@b.co');
    await user.type(screen.getByLabelText('Password', { selector: 'input' }), 'x');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.');
    await user.click(tab('Magic link'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('forgot password needs an email first, then sends the reset', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter your email address first');
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ error: null } as never);
    await user.type(screen.getByLabelText('Email Address'), 'a@b.co');
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }));
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('a@b.co', { redirectTo: window.location.origin });
    expect(await screen.findByText('Password reset email sent — check your inbox.')).toBeInTheDocument();
  });

  it('magic link shows a confirmation notice', async () => {
    const { user, signInWithMagicLink } = setup();
    await user.click(tab('Magic link'));
    await user.type(screen.getByLabelText('Email Address'), 'a@b.co');
    await user.click(screen.getByRole('button', { name: /send magic link/i }));
    expect(signInWithMagicLink).toHaveBeenCalledWith('a@b.co');
    expect(await screen.findByText(/Magic link sent/)).toBeInTheDocument();
  });

  it('sign up asks to confirm email when needed', async () => {
    const { user } = setup();
    await user.click(tab('Sign up'));
    await user.type(screen.getByLabelText('Email Address'), 'a@b.co');
    await user.type(screen.getByLabelText('Password', { selector: 'input' }), 'secret1');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/check your email to confirm/)).toBeInTheDocument();
  });

  it('redirects already signed-in users to /boards', () => {
    setup({ user: { id: 'u1' } });
    expect(screen.getByText('boards page')).toBeInTheDocument();
  });
});
