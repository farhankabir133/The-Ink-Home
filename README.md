# The Ink Home

> A modern, responsive publication website for "The Ink Home" — a Medium-style publication sharing creative essays, reflections, and human stories.

Live demo: https://farhankabir133.github.io/The-Ink-Home/

---

## Overview

This repository contains the frontend source for The Ink Home. It's a static React + TypeScript site built with Vite and deployed to GitHub Pages. The site focuses on a clean reading experience, light/dark mode, and a simple contact flow using FormSubmit (no custom backend required).

Key features
- Responsive article listing and detail pages
- Light / dark theme with persisted preference
- Contact form that forwards messages to an email address via FormSubmit
- GitHub Actions workflow to build and deploy to GitHub Pages
- Small animations and visual polish using GSAP and Pixi.js where appropriate

---

## Technologies used

- React 19 + TypeScript — component-driven UI with type safety.
- Vite — fast dev server and build tool.
- Tailwind CSS (via CDN runtime) — utility-first styling; a small `index.css` provides global styles and font-face rules.
- GSAP and Pixi.js — used for motion and interactive visuals in `components/InkMotionAdvanced.tsx` and other places.
- React Router DOM — client-side routing for pages.
- FormSubmit.co (AJAX) — handles contact form submissions; no server-side email sending in this repo.
- GitHub Pages — hosting for the static `dist/` output.
- GitHub Actions — CI workflow automatically builds and publishes `dist/` to the `gh-pages` branch.

Notes about fonts
- The project includes a `@font-face` in `index.css` configured to load `Marryweather` from `/fonts/Marryweather.woff2`. To make the font work in production, place the font files under `public/fonts/` or update the `@font-face` to point to a hosted URL.

Environment
- `GEMINI_API_KEY` is referenced in `vite.config.ts` for optional features; set it in a local `.env.local` if you plan to enable those integrations.

---

## Components

Major UI components are in the `components/` folder. Notable files:

- `Header.tsx` — top navigation, site title, social icons, theme toggle and mobile menu.
- `Footer.tsx` — subscription CTA, social icons, copyright.
- `ArticleCard.tsx` — compact card used to show article previews in lists.
- `InkRevealSection.tsx`, `InkMotionAdvanced.tsx` — visual/animation helpers used for hero or feature sections.
- `ScrollToTopButton.tsx` — small utility component for long reads.

---

## Pages

Pages are in the `pages/` folder and are routed via React Router.

- `HomePage.tsx` — landing page and recent highlights.
- `ArticlesPage.tsx` — list of articles or publication index.
- `ArticleDetailPage.tsx` — full article view and reading experience.
- `AboutPage.tsx` — information about the publication and editor profile.
- `PublicationPage.tsx` — publication-specific listing or features.
- `MediumPage.tsx` — bridges or lists external Medium content if used.
- `ContactPage.tsx` — contact form (uses FormSubmit for email forwarding).

---

## Backend / Server-side

This project is frontend-only and does not include a custom backend. Backend-related notes:

- Contact form: handled by FormSubmit (https://formsubmit.co) — submissions are forwarded to the configured email address (`farhankabir236@gmail.com`). Activation is required for that email when first used.
- No database, user accounts, or server APIs are included. If you require server-side processing (e.g., saving submissions to a database, richer analytics, or authenticated admin UI), you'll need to add a backend service and update the contact flow accordingly.

---

## How to install and run locally

Prerequisites

- Node.js (recommended 18.x or later)
- npm (comes with Node) or your preferred package manager

Install and run

```bash
# install deps
npm install

# development server (hot reload)
npm run dev

# build for production
npm run build

# preview the production build locally
npm run preview
```

Notes

- If you add the Marryweather font files, put them under `public/fonts/Marryweather.woff2` and `public/fonts/Marryweather.woff` so the build will serve them from `/fonts/` at runtime.
- Add `.env.local` with `GEMINI_API_KEY=your_key_here` if you plan to use any Gemini integrations referenced in `vite.config.ts`.

---

## Deployment

This project is configured to deploy to GitHub Pages. The Vite `base` is set to `/The-Ink-Home/` (see `vite.config.ts`) so assets resolve correctly on GitHub Pages. A GitHub Actions workflow builds and publishes to the `gh-pages` branch automatically on push to `main`.

If you deploy manually:

1. Run `npm run build`.
2. Publish the `dist/` contents to your `gh-pages` branch (or any static host).

---

## Social

- Facebook: https://www.facebook.com/share/1AFXEfsoKK/?mibextid=wwXIfr
- LinkedIn: https://www.linkedin.com/company/the-ink-home/

---

## Credits

Thanks to GitHub Copilot and Google AI Studio for their contributions and assistance in building and documenting this project.

---

## Contributing

If you'd like to contribute, open an issue or submit a PR. Small fixes, accessibility improvements, and content submissions are welcome.

---

## License

This repository does not include a license file. Add one if you plan to share or open-source the project.
