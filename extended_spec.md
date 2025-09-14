# Chess Openings Trainer – Extended Project Specification

## Summary
This document extends the base project specification with deployment, dockerization, theme persistence, and more implementation details to feed into an LLM or to guide development.

## Goals
- Provide an interactive web app to study chess openings.
- Support Practice and Popular modes.
- Use existing open data source `eco.json` and helper `chess-tools`.
- Deliver a modern UI with Tailwind and dark mode support.
- Provide a Dockerized production-ready build and docker-compose for easy deployment.

## User Requests (recap)
- Use `react-chessboard`, `chess.js`, `eco.json`, `chess-tools`.
- No custom openings.json file; rely on `eco.json`.
- Add Popular mode with a stepper to step through moves.
- Provide dark mode and persist user's theme preference.
- Deliver full project zip including docker artifacts.

## Implementation Details (additional)
### Theme & Dark Mode
- Tailwind configured with `darkMode: 'class'`.
- Initial theme detection script added to `index.html`:
  - Uses `localStorage.theme` if set.
  - Falls back to `prefers-color-scheme` media query.
- Theme toggle in `App.tsx` stores the user choice in `localStorage` so refresh preserves preference.
- To extend: add an accessible theme toggle component, and support 'system' choice explicitly.

### Docker / Deployment
- Multi-stage Dockerfile:
  - Stage 1: Node image builds the app using `npm run build`.
  - Stage 2: Nginx serves the static `dist` files.
  - SPA routing configured with `try_files $uri $uri/ /index.html`.
- `docker-compose.yml`:
  - Builds the image and exposes port `8080` on the host (maps to nginx port 80 in container).
  - Use `docker compose up --build` to run locally.
- Notes:
  - The Docker build runs `npm ci` and falls back to `npm install` if `npm ci` fails because no package-lock exists.
  - For CI/CD, push the built image to a registry or use Docker buildx if multi-arch support is required.

### Files Added / Modified
- `index.html` — initial theme script added.
- `src/App.tsx` — theme toggle persists to localStorage.
- `Dockerfile` — multi-stage build for production.
- `nginx.conf` — SPA-friendly nginx configuration.
- `docker-compose.yml` — compose file for local deployment.
- `extended_spec.md` — this document.

## Required Features (for LLM fine-tuning)
1. Practice Mode:
   - Legal moves via `chess.js`.
   - Opening matching by prefix against `eco.json` moves (SAN).
   - Suggestions for next moves aggregated from matching openings.
   - Display matched opening name and ECO code.

2. Popular Mode:
   - Sort openings by `popularity` field or fallback heuristic.
   - UI list with paging / virtualized scroll for large lists.
   - Stepper controls to step forward/back through SAN moves of chosen opening.
   - Show progress and move list as the user steps.

3. Persistence:
   - Save user theme preference.
   - Save recent studied openings to `localStorage` (future enhancement).

4. Deployment:
   - Production-ready build via `npm run build`.
   - Docker image that serves static files with nginx.
   - Compose file to run service locally.

## Suggested Enhancements (ranked)
1. Normalize datasets: ensure SAN notation alignment, handle transpositions.
2. Precompute opening trie for fast prefix matching in memory.
3. Add server-side component (optional):
   - Endpoint to fetch openings filtered/sorted by popularity.
   - Endpoint to compute statistics from a large PGN corpus.
4. Add quiz/training modes and progress tracking.
5. Add analytics gathering (anonymous) for popularity refinement.

## Developer Notes / Gotchas
- `eco.json` shape may vary between packages; implement a data normalization layer at startup.
- `chess-tools` API versions differ; include try/catch and fallbacks.
- For large opening datasets, consider lazy-loading or indexing to avoid large bundle sizes. Use code-splitting or fetch data at runtime from a CDN or server.
- Nginx + SPA config prevents 404 on page refresh for client-side routes.

## How to build & run (local)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run dev server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Local Docker:
   ```bash
   docker compose up --build
   # then open http://localhost:8080
   ```

## Deliverables in ZIP
- Full project source (React + Vite + Tailwind)
- Dockerfile, nginx.conf, docker-compose.yml
- extended_spec.md (this file)


## Deployment

### GitHub Pages
- GitHub Actions workflow `.github/workflows/ci.yml` added.
- On push to `main`, the app is built and deployed to GitHub Pages.
- Uses official `actions/deploy-pages`.

### Docker Development Stage
- `Dockerfile` now has a `dev` stage that runs Vite dev server with autoreload:
  - Exposes port 5173.
  - Run with: `docker build --target dev -t chess-dev .` then `docker run -p 5173:5173 chess-dev`.
