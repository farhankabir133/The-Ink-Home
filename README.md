<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ulBXt4xfMdWKg32Ut_YZcyaCFoUqsXss

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Medium Feed Cache

- The site now reads Medium stories from `public/data/medium-feed.json` first for reliability.
- Refresh cache locally anytime with:
   `npm run update:medium-cache`
- Automated refresh runs via GitHub Actions every 6 hours:
   `.github/workflows/refresh-medium-feed.yml`

## Ultra-modern Trend Layer

- Adaptive theming now supports: `Auto`, `Light`, `Dark`, and `Ink` (sepia editorial).
- Theme preference is persisted locally and auto mode follows system appearance.
- Home page includes live insight chips and a smart “Continue Reading” rail based on tag affinity.

## Performance Budget Governance

- Check budgets locally with:
   `npm run check:performance-budgets`
- CI guard command:
   `npm run ci:verify`
- Current enforced budgets:
   - Initial JS gzip: `< 80kB`
   - Mobile LCP image candidate: `< 180kB`
