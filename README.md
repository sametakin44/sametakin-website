# Samet Akın — Portfolio

Personal portfolio site. Astro + React + Tailwind CSS + Framer Motion + MDX.

## Getting started

```bash
npm install
npm run dev
```

The site serves at `http://localhost:4321`.

## Content

### New post

Add a `.md` file under `src/content/blog/`:

```md
---
title: "Post title"
description: "One-line summary."
pubDate: 2026-05-01
readingTime: "~8 min read"
tags: ["rag", "llm"]
draft: false
---

Post body…
```

Set `draft: true` to render with a "draft" badge.

### CV PDF

Replace `public/assets/cv/samet-akin-cv.pdf`. The /experience page links to it.

### Projects

Edit `src/data/projects.ts`. Each project: `id`, `title`, `summary`, `accent`.

### YouTube tutorial playlists

Edit `src/data/playlists.ts` to change playlist IDs, titles, descriptions, or accents. Video listings are fetched at build time from the RSS feed.

## Structure

```
src/
  components/
    ui/          buttons, theme toggle, mobile menu, thumbnail
    home/        hero, currently, featured work, tutorials, writing
    layout/      navbar, footer, layout wrapper
  content/
    blog/        markdown posts
  data/          projects.ts, currently.ts, playlists.ts
  lib/           youtube.ts, cn.ts
  pages/         index, experience, contact, videos, writing
  styles/        global.css
```

## Automatic content updates

### Blog posts

Push a new file to `src/content/blog/` and Cloudflare Pages rebuilds within 1–2 minutes.

### YouTube videos

YouTube playlist feeds are fetched at build time, so new videos appear only after a rebuild.

1. **Automatic daily rebuild.** `.github/workflows/daily-rebuild.yml` fires the Cloudflare deploy hook every day at 03:00 UTC. To enable:
   - In the Cloudflare Pages dashboard, open this project → *Settings* → *Builds & deployments* → *Deploy hooks* → *Add deploy hook* (e.g. name it `scheduled`, branch `master`).
   - Copy the generated URL.
   - On GitHub, go to the repo → *Settings* → *Secrets and variables* → *Actions* → *New repository secret*: name `CLOUDFLARE_DEPLOY_HOOK`, value = the URL.
   - The workflow will then run daily. You can also trigger it manually from the *Actions* tab (*Daily Rebuild* → *Run workflow*).

2. **Manual instant rebuild.** `curl -X POST <deploy-hook-url>` from anywhere, or run the workflow manually in the GitHub Actions tab.

## Deploy

Cloudflare Pages. Before deploy:

- [ ] Drop `public/assets/cv/samet-akin-cv.pdf` in place.
- [ ] Drop `public/assets/og/default.png` for the OG image.
- [ ] Update `site` in `astro.config.mjs` to the real URL.
- [ ] Create the GitHub repo and push.
- [ ] Connect the repo to Cloudflare Pages and set `CLOUDFLARE_DEPLOY_HOOK` in GitHub secrets (see above).
