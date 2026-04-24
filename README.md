# Samet Akın — Portfolio

Personal portfolio site. Astro + React + Tailwind CSS + Framer Motion + MDX, deployed on Cloudflare Pages.

## Getting started

```bash
npm install
npm run dev
```

The site serves at `http://localhost:4321`.

Production build:

```bash
npm run build      # runs astro check + astro build → dist/
npm run preview    # serves dist/ locally to eyeball the output
```

## Project structure

```
src/
  components/
    ui/          buttons, theme toggle, mobile menu, YouTubeThumbnail (react)
    home/        hero, currently strip, featured work, tutorials, writing
    layout/      navbar, footer, layout wrapper
  content/
    blog/        markdown posts
  data/          projects.ts, currently.ts, playlists.ts
  lib/           youtube.ts, cn.ts
  pages/         index, experience, contact, videos, writing
  styles/        global.css
public/
  favicon.svg    "SA" monogram on dark background
  assets/
    cv/          drop samet-akin-cv.pdf here
    og/          drop default.png here (then uncomment the og:image meta in Layout.astro)
```

## Updating content

### Add a new blog post

Create a new markdown file in `src/content/blog/<slug>.md`:

```md
---
title: "Post title"
description: "One-line summary that shows on the index and meta tags."
pubDate: 2026-05-01
readingTime: "~8 min read"
tags: ["rag", "llm"]
draft: false
---

Post body…
```

- `draft: true` renders the post with a "draft" badge.
- The slug (filename without extension) becomes the URL: `/writing/<slug>`.
- The writing index at `/writing` lists posts sorted by `pubDate` descending.
- To also surface a post on the home page, add an entry to the `drafts` array in `src/components/home/Writing.astro` and set `href: '/writing/<slug>'`.

Pushing the file to `main` triggers a Cloudflare Pages rebuild automatically — the post is live in ~1–2 minutes.

### Surface new YouTube videos

YouTube playlist feeds are read at **build time**, so new videos only appear after a rebuild. Two ways:

1. **Automatic daily rebuild** (preferred). `.github/workflows/daily-rebuild.yml` runs every day at 03:00 UTC. It posts to a Cloudflare Pages deploy hook URL kept in the `CLOUDFLARE_DEPLOY_HOOK` GitHub secret. Setup steps are listed in the deploy section below.
2. **Manual trigger.** Go to the repo → Actions → *Daily Rebuild* → *Run workflow*. Or `curl -X POST <deploy-hook-url>` from anywhere.

To change which playlists show up, edit `src/data/playlists.ts`:

```ts
export const tutorialPlaylists: TutorialPlaylist[] = [
  { id: 'PLxxx', title: '…', description: '…', accent: 'accent', manualVideoCount: null },
  // accent: 'accent' (purple), 'warm' (coral), or 'mint' (teal)
];
```

`manualVideoCount: null` uses the RSS count (capped at 15). Set a number to hard-code.

### Update the experience timeline

Edit the `experiences` array at the top of `src/pages/experience.astro`. Each entry:

```ts
{
  start: 'Month YYYY',
  end: 'Month YYYY' | 'Present',
  role: 'Role title',
  org: 'Organization · sub-label',
  bullets: ['…', '…'],
}
```

Order in the file = order on the page (top is most prominent).

### Add or remove a featured project

Edit `src/data/projects.ts`:

```ts
{
  id: 'my-project',
  title: 'Project title',
  summary: 'One-sentence description.',
  accent: 'accent' | 'warm' | 'mint',
}
```

Six cards fit the grid best.

### Update the "now" strip

Edit `src/data/currently.ts`:

```ts
export const currently = {
  active: true,             // true → Option A renders, false → Option B
  optionA: 'producing video tutorials,',
  optionAEmphasis: 'designing AI systems',
  optionB: 'working on',
  optionBEmphasis: '[update me]',
};
```

Flip `active` when the headline changes.

### Replace the CV PDF

Drop a new `samet-akin-cv.pdf` in `public/assets/cv/`. The *download my CV* link on `/experience` picks it up.

## Deploy

The project deploys to Cloudflare Pages. Build command is `npm run build`, output directory is `dist`, Node version is pinned by the `engines` field (≥ 22.12.0).

### First-time deploy

1. Push the repo to GitHub.
2. In Cloudflare Pages, *Create application* → *Pages* → *Connect to Git* → pick the repo.
3. Framework preset: **Astro**. Build command: `npm run build`. Build output: `dist`. Save and deploy.
4. After the first deploy, in *Settings* → *Builds & deployments* → *Deploy hooks*, create a hook named `scheduled-daily` on branch `main`. Copy the URL.
5. On GitHub, *Settings* → *Secrets and variables* → *Actions* → *New repository secret*: name `CLOUDFLARE_DEPLOY_HOOK`, value = the URL from step 4.
6. The daily rebuild workflow will pick it up on the next UTC 03:00 tick. You can test it immediately with *Actions* → *Daily Rebuild* → *Run workflow*.

### Pre-deploy checklist

- [ ] Drop `public/assets/cv/samet-akin-cv.pdf` so the CV link resolves.
- [ ] (Optional) Drop `public/assets/og/default.png` and uncomment the `og:image` meta in `src/components/layout/Layout.astro`.
- [ ] Update `site` in `astro.config.mjs` if you bind a custom domain.
