# Who Am I? — Build Report

## Standing decisions (compaction-safe)

These override older chat history and Spec v1.0 if they conflict:

| Decision | Value |
|---|---|
| Language | **English only** — no Dutch, no `next-intl`, no language switch |
| Authority | `WHO_AM_I_CURSOR_BRIEF.md` wins over `WHO_AM_I_SPEC.md` |
| Phase status | 0–6 done (MVP build complete); next = human §14 / explicit new scope |
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
- Unclear rate was ~48% at 10 items with DEV params; `UNCLEAR_WIDTH` loosened to 1.35 for the uncalibrated bank (revisit after calibration)

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
- Consent + Convex storage (Phase 4)
- Axe on result after answering still optional (home/how-accurate covered; result has dynamic scores)

## Phase 3 — Insights

**Status:** done

### Built
- Insight schema (Zod) + EN draft library: 15 trait keys × firm/soft, 5 combos × firm/soft, fallback mid (41 YAML files + `en.bundle.json`)
- `selectInsights` (§9.3): top-3 confident traits, combos, caps 3/3/3, soft marker, zero-confident fallback
- `filterInsightLibrary` excludes drafts unless `ALLOW_DRAFT_CONTENT`
- Result UI: `InsightBlocks`, trade-off on sliders, **Copy my insights as text**
- `pnpm content:report` lists all drafts; `pnpm generate-insight-drafts` regenerates
- §9.4 + content + format-copy unit tests

### Decisions
- Draft copy generated from structured templates (still `reviewStatus: "draft"`) — human review required (§14)
- LLM reword button remains hidden (`ENABLE_LLM_REWORD=false`)
- Browser loads `en.bundle.json`; YAML under `content/insights/en/` is source of truth for the report script

### Open
- All 41 entries still draft (0 reviewed)
- Content quality / HR review (§14)

## Phase 4 — Consent, storage, feedback

**Status:** done

### Built
- `ConsentBox` on home (store opt-in + age 16+ + optional retake-later); default client-only
- `StorageAdapter`: `NoopAdapter`, `HttpStorageAdapter` (client post-consent), `MemoryAdapter` (server/local), `ConvexAdapter` stub for Convex client
- API routes `/api/storage/{complete,delete,feedback,retention}` with server re-score + coarse rate limit (no IPs)
- Session code (hash stored); shown once on result after consented save
- Feedback page (fit + too high/right/low); Privacy draft page + delete-by-code
- Convex schema + sessions/retention/crons under `convex/` (excluded from app `tsc` until `npx convex dev`)
- E2E: consent-off ⇒ zero `/api/storage` calls; consent-on ⇒ one `/complete` + delete works

### Decisions
- Until `CONVEX_URL` is configured, server uses in-memory store so local/e2e work offline from Convex cloud
- Client never talks to Convex directly — only same-origin `/api/storage` after consent
- EU region confirmation remains a human ops task (§14)

### Open
- Run `npx convex dev` and confirm EU region before production
- Wire `ConvexAdapter` into `getServerStorage()` when URL is set
- Legal review of privacy draft

## Phase 5 — Go deeper

**Status:** done

### Built
- 6-trait model `model-v0-dev-deeper.json` (Big Five + Honesty-Humility) — does not mutate the 5-trait core model
- HH01–HH06 deeper-pool IPIP-HEXACO Honesty-Humility items (`sourceVerified: true`); H01–H06 placeholders retired
- Engine generalized to dim = `traits.length` (grid, GRM loadings, A-optimal gain)
- `runDeeperRound` / `/deeper` UI: adaptive selection, budget ≤ 20, stop on SD target
- Production: round off unless `ENABLE_GO_DEEPER` / `NEXT_PUBLIC_ENABLE_GO_DEEPER` **and** verified active H-H items; dev/test on by default
- Sim section + unit tests: SD target within budget; core scores unchanged when deeper skipped
- Storage re-score resolves core vs deeper model by `modelVersionId`; max responses 30

### Decisions
- 6D grid uses **7** GH nodes/dim (~118k points) so browser/sim stay feasible; core stays at 11
- DEV `DEEPER_SD_TARGET` on the deeper model is **0.65** — brief’s 0.35 is not reachable with |a|=1.2 placeholders within 20 items; restore 0.35 after calibration
- H–Big Five prior correlations are DEV PLACEHOLDERS (modest; H–A 0.25)
- Insights still use Big Five only (no H insight entries in v1)

### Simulation snapshot (SYNTHETIC)
- Deeper N=8 (example run): **100%** hit DEV SD target; mean deeper items ≈ 11.25
- Core unchanged when skipped: 8/8

### Open
- Licensed Honesty-Humility item set (§14) before production enable
- Recalibrate `DEEPER_SD_TARGET` to 0.35 after real parameters
- Optional: H-trait insight entries (out of current v1 insight scope)

## Phase 6 — Hardening and deploy

**Status:** done

### Built
- Security headers on all routes: CSP, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy (`next.config.ts`)
- App `error.tsx` + `global-error.tsx`
- `robots` metadata tied to `bankStatus` (noindex while uncalibrated)
- Server **rejects** `/api/storage/complete` without `consentStore` + `ageConfirmed` (403)
- Rate limit: opaque `x-rate-bucket` per browser (no IPs); shared fallback tighter; applies to complete/delete/feedback
- README Vercel preview checklist (incl. Lighthouse a11y ≥ 95) + preview URL log table
- Unit tests for consent gate + rate-limit bucketing

### Decisions
- CSP allows `'unsafe-inline'` / `'unsafe-eval'` for Next/Turbopack; tighten further only after a production CSP audit
- Per-client rate keys live in `sessionStorage` (not accounts); rotating the key resets quota (acceptable without IP storage)
- Lighthouse ≥ 95 is a **preview checklist** item — not automated in CI this phase

### Final open items (carry to human §14 / ops)
- Calibration pilot + replace `bankStatus` / item parameters
- Licensed H-H items; then Production `ENABLE_GO_DEEPER`
- Privacy notice legal review; DPA; Convex/Vercel EU confirmation
- Insight content review (all still `draft`)
- Accuracy copy comprehension test
- Run README preview checklist and fill the Preview URL log
- Optional later: colours, LLM reword, local compare-with-last-time, remaining combos (v1.1)
