// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../..');
const vercel = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));

describe('REGRESSION: static files and deploy config', () => {
  it.each(['llms.txt', 'og-image.png', 'site.webmanifest', 'favicon.svg'])('public/%s exists', (file) => {
    expect(existsSync(resolve(root, 'public', file))).toBe(true);
  });

  it('SPA rewrite lets static files through but catches app routes', () => {
    const re = new RegExp(`^${vercel.rewrites[0].source}$`);
    for (const path of ['/assets/x.js', '/robots.txt', '/sitemap.xml', '/llms.txt', '/og-image.png', '/site.webmanifest', '/favicon.svg']) {
      expect(re.test(path)).toBe(false);
    }
    for (const path of ['/boards', '/boards/123', '/login', '/nope']) {
      expect(re.test(path)).toBe(true);
    }
  });

  it('keeps private app routes out of search engines', () => {
    const noindex = vercel.headers
      .filter((h: { headers: { key: string }[] }) => h.headers.some((x) => x.key === 'X-Robots-Tag'))
      .map((h: { source: string }) => h.source);
    expect(noindex).toEqual(expect.arrayContaining(['/boards', '/boards/(.*)', '/design-system']));
  });

  it('caches hashed assets immutably', () => {
    const rule = vercel.headers.find((h: { source: string }) => h.source === '/assets/(.*)');
    expect(rule.headers[0].value).toContain('immutable');
  });
});

describe('REGRESSION: environment template', () => {
  it('.env.example documents all required variables without values', () => {
    const text = readFileSync(resolve(root, '.env.example'), 'utf8');
    for (const key of ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SITE_URL']) {
      expect(text).toMatch(new RegExp(`^${key}=$`, 'm'));
    }
  });
});
