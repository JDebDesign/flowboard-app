// Maps raw Supabase/Postgres errors to safe, user-facing messages.
// Details go to the console only, so internals (table names, constraint names) never reach the UI.

export const MAX_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 5000;

const AUTH_MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, 'Incorrect email or password.'],
  [/email not confirmed/i, 'Please confirm your email address before signing in.'],
  [/already registered|already been registered/i, 'An account with this email already exists.'],
  [/password should be at least/i, 'Password must be at least 6 characters.'],
  [/weak|pwned|compromised|easy to guess/i, 'That password is too weak or has appeared in a data breach. Please choose another.'],
  [/rate limit|too many/i, 'Too many attempts. Please wait a moment and try again.'],
  [/valid email|invalid.*email/i, 'Please enter a valid email address.'],
];

export function friendlyError(err: unknown, fallback: string): string {
  console.error(err);
  const message = err instanceof Error ? err.message : (err as { message?: string } | null)?.message;
  if (message) {
    for (const [pattern, friendly] of AUTH_MESSAGES) {
      if (pattern.test(message)) return friendly;
    }
  }
  return fallback;
}
