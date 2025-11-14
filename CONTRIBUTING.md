# Contributing Guide

Thanks for wanting to improve the Russian Roulette Shot Game! Follow the checklist below to keep the repo tidy and reviews fast.

## 1. Issues & Planning
- Search existing issues before opening a new one; comment if you can extend an existing thread.
- Include screenshots/video for UI requests and reference relevant docs under `docs/`.

## 2. Branching & Commits
- Branch naming: `feature/<ticket-id>-short-desc`, `fix/...`, `docs/...` etc.
- Keep commits scoped; follow Conventional Commits (e.g., `feat: add lobby QR state`).
- Rebase onto `main` before creating a PR when possible.

## 3. Development Workflow
```bash
npm install
npm run dev     # local server with hot reload
npm run build   # ensure builds succeed before push
```

## 4. Pull Request Checklist
- [ ] Linked issue or clearly stated purpose
- [ ] Updated screenshots / docs if UI changed
- [ ] Added/updated tests (when they exist)
- [ ] `npm run build` passes locally
- [ ] No lint warnings (once linting is added)

## 5. Code Style
- Follow `.editorconfig` for formatting.
- Use semantic HTML for accessibility, keep contrast ratios AA+.
- Prefer descriptive naming in JS state/actions.

## 6. Docs & Changelog
- Document major user-facing changes in `CHANGELOG.md`.
- Reference research documents via relative links when relevant.

Thanks again! 🎉
