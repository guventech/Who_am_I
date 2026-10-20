# Who Am I? — Build Report

## Standing decisions (compaction-safe)

These override older chat history and Spec v1.0 if they conflict:

| Decision | Value |
|---|---|
| Language | **English only** — no Dutch, no `next-intl`, no language switch |
| Authority | `WHO_AM_I_CURSOR_BRIEF.md` wins over `WHO_AM_I_SPEC.md` |
| Phase status | 0–2 done; next = 3 insights on `continue` |
| Selector default | Fixed 10 until real data justifies adaptive |
| Briefs on GitHub | `WHO_AM_I_*.md` gitignored (local only) |

Also mirrored in [`.cursor/rules/who-am-i.mdc`](.cursor/rules/who-am-i.mdc) (`alwaysApply`).

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
- **English only** — written into brief v1.2; no Dutch / `next-intl`.
- Package name `who-am-i` (directory name `Who_am_I` is not a valid npm name).
- Home Start button disabled until Phase 2 test flow.
- `robots: noindex` from day one (uncalibrated product).
- Product briefs (`WHO_AM_I_*.md`) gitignored and excluded from the public GitHub history.

### Open / deferred
- Prototype calibration banner → Phase 2 (needs `bankStatus`)

### Still to verify (human)
- See brief §14

## Phase 1 — Engine + simulation

**Status:** done

### Built
- Pure TS engine: GRM, 11-node GH grid EAP, bands/levels, quality flags
- Dev bank (50 IPIP + 10 candidate cross-loaders + 6 H-H placeholders), EN text, `model-v0-dev.json`
- `FixedSelector` + `AdaptiveSelector` + `pnpm build-fixed-form`
- `pnpm sim` → `sim-report.md` (SYNTHETIC), coverage gate 63–73%
- Engine unit tests (23)

### Simulation snapshot (N=40, SYNTHETIC, seed=42)
- Mean r: adaptive 0.681, fixed 0.695, naive 0.664
- **Adaptive − fixed Δr = −0.0135** (not tuned to make adaptive win)
- Credible coverage (fixed): 65.5% (pass)
- Retake multiplier for ~68% coverage: 1.20 (config 1.41 — needs real retest data)

### Decisions
- EN-only content parity (no `nl.json`); active items require EN text + hashes only
- Default `SIM_N=40` for runtime (~1.5 min); override with env `SIM_N`
- Physicist's GH nodes transformed with √2 / √π for N(0,1)
- All 50 IPIP items remain `sourceVerified: false` (not checked against ipip.ori.org this phase)

### Open
- Calibrated parameters, norms, `RETAKE_BAND_MULTIPLIER` from human studies (§14)
- Unclear rate ~47% at 10 items with DEV params — tune `UNCLEAR_WIDTH` after calibration

## Phase 2 — Core UI

**Status:** done

### Built
- Home (Start + How accurate link), Test (Likert 1–5, progress, Back, keyboard 1–5), Result (`TraitSlider` SVG with hatched retake band), How accurate page
- `PrototypeBanner` when `bankStatus === "dev-uncalibrated"`
- Client session store (`sessionStorage`) + fixed-form runner; scores via engine `scoreSession` in-browser
- `accuracySentenceFromClaims` — empty `ACCURACY_CLAIMS` ⇒ no accuracy numbers in UI
- E2E: full 10-q flow, Back, keyboard, axe (home + how-accurate) with `@axe-core/playwright`

### Decisions
- Session state in `sessionStorage` (no network); consent/storage deferred to Phase 4
- Go deeper / Copy insights / Feedback / Delete omitted or “coming later” until later phases
- Trait level blurb is short pole text only; insight trade-off sentences wait for Phase 3 content
- Start is a button that seeds a fresh session before navigation (not a bare link)

### Open
- Insights blocks (Phase 3)
- Consent + Convex storage (Phase 4)
- Axe on result after answering still optional (home/how-accurate covered; result has dynamic scores)
