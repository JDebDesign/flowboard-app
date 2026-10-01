import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const APP_NAME = 'FlowBoard';

interface PageMeta {
  title?: string;
  description?: string;
  /** Keeps the page out of search results. Use for auth-gated and utility routes. */
  noindex?: boolean;
}

function setMeta(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/** Sets the tab title (WCAG 2.4.2) plus description, canonical and robots for the current route. */
export function usePageMeta({ title, description, noindex = false }: PageMeta = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} – ${APP_NAME}` : APP_NAME;
    document.title = fullTitle;

    const meta = (name: string) => () => {
      const el = document.createElement('meta');
      el.setAttribute('name', name);
      return el;
    };
    setMeta('meta[name="robots"]', meta('robots'), 'content', noindex ? 'noindex, nofollow' : 'index, follow');
    if (description) {
      setMeta('meta[name="description"]', meta('description'), 'content', description);
    }
    setMeta(
      'link[rel="canonical"]',
      () => {
        const el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        return el;
      },
      'href',
      `${__SITE_URL__}${pathname}`,
    );
  }, [title, description, noindex, pathname]);
}
