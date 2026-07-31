# Repository Guidelines

## Project Structure & Module Organization

Source lives in `src/` and is organized by feature:

- `src/features/` holds domain modules for posts, theme, tags, and search.
- `src/pages/`, `src/layouts/`, and `src/shared/` hold route pages, layout, and reusable components.
- `src/generated/posts-index.json` is the build-time post index consumed by the data layer.
- `posts/<category>/NNN-slug/index.md` contains Markdown articles; category and slug drive routing and sorting.
- `scripts/generate-sitemap.mjs` generates `sitemap.xml` during the build.
- `dist/` is generated output and is git-ignored; GitHub Pages deploys it via `.github/workflows/deploy.yml`.

## Build, Test, and Development Commands

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server at /blog/
npm run validate # validate post frontmatter, paths, and image references
npm run lint     # run ESLint
npm test         # run Vitest unit tests
npm run build    # production build into dist/; also copies index.html to 404.html
npm run preview  # serve the production build locally
```

Before pushing, run `npm run validate`, `npm run lint`, `npm test`, and `npm run build`.

## Coding Style & Naming Conventions

Use 2-space indentation, double quotes, and semicolons, matching existing JSX. Name components in `PascalCase`, hooks and utility functions in `camelCase`, and feature folders in lowercase. Keep comments concise and scoped to non-obvious logic. ESLint and Prettier are configured; run `npm run lint` and `npm run format`.

## Testing Guidelines

Unit tests live next to the modules they cover and run with Vitest. Use `npm test` to run them, `npm run validate` to check posts, and `npm run dev` for manual browser checks. Use `draft: true` while a post is incomplete; drafts render locally but are hidden in production.

## Commit & Pull Request Guidelines

Use the lowercase conventional prefixes found in Git history: `feat:` for features, `fix:` for bug fixes, `posts:` for article content, and `docs:` or `chore:` for documentation and maintenance. Keep subject lines short and imperative, for example `fix: use AND logic for multi-tag filtering`.

Open pull requests against `main` with a description of the change and how it was verified, and include screenshots for UI changes. CI runs validation, lint, tests, and the production build. Do not commit `dist/` output; the GitHub Actions workflow builds and deploys automatically.

## Adding Content

Create a new article at `posts/<category>/NNN-slug/index.md` with YAML frontmatter containing at least `title`, `date`, and `tags`. `difficulty` accepts `简单 / 中等 / 困难` or `easy / medium / hard`. Use UTF-8, and reference images stored in the article folder with relative paths.
