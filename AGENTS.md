# Repository Guidelines

## Project Structure & Module Organization

Source lives in `src/` and is organized by feature:

- `src/features/` holds domain modules for posts, theme, tags, and search.
- `src/pages/`, `src/layouts/`, and `src/shared/` hold route pages, layout, and reusable components.
- `posts/<category>/NNN-slug/index.md` contains Markdown articles; category and slug drive routing and sorting.
- `scripts/generate-sitemap.mjs` generates `sitemap.xml` during the build.
- `dist/` is generated output and is git-ignored; GitHub Pages deploys it via `.github/workflows/deploy.yml`.

## Build, Test, and Development Commands

```bash
npm install      # install dependencies
npm run dev      # start the Vite dev server at /blog/
npm run build    # production build into dist/; also copies index.html to 404.html
npm run preview  # serve the production build locally
```

No test or lint script is configured. Verify changes with a successful build plus manual browser checks.

## Coding Style & Naming Conventions

Use 2-space indentation, double quotes, and semicolons, matching existing JSX. Name components in `PascalCase`, hooks and utility functions in `camelCase`, and feature folders in lowercase. Keep comments concise and scoped to non-obvious logic. No linter or formatter is installed, so follow the surrounding code.

## Testing Guidelines

No test framework is configured. Before pushing, run `npm run build` and check article additions locally with `npm run dev`. Use `draft: true` while a post is incomplete; drafts render locally but are hidden in production.

## Commit & Pull Request Guidelines

Use the lowercase conventional prefixes found in Git history: `feat:` for features, `fix:` for bug fixes, `posts:` for article content, and `docs:` or `chore:` for documentation and maintenance. Keep subject lines short and imperative, for example `fix: use AND logic for multi-tag filtering`.

Open pull requests against `main` with a description of the change and how it was verified, and include screenshots for UI changes. Do not commit `dist/` output; the GitHub Actions workflow builds and deploys automatically.

## Adding Content

Create a new article at `posts/<category>/NNN-slug/index.md` with YAML frontmatter containing at least `title`, `date`, and `tags`. Use UTF-8, and reference images stored in the article folder with relative paths.
