# The Ink Home — Architecture Overview

This document provides a concise architecture diagram and a short summary of the technologies used by the project (frontend → hosting/infra).

## Concise architecture diagram

Client (browser)
  ├─ React + TypeScript SPA (Vite build)
  │   ├─ React 19, React Router
  │   ├─ UI components (pages/, components/)
  │   ├─ Animations: GSAP
  │   └─ Canvas/WebGL: Pixi.js (where used)
  ├─ Tailwind CSS (via CDN) + index.css
  └─ Contact form (client-side)
        └─ POSTS → FormSubmit.co AJAX endpoint

Build / CI
  ├─ Vite (dev server & build)
  └─ GitHub Actions (on push to `The-Ink-Home`) → builds `dist/` and deploys to `gh-pages` using peaceiris/actions-gh-pages

Hosting & CDN
  └─ GitHub Pages (served from `gh-pages` branch)

Environment & Secrets
  ├─ Build-time env: `GEMINI_API_KEY` injected via `vite.config.ts` (from `.env.local` or CI secrets)
  └─ FormSubmit email forwarding: one-time activation required for `farhankabir236@gmail.com`

Notes & rationale
- This is a static-site architecture: the app is built into static assets (`dist/`) and served by GitHub Pages. There is no server process in the repository.
- The contact form uses a third-party forwarding service (FormSubmit) to avoid running a backend; consider a serverless function + email provider for more control.

Quick file references
- `package.json` — dependencies and scripts (React, Vite, GSAP, Pixi)
- `vite.config.ts` — base path, env injection, aliases
- `index.html` — import map, Tailwind CDN, fonts, favicon
- `pages/ContactPage.tsx` — client form that posts to FormSubmit
- `.github/workflows/deploy.yml` — CI pipeline that builds and deploys to GitHub Pages

Recommended next steps (optional)
- Add a serverless function (Vercel/Netlify) to send email via SendGrid/Mailgun if you want no external activation step and better deliverability.
- Add analytics/error-tracking and submission logging for observability.
