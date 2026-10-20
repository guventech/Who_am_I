# Who Am I?

Honest 10-question Big Five sketch (**English only**, prototype). Scores are uncalibrated until a human calibration pilot replaces DEV placeholders.

## Commands (PowerShell)

```powershell
corepack enable
pnpm install   # packageManager pin in package.json
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm sim
pnpm content:report
```

Storage defaults to **client-only**. With consent (+ age 16+), `/api/storage` uses an in-memory store in development/test. In **production**, storage is off unless all of `CONVEX_URL`, `CONVEX_SERVER_KEY`, and `SESSION_CODE_PEPPER` are set on the server (confirm **EU region** for Convex; human ops, brief §14). The Convex URL is never exposed to the browser. Without storage, the post-test consent step is skipped and storage APIs return 503.

Honesty-Humility deeper items are IPIP-HEXACO (`HH01`–`HH06`). Production still keeps go-deeper off unless `NEXT_PUBLIC_ENABLE_GO_DEEPER` / `ENABLE_GO_DEEPER` is explicitly true.

Progress and standing decisions: [`REPORT.md`](REPORT.md). Product briefs (`WHO_AM_I_*.md`) stay local and are not published. See also [`NOTICE.md`](NOTICE.md) for IPIP attribution and [`LICENSE`](LICENSE).

---

## Storage env vars (names only)

| Name | Where | Secret? | Purpose |
|---|---|---|---|
| `CONVEX_URL` | Vercel (Production, Preview) | No (server-only) | Server routes connect to Convex |
| `CONVEX_SERVER_KEY` | Vercel **and** Convex deployment env (same value) | YES | Shared secret checked inside Convex mutations |
| `SESSION_CODE_PEPPER` | Vercel (Production, Preview) | YES | Hashing session codes and rate-limit buckets |
| `RATE_LIMIT_SALT` | Vercel | YES, optional | Separate rate-limit salt; falls back to the pepper |
| `CONVEX_DEPLOY_KEY` | Vercel (build only) | YES, optional | Only if the build command runs `convex deploy` |

Generate secrets with e.g. `openssl rand -hex 32`. Mark them Sensitive in Vercel.

### One-time Convex setup

1. `npx convex deploy` (confirm EU region first).
2. Set `CONVEX_SERVER_KEY` in the Convex dashboard env to the same value as Vercel.
3. Set `CONVEX_URL`, `CONVEX_SERVER_KEY`, and `SESSION_CODE_PEPPER` on Vercel (Production / Preview).
4. Redeploy production.
5. Optional build command: `npx convex deploy --cmd 'pnpm build'` with `CONVEX_DEPLOY_KEY`.

---

## Vercel preview deployment checklist

Complete before treating a preview URL as a release candidate:

| # | Step | Done |
|---|---|---|
| 1 | Import repo on Vercel; Framework Preset **Next.js**; region prefer **EU** (e.g. `fra1` / `cdg1`) if available | ☐ |
| 2 | Env (Preview): `ALLOW_UNCALIBRATED=true`, `ALLOW_DRAFT_CONTENT=true` (prototype only) | ☐ |
| 3 | Env (Production): leave `ENABLE_GO_DEEPER` / `NEXT_PUBLIC_ENABLE_GO_DEEPER` unset/false until you intentionally enable go-deeper | ☐ |
| 4 | Optional Convex: set `CONVEX_URL`, `CONVEX_SERVER_KEY`, `SESSION_CODE_PEPPER` after `npx convex deploy` + EU confirmation | ☐ |
| 5 | Deploy Preview from `main`; open the preview URL | ☐ |
| 6 | Smoke: home → 10 questions → (consent if storage on) → result; Q1 is always X01; prototype banner visible; `noindex` in page metadata / response | ☐ |
| 7 | Consent off: DevTools Network shows **zero** `/api/storage` calls | ☐ |
| 8 | Consent on (only when Convex is set): one `/api/storage/complete`; session code shown; delete via Privacy works | ☐ |
| 9 | Security: response includes `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` | ☐ |
| 10 | **Lighthouse** (mobile): Accessibility score **≥ 95**; fix regressions before promote | ☐ |
| 11 | Go deeper: off in production by default; enable only with verified H-H items + explicit env flag | ☐ |
| 12 | Record preview URL + date in the deploy notes below when checked | ☐ |

### Preview URL log

| Date | Preview URL | Checked by | Notes |
|---|---|---|---|
| 2026-10-20 | https://who-am-i-guvens-projects-e5b0373b.vercel.app | Cursor + Guven | Prod deploy `cd56af0` / `dpl_5gxW7NAEMXBrWQQxiWZnbcvU2Kys`, region `fra1`. Protection may require Vercel login. Checklist smoke in progress. |

### Production promote (later)

- Do **not** set `ALLOW_UNCALIBRATED` / `ALLOW_DRAFT_CONTENT` unless intentional.
- Keep go-deeper off until you explicitly set the env flag (H-H items are already IPIP-HEXACO).
- Re-run checklist items 6–10 on Production after promote.
- After setting Convex secrets, redeploy so storage turns on.

---

## Open items (human / post-MVP)

See [`REPORT.md`](REPORT.md) Phase 6 and brief §14: calibration pilot, privacy legal review, Convex EU region confirmation, insight content review, accuracy copy comprehension test.
