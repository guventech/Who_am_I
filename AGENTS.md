<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Who Am I project handoff

`Who_am_I` maps to GitHub `guventech/Who_am_I`, Vercel project `who-am-i`, and `https://who-am-i-nine-azure.vercel.app`. `main` is the deployed branch. This is an English-language, uncalibrated self-reflection prototype, not a clinical or validated personality test.

## Start here

- Read [README.md](README.md) for current behaviour, hosting flags, legacy-data deletion and feedback. [REPORT.md](REPORT.md) is project history; private ignored briefs are not the sole authority for a new checkout.
- Use the package manager pinned in [package.json](package.json) and `pnpm-lock.yaml`: `pnpm install --frozen-lockfile`, `pnpm dev`, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build` and `pnpm e2e` as relevant. Set `$env:PLAYWRIGHT_CHANNEL='chrome'` for installed Chrome when needed. The browser configuration owns its test-server port.
- UI/routes are in `src/app/` and `src/components/`; scoring mathematics is in `src/engine/`; session state, the worker and its browser wrapper are in `src/session/`. Tests are in `tests/` and `e2e/`.
- Before changing release flags or content gates, read [src/config/env.ts](src/config/env.ts), [src/config/release-readiness.ts](src/config/release-readiness.ts) and [src/config/go-deeper.ts](src/config/go-deeper.ts). Read [NOTICE.md](NOTICE.md) for attribution constraints.

## Contracts to preserve

- New quiz answers/results stay in the current browser session, including refresh and back/forward recovery. Scoring runs through `src/session/scoring.worker.ts`; preserve worker cleanup, cancellation/error handling and the original core result when an optional deeper round is paused.
- The deeper replay path reuses batch scoring with exact posterior-equivalence coverage. Avoid reintroducing repeated full-grid summaries while replaying every retained answer.
- Keep prototype/calibration warnings and noindex until the required calibration/content review is complete. Production deeper analysis is opt-in through the documented flag; a default does not establish the current deployment's configured value.
- Legacy Convex records and deletion codes are a separate compatibility boundary. Preserve the existing pepper and retention/deletion behaviour; do not close the shared Convex account or enable new server storage for answers. Required variable names and their purpose are documented in the README; values stay in approved secret storage.
- `/api/feedback` sends only the selected topic, comment and optional reply email through the existing email integration. Preserve its validation, origin checks, bounded requests and repeat-submission controls; do not attach answers, scores or session codes.
- Navigation must keep explicit destinations and preserve quiz progress. Never remove session data as a navigation or recovery shortcut.

Keep work local unless committing, publishing or deployment is requested. pnpm 12 reads the `braces` override from `pnpm-workspace.yaml`; keep it there alongside the explicit build-script permissions, and preserve the pinned package-manager version. Configuration maintenance does not authorize unrelated dependency upgrades.
