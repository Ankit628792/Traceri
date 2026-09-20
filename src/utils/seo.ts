import { APP_INFO, DEVELOPER_INFO, ROUTE_METADATA } from '../data/common';

export interface DynamicSEOOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string[];
}

/**
 * Helper to update or create a <meta> tag in the document head
 */
function setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string) {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create a <link> tag in the document head
 */
function setLinkTag(rel: string, href: string) {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Updates Schema.org JSON-LD structured data in the document head
 */
function setStructuredData(data: object) {
  if (typeof document === 'undefined') return;

  const scriptId = 'traceri-schema-structured-data';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

/**
 * Dynamically manages and synchronizes all SEO, OpenGraph, Twitter, canonical, and Schema.org metadata
 */
export function updateRouteSEO(options: DynamicSEOOptions = {}) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const currentPath = options.path || window.location.pathname || '/';
  const routeMeta = ROUTE_METADATA[currentPath] || ROUTE_METADATA['/'];

  // Base Host URL resolution (prefer APP_INFO.appUrl, fallback to current origin)
  const baseUrl = APP_INFO.appUrl.replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}${currentPath === '/' ? '' : currentPath}`;
  const socialImageUrl = options.image || `${baseUrl}/logo.svg`;

  // Dynamic Title & Description
  const baseTitle = `${APP_INFO.displayName} — ${APP_INFO.headline}`;
  const pageTitle = options.title
    ? `${options.title} · ${APP_INFO.displayName}`
    : currentPath === '/'
    ? baseTitle
    : `${routeMeta.title} | ${APP_INFO.displayName}`;

  const description = options.description || routeMeta.description || APP_INFO.description;
  const keywordsList = (options.keywords || APP_INFO.keywords).join(', ');

  // 1. Update Document Title
  document.title = pageTitle;

  // 2. Standard Meta Tags
  setMetaTag('name', 'description', description);
  setMetaTag('name', 'keywords', keywordsList);
  setMetaTag('name', 'author', DEVELOPER_INFO.name);
  setMetaTag('name', 'application-name', APP_INFO.displayName);
  setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  setMetaTag('name', 'theme-color', '#0A0B0D');

  // 3. Canonical Link
  setLinkTag('canonical', canonicalUrl);

  // 4. OpenGraph Tags
  setMetaTag('property', 'og:site_name', APP_INFO.displayName);
  setMetaTag('property', 'og:title', pageTitle);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:type', options.type || 'website');
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:image', socialImageUrl);
  setMetaTag('property', 'og:image:alt', `${APP_INFO.displayName} — Digital Life Archive`);
  setMetaTag('property', 'og:locale', 'en_US');

  // 5. Twitter / X Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', pageTitle);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', socialImageUrl);
  setMetaTag('name', 'twitter:creator', `@${DEVELOPER_INFO.handle}`);

  // 6. Schema.org JSON-LD Structured Data
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        'url': baseUrl,
        'name': APP_INFO.displayName,
        'alternateName': APP_INFO.name,
        'description': APP_INFO.description,
        'publisher': {
          '@type': 'Person',
          'name': DEVELOPER_INFO.name,
          'url': DEVELOPER_INFO.linkedin.url,
        },
      },
      {
        '@type': 'WebApplication',
        '@id': `${baseUrl}/#webapp`,
        'name': APP_INFO.displayName,
        'url': canonicalUrl,
        'applicationCategory': 'MultimediaApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires modern browser with WebGL & ECMAScript 6 support',
        'description': description,
        'creator': {
          '@type': 'Person',
          'name': DEVELOPER_INFO.name,
          'sameAs': [DEVELOPER_INFO.instagram.url, DEVELOPER_INFO.linkedin.url],
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}/#breadcrumbs`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Archive',
            'item': baseUrl,
          },
          ...(currentPath !== '/'
            ? [
                {
                  '@type': 'ListItem',
                  'position': 2,
                  'name': routeMeta.label,
                  'item': canonicalUrl,
                },
              ]
            : []),
        ],
      },
    ],
  };

  setStructuredData(structuredData);
}
