# Who Am I?

Honest 10-question Big Five sketch (**English only**, prototype). Scores are uncalibrated until a human calibration pilot replaces DEV placeholders.

## Commands (PowerShell)

```powershell
pnpm install   # requires pnpm (packageManager pin in package.json; use Corepack)
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm sim
pnpm content:report
```

Storage defaults to **client-only**. With consent (+ age 16+), `/api/storage` uses an in-memory store locally; set Convex env vars after `npx convex dev` (confirm **EU region** — human ops, brief §14).

Progress and standing decisions: [`REPORT.md`](REPORT.md). Product briefs (`WHO_AM_I_*.md`) stay local and are not published.

---

## Vercel preview deployment checklist

Complete before treating a preview URL as a release candidate:

| # | Step | Done |
|---|---|---|
| 1 | Import repo on Vercel; Framework Preset **Next.js**; region prefer **EU** (e.g. `fra1` / `cdg1`) if available | ☐ |
| 2 | Env (Preview): `ALLOW_UNCALIBRATED=true`, `ALLOW_DRAFT_CONTENT=true` (prototype only) | ☐ |
| 3 | Env (Preview): leave `ENABLE_GO_DEEPER` unset/false in Production until licensed H-H items exist | ☐ |
| 4 | Optional Convex: `CONVEX_URL` / `NEXT_PUBLIC_CONVEX_URL` after `npx convex dev` + EU confirmation | ☐ |
| 5 | Deploy Preview from `main`; open the preview URL | ☐ |
| 6 | Smoke: home → 10 questions → result; prototype banner visible; `noindex` in page metadata / response | ☐ |
| 7 | Consent off: DevTools Network shows **zero** `/api/storage` calls | ☐ |
| 8 | Consent on: one `/api/storage/complete`; session code shown; delete via Privacy works | ☐ |
| 9 | Security: response includes `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` | ☐ |
| 10 | **Lighthouse** (mobile): Accessibility score **≥ 95**; fix regressions before promote | ☐ |
| 11 | Go deeper (Preview only): button appears in non-production; placeholders OK — do not enable in Production | ☐ |
| 12 | Record preview URL + date in the deploy notes below when checked | ☐ |

### Preview URL log

| Date | Preview URL | Checked by | Notes |
|---|---|---|---|
| _pending_ | | | First checklist run |

### Production promote (later)

- Do **not** set `ALLOW_UNCALIBRATED` / `ALLOW_DRAFT_CONTENT` unless intentional.
- Keep go-deeper off until licensed Honesty-Humility items replace placeholders.
- Re-run checklist items 6–10 on Production after promote.

---

## Open items (human / post-MVP)

See [`REPORT.md`](REPORT.md) Phase 6 and brief §14: calibration pilot, licensed H-H items, privacy legal review, Convex EU, insight content review, accuracy copy comprehension test.
