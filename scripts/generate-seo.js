#!/usr/bin/env node

/**
 * Dynamic SEO Assets Generator for Traceri
 * Generates robots.txt, sitemap.xml, and site.webmanifest based on APP_URL.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

// Resolve Target App URL from CLI argument, environment, or default to https://traceri.vercel.app
const cliArg = process.argv[2];
const envUrl = process.env.APP_URL || process.env.VITE_APP_URL;
let rawUrl = (cliArg || (envUrl && !envUrl.includes('run.app') ? envUrl : 'https://traceri.vercel.app')).trim();
if (!/^https?:\/\//i.test(rawUrl)) {
  rawUrl = `https://${rawUrl}`;
}
const APP_URL = rawUrl.replace(/\/$/, '');

const ROUTES = [
  {
    path: '/',
    changefreq: 'daily',
    priority: '1.0',
    title: 'Primary Archive Catalog',
  },
  {
    path: '/threads',
    changefreq: 'weekly',
    priority: '0.9',
    title: 'Recurrent Threads & Sequences',
  },
  {
    path: '/story',
    changefreq: 'weekly',
    priority: '0.9',
    title: 'Narrative Monograph & Chapters',
  },
  {
    path: '/calendar',
    changefreq: 'weekly',
    priority: '0.8',
    title: 'Chronological Life Matrix',
  },
  {
    path: '/atlas',
    changefreq: 'weekly',
    priority: '0.8',
    title: 'Spatial Cartography & Coordinates',
  },
  {
    path: '/discoveries',
    changefreq: 'weekly',
    priority: '0.8',
    title: 'Algorithmic Discoveries & Patterns',
  },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt() {
  const content = `# Robots.txt for Traceri Digital Life Archive
# Generated automatically by scripts/generate-seo.js
# Canonical Base: ${APP_URL}

User-agent: *
Allow: /

# Disallow transient or internal asset queries if needed
Disallow: /api/
Disallow: /draft/

# Sitemaps
Sitemap: ${APP_URL}/sitemap.xml
`;

  const outputPath = path.join(publicDir, 'robots.txt');
  fs.writeFileSync(outputPath, content.trim() + '\n', 'utf-8');
  console.log(`✓ robots.txt generated at ${outputPath}`);
}

/**
 * Generate sitemap.xml
 */
function generateSitemapXml() {
  const currentDate = new Date().toISOString().split('T')[0];

  const urlsXml = ROUTES.map((route) => {
    const loc = route.path === '/' ? `${APP_URL}/` : `${APP_URL}${route.path}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlsXml}
</urlset>`;

  const outputPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(outputPath, content.trim() + '\n', 'utf-8');
  console.log(`✓ sitemap.xml generated at ${outputPath}`);
}

/**
 * Generate site.webmanifest
 */
function generateManifest() {
  const manifest = {
    name: "Traceri — An Editorial Visualization of a Life",
    short_name: "Traceri",
    description: "An interactive digital life archive, editorial magazine, and empirical data archaeology.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0A0B0D",
    theme_color: "#0A0B0D",
    categories: ["lifestyle", "utilities", "entertainment"],
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable"
      },
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };

  const outputPath = path.join(publicDir, 'site.webmanifest');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  console.log(`✓ site.webmanifest generated at ${outputPath}`);
}

/**
 * Generate security.txt
 */
function generateSecurityTxt() {
  const wellKnownDir = path.join(publicDir, '.well-known');
  ensureDir(wellKnownDir);

  const content = `# Security Contact Information for Traceri
Contact: mailto:ankit628792@gmail.com
Preferred-Languages: en
Canonical: ${APP_URL}/.well-known/security.txt
Policy: ${APP_URL}/#security
`;

  const outputPath = path.join(wellKnownDir, 'security.txt');
  fs.writeFileSync(outputPath, content.trim() + '\n', 'utf-8');
  // Also place in public/security.txt for legacy crawlers
  fs.writeFileSync(path.join(publicDir, 'security.txt'), content.trim() + '\n', 'utf-8');
  console.log(`✓ security.txt generated at ${outputPath}`);
}

// Main Execution
ensureDir(publicDir);
console.log(`🚀 Generating SEO assets for APP_URL: ${APP_URL}`);
generateRobotsTxt();
generateSitemapXml();
generateManifest();
generateSecurityTxt();
console.log('✨ All SEO assets created successfully.');
