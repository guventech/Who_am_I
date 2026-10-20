# Who Am I? — Build Report

## Phase 0 — Scaffold

**Status:** done

### Built
- Next.js App Router + TypeScript strict + Tailwind + pnpm
- Zod env schema (`ALLOW_UNCALIBRATED`, `ALLOW_DRAFT_CONTENT`)
- Feature flags: `ENABLE_COLOURS`, `ENABLE_FREE_TEXT`, `ENABLE_LLM_REWORD` all `false`
- English placeholder home (Appendix A promise copy)
- Vitest smoke tests, Playwright home e2e, `pnpm sim` stub
- `.gitattributes` (LF), `.cursor/rules/who-am-i.mdc`

### Decisions beyond the brief
- **English only** — skipped Dutch / `next-intl` per owner request; NL deferred.
- Package name `who-am-i` (directory name `Who_am_I` is not a valid npm name).
- Home Start button disabled until Phase 2 test flow.
- `robots: noindex` from day one (uncalibrated product).
- Product briefs (`WHO_AM_I_*.md`) gitignored and excluded from the public GitHub history.

### Open / deferred
- Item bank, engine, model file → Phase 1
- Prototype calibration banner → Phase 2 (needs `bankStatus`)
- NL locale → deferred indefinitely unless reopened

### Still to verify (human)
- See brief §14
