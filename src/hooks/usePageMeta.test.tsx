import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { usePageMeta } from './usePageMeta';

const wrapper = (path = '/boards') =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>;
  };

const robots = () => document.head.querySelector('meta[name="robots"]')?.getAttribute('content');
const canonical = () => document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');

describe('usePageMeta', () => {
  it('sets a suffixed title, or just the app name without one', () => {
    renderHook(() => usePageMeta({ title: 'Roadmap' }), { wrapper: wrapper() });
    expect(document.title).toBe('Roadmap – FlowBoard');
    renderHook(() => usePageMeta(), { wrapper: wrapper() });
    expect(document.title).toBe('FlowBoard');
  });

  it('toggles robots between noindex and index', () => {
    renderHook(() => usePageMeta({ noindex: true }), { wrapper: wrapper() });
    expect(robots()).toBe('noindex, nofollow');
    renderHook(() => usePageMeta(), { wrapper: wrapper() });
    expect(robots()).toBe('index, follow');
  });

  it('builds the canonical URL from the site URL and path', () => {
    renderHook(() => usePageMeta(), { wrapper: wrapper('/login') });
    expect(canonical()).toBe('https://flowboard.test/login');
  });

  it('only sets a description when given one', () => {
    renderHook(() => usePageMeta(), { wrapper: wrapper() });
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
    renderHook(() => usePageMeta({ description: 'Hello' }), { wrapper: wrapper() });
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Hello');
  });

  it('reuses existing tags instead of duplicating them', () => {
    renderHook(() => usePageMeta({ noindex: true }), { wrapper: wrapper() });
    renderHook(() => usePageMeta({ noindex: true }), { wrapper: wrapper() });
    expect(document.head.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });
});
