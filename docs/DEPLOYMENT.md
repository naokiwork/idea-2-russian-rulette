# Deployment Guide

This project is a static Vite site, so any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.) will work. Below are two recommended workflows.

## GitHub Pages (via GitHub Actions)
1. Ensure CI passes (`npm run lint && npm run test && npm run build`).
2. In the repository settings → *Pages*, choose **GitHub Actions** as the source.
3. Use the default "Deploy static content" workflow or duplicate the existing `.github/workflows/ci.yml` and add a deploy job that uploads the `dist/` folder with `actions/upload-pages-artifact` + `actions/deploy-pages`.
4. When deploying under a subpath (e.g., `/idea-2-russian-rulette/`), set `base: '/idea-2-russian-rulette/'` inside `vite.config.js`.
5. After the workflow runs, your site is live at `https://<user>.github.io/<repo>/`.

## Vercel / Netlify
1. Connect the GitHub repository in the hosting dashboard.
2. Set the build command to `npm run build` and the output directory to `dist`.
3. Add environment variables if needed (currently none required). Vercel automatically creates preview links for each PR.

## Release Tags & Checklist
Before tagging a release (e.g., `v0.2.0`):
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run format`
- [ ] `npm run build`
- [ ] `npm run test:e2e` (or enable real Playwright tests with `RUN_PLAYWRIGHT=true`)
- [ ] Update `CHANGELOG.md` with the planned version entry.
- [ ] Create a GitHub Release with highlights + link to the deployment URL.

## Local Preview of Production Build
```bash
npm run build
npm run preview   # serves dist/ on http://localhost:4173 by default
```
