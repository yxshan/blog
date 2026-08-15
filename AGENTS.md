# Repository Guidelines

## Project Structure & Module Organization

Source lives in `src/` and follows an Astro static-site layout:

- `src/pages/*.astro` are the generated routes, including home and `posts/[...slug].astro`.
- `src/layouts/BaseLayout.astro` provides the shared HTML shell and meta tags.
- `src/components/Header.astro` and `Footer.astro` provide navigation chrome.
- `src/components/home/` holds the React search island and static article cards.
- `src/lib/posts.ts` reads the post index and Markdown files at build time.
- `src/lib/markdown.ts` renders Markdown to sanitized static HTML.
- `src/features/` holds reusable React islands and helpers.
- `src/generated/posts-index.json` and `src/generated/search-index.json` are build-time indexes.
- `posts/<category>/NNN-slug/index.md` contains Markdown articles; category and slug drive routing and sorting.
- `scripts/generate-sitemap.ts` generates `sitemap.xml` during the build.
- Astro generates per-post entry pages directly under `dist/posts/<slug>/index.html`.
- `scripts/generate-rss.ts` generates `feed.xml` and `robots.txt`.
- `scripts/generate-search-index.ts` builds the full-text search index.
- `dist/` is generated output and is git-ignored; GitHub Pages deploys it via `.github/workflows/deploy.yml`.

## Build, Test, and Development Commands

```bash
npm install      # install dependencies
npm run dev      # start the Astro dev server at /blog
npm run typecheck # run strict TypeScript checks
npm run validate # validate post frontmatter, paths, and image references
npm run lint     # run ESLint
npm test         # run Vitest unit tests
npm run test:coverage # run tests with coverage thresholds
npm run build    # production build into dist/; also copies index.html to 404.html
npm run security:audit # fail on high/critical dependency vulnerabilities
npm run preview  # serve the production build locally
```

Astro pages are generated at build time; `npm run build` regenerates the post and search indexes before rendering.
Before pushing, run `npm run typecheck`, `npm run validate`, `npm run lint`, `npm run test:coverage`, `npm run build`, `npm run test:e2e`, and `npm run security:audit`.

giscus comments are disabled until `.env` contains `VITE_GISCUS_REPO_ID` and `VITE_GISCUS_CATEGORY_ID`; copy `.env.example` to `.env` and fill in the values from the giscus app.

## Coding Style & Naming Conventions

Use 2-space indentation, double quotes, and semicolons, matching existing JSX. Name components in `PascalCase`, hooks and utility functions in `camelCase`, and feature folders in lowercase. Keep comments concise and scoped to non-obvious logic. ESLint and Prettier are configured; run `npm run lint` and `npm run format`.

## Testing Guidelines

Unit and DOM regression tests live next to the modules they cover and run with Vitest. Use `npm test` to run them, `npm run validate` to check posts, and `npm run dev` for manual browser checks. Use `draft: true` while a post is incomplete; drafts render locally but are hidden in production.

## Commit & Pull Request Guidelines

Use the lowercase conventional prefixes found in Git history: `feat:` for features, `fix:` for bug fixes, `posts:` for article content, and `docs:` or `chore:` for documentation and maintenance. Keep subject lines short and imperative, for example `fix: use AND logic for multi-tag filtering`.

Open pull requests against `main` with a description of the change and how it was verified, and include screenshots for UI changes. CI runs validation, lint, tests, and the production build. Do not commit `dist/` output; the GitHub Actions workflow builds and deploys automatically.

## Adding Content

Create a new article at `posts/<category>/NNN-slug/index.md` with YAML frontmatter containing at least `title`, `date`, and `tags`. `difficulty` accepts `简单 / 中等 / 困难` or `easy / medium / hard`. Use UTF-8, and reference images stored in the article folder with relative paths.
