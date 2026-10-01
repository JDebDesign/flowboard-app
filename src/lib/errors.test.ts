import { friendlyError } from './errors';

describe('friendlyError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it.each([
    ['Invalid login credentials', 'Incorrect email or password.'],
    ['Email not confirmed', 'Please confirm your email address before signing in.'],
    ['User already registered', 'An account with this email already exists.'],
    ['Password should be at least 6 characters', 'Password must be at least 6 characters.'],
    ['Password is known to be weak', 'That password is too weak or has appeared in a data breach. Please choose another.'],
    ['Email rate limit exceeded', 'Too many attempts. Please wait a moment and try again.'],
    ['Invalid email address', 'Please enter a valid email address.'],
  ])('maps "%s"', (raw, friendly) => {
    expect(friendlyError(new Error(raw), 'fallback')).toBe(friendly);
  });

  it('accepts plain Supabase-style error objects', () => {
    expect(friendlyError({ message: 'invalid login credentials' }, 'fb')).toBe('Incorrect email or password.');
  });

  it('never leaks raw database details; returns the fallback', () => {
    const raw = 'duplicate key value violates unique constraint "cards_pkey" on table public.cards';
    expect(friendlyError(new Error(raw), 'Could not save the card.')).toBe('Could not save the card.');
  });

  it('falls back for null, undefined and message-less values', () => {
    expect(friendlyError(null, 'fb')).toBe('fb');
    expect(friendlyError(undefined, 'fb')).toBe('fb');
    expect(friendlyError({}, 'fb')).toBe('fb');
  });

  it('logs the raw error to the console', () => {
    const err = new Error('secret detail');
    friendlyError(err, 'fb');
    expect(console.error).toHaveBeenCalledWith(err);
  });
});
