# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server at http://localhost:4321 (runs with --host)
npm run build      # astro check (type-checks .astro/.ts) + astro build → dist/
npm run preview    # serve dist/ locally
npm run update-videos  # refresh src/data/videos.json from YouTube RSS (prints CHANGED/UNCHANGED)
```

There is no test suite or separate linter; `astro check` inside `npm run build` is the verification step. Node ≥ 22.12.0 (pinned via `engines`).

## What this is

Personal portfolio site (Samet Akın): Astro 6 static site with React 19 islands, Tailwind CSS 4, MDX, Three.js, GSAP + ScrollTrigger, Lenis. Deployed on Cloudflare Pages (build command `npm run build`, output `dist/`). Some code comments are in Turkish.

**The homepage is one big React island** ([src/components/home/HomeExperience.tsx](src/components/home/HomeExperience.tsx), `client:load`): GSAP/Lenis/Three coordination lives in that single root — a fullscreen fbm-shader background ([LiquidBackground.tsx](src/components/home/LiquidBackground.tsx)), a spiral particle galaxy behind the hero title that scatters on scroll ([GalaxyObject.tsx](src/components/home/GalaxyObject.tsx)), custom cursor, pinned hero, horizontal-scroll tutorials, and a marquee finale. All animation shares one RAF via `gsap.ticker`. Pins run only on `(min-width: 768px) and (prefers-reduced-motion: no-preference)`; reduced-motion gets a static fallback and no Lenis. Inner pages (/videos, /writing, /experience, /contact) stay plain Astro and only inherit the color/font system. The homepage passes `hideFooter` to Layout — its contact section replaces the footer.

## Architecture

**Everything is rendered at build time.** There is no server runtime, and builds make no network requests.

**YouTube pipeline:** video data lives in [src/data/videos.json](src/data/videos.json), a committed archive. [scripts/update-videos.mjs](scripts/update-videos.mjs) (`npm run update-videos`) pulls the channel + playlist RSS feeds and merges them in — new videos are added, existing entries are never deleted (RSS only carries the latest ~15), deduped by id, sorted by publish date descending. It prints `CHANGED`/`UNCHANGED` to stdout; on feed failure it leaves that section untouched and still exits 0. `.github/workflows/weekly-update.yml` runs it every Monday 03:00 UTC and commits `videos.json` when changed, or pushes an empty keepalive commit when not (resets GitHub's 60-day scheduled-workflow auto-disable timer). The push itself triggers the Pages build — there is no deploy hook. [src/lib/youtube.ts](src/lib/youtube.ts) is just synchronous getters over the JSON (`getPlaylistData`, `getChannelVideos`), consumed by [Tutorials.astro](src/components/home/Tutorials.astro) and [videos.astro](src/pages/videos.astro). Thumbnail URLs are derived client-side in [YouTubeThumbnail.tsx](src/components/ui/YouTubeThumbnail.tsx), which probes maxres → sd → hq and detects YouTube's 120×90 gray placeholder.

**Content lives in three places:**
- `src/content/blog/*.md` — blog posts, schema in [src/content.config.ts](src/content.config.ts) (zod: title, description, pubDate, optional readingTime, tags, draft). Filename = slug = URL `/writing/<slug>`. `draft: true` renders with a "draft" badge (it does not hide the post).
- `src/data/*.ts` — typed site data edited by hand: `projects.ts` (featured work cards), `playlists.ts` (which YouTube playlists to show; `accent` picks the card color; `manualVideoCount: null` uses the RSS count capped at 15), `currently.ts` (the "now" strip; flip `active` to switch between option A/B headlines).
- Inline in pages — the experience timeline is the `experiences` array at the top of [src/pages/experience.astro](src/pages/experience.astro); order in the array = order on the page.

**Components:** `.astro` files are static; `.tsx` files are React islands used only where interactivity is needed (`ThemeToggle`, `MobileMenu`, `YouTubeThumbnail` client-side fallback, `HeroObject` three.js hero). [Layout.astro](src/components/layout/Layout.astro) wraps every page (meta tags, navbar, footer).

## Theming

Tailwind 4 with a legacy config bridge: `global.css` does `@config "../../tailwind.config.mjs"`. Colors are never hardcoded in components — [tailwind.config.mjs](tailwind.config.mjs) maps utility names (`bg-base`, `ink-primary`, `line-hair`, `accent`, `warm`, `mint`, …) to CSS variables defined twice in [src/styles/global.css](src/styles/global.css): `:root` (light) and `.dark` (dark, class-based toggle). To adjust colors, edit the CSS variables, not the components. Three accent hues are used across cards: `accent` (purple), `warm` (coral), `mint` (teal). A global rule lowercases all h1–h3 headings.

## Deploy notes

Push to `main` → Pages rebuilds automatically (~1–2 min); the weekly workflow's commits ride the same path. `site` in [astro.config.mjs](astro.config.mjs) is the `.pages.dev` URL and must be updated if a custom domain is bound. CV PDF goes in `public/assets/cv/samet-akin-cv.pdf`; an og:image can be dropped in `public/assets/og/default.png` (then uncomment the meta in Layout.astro).
