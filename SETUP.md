# Setup & Installation Guide

This guide walks you through setting up, running, building, and deploying **Traceri** locally or to cloud hosting providers.

---

## Prerequisites

Before starting, ensure you have the following installed on your workstation:

- **Node.js**: Version 18.18.0 or higher (Node 20+ LTS recommended)
- **Package Manager**: `npm` (included with Node.js), `bun`, or `pnpm`
- **Git**: For cloning the repository

---

## 1. Clone the Repository

Clone the project from GitHub to your local machine:

```bash
git clone https://github.com/Ankit628792/Traceri.git
cd Traceri
```

---

## 2. Install Dependencies

Install all required project dependencies:

```bash
npm install
```

*(Alternatively, if you prefer Bun or pnpm)*:
```bash
bun install
# or
pnpm install
```

---

## 3. Configure Environment Variables

Traceri includes a `.env.example` template documenting required public parameters:

```bash
cp .env.example .env
```

Default configuration in `.env`:

```env
# Canonical public URL where this app is hosted
APP_URL=https://traceri.vercel.app
VITE_APP_URL=https://traceri.vercel.app
```

> **Note**: For local development, `VITE_APP_URL` defaults automatically to `http://localhost:3000` or the current host if left empty.

---

## 4. Run Development Server

Start the Vite development server:

```bash
npm run dev
```

The application will be accessible at:
```
http://localhost:3000
```

The dev server features fast module reloading and clean path routing.

---

## 5. Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Boots the local development server at port `3000`. |
| `npm run build` | Generates SEO files (`robots.txt`, `sitemap.xml`, `site.webmanifest`), compiles production assets with Vite into `dist/`, and generates `dist/404.html`. |
| `npm run generate:seo` | Regenerates `public/robots.txt`, `public/sitemap.xml`, and manifests using the configured app URL. |
| `npm run preview` | Serves the production build locally from `dist/` for pre-flight testing. |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) to ensure type integrity. |
| `npm run clean` | Cleans up the `dist/` compilation artifacts. |

---

## 6. Production Deployment

### Option A: Vercel (Recommended)

Traceri is pre-configured for direct Vercel deployment with the included `vercel.json` rewrite file:

1. Push your repository to GitHub: `https://github.com/Ankit628792/Traceri`.
2. Connect the repository in the [Vercel Dashboard](https://vercel.com/new).
3. Set the build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set the Environment Variable:
   - `APP_URL`: `https://traceri.vercel.app`
   - `VITE_APP_URL`: `https://traceri.vercel.app`
5. Click **Deploy**. Vercel will automatically handle all deep route rewrites through `vercel.json`.

### Option B: Cloudflare Pages / Netlify / GitHub Pages

For static hosting providers:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- The build process automatically creates `dist/404.html`, guaranteeing that direct hits to deep routes (e.g., `/threads`, `/calendar`) fallback cleanly to the Single Page Application.

---

## 7. Troubleshooting

- **Direct Route Refresh Shows 404**:
  Ensure your host has SPA fallback rewrites configured. For Vercel, this is handled automatically via `vercel.json`. On standard Nginx or Apache servers, ensure fallback rewrite to `/index.html` is enabled.
- **Port Conflicts**:
  If port `3000` is in use, modify the port in `vite.config.ts` or run `npm run dev -- --port 3001`.
