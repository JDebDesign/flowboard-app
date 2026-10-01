import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { parseDesignSystemMarkdown, renderTokensCss, renderTokensTs } from './scripts/design-tokens-lib.mjs'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const mdPath = path.resolve(dirname, 'design-system.md')
const cssOutPath = path.resolve(dirname, 'src/styles/tokens.css')
const tsOutPath = path.resolve(dirname, 'src/design-system/tokens.generated.ts')

function syncDesignTokens(): void {
  try {
    const tokens = parseDesignSystemMarkdown(readFileSync(mdPath, 'utf8'))
    mkdirSync(path.dirname(cssOutPath), { recursive: true })
    mkdirSync(path.dirname(tsOutPath), { recursive: true })
    writeFileSync(cssOutPath, renderTokensCss(tokens))
    writeFileSync(tsOutPath, renderTokensTs(tokens))
  } catch (err) {
    // Keep the last-good generated files during dev rather than crashing the server.
    console.error('\n[design-tokens] Failed to sync design-system.md:\n', err instanceof Error ? err.message : err, '\n')
  }
}

function designTokensPlugin(): Plugin {
  return {
    name: 'design-tokens-sync',
    buildStart() {
      syncDesignTokens()
    },
    configureServer(server) {
      server.watcher.add(mdPath)
      server.watcher.on('change', (changedPath) => {
        if (path.normalize(changedPath) === path.normalize(mdPath)) {
          syncDesignTokens()
        }
      })
    },
  }
}

// Public crawlable routes only. Everything else is auth-gated or a utility page.
function seoPlugin(siteUrl: string): Plugin {
  return {
    name: 'seo',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl),
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /login\nDisallow: /boards\nDisallow: /design-system\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/login</loc></url>\n</urlset>\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, dirname, '')
  const siteUrl = (env.VITE_SITE_URL || 'https://flowboard.example.com').replace(/\/$/, '')
  return {
    plugins: [react(), designTokensPlugin(), seoPlugin(siteUrl)],
    define: { __SITE_URL__: JSON.stringify(siteUrl) },
  }
})
