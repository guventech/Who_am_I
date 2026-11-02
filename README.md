# Who Am I?

An English-only, 10-question Big Five prototype. Model parameters are not calibrated yet.

The flow is simple: answer questions, see results, copy them if wanted. New answers and results are never saved on the server. They stay in the current browser session, including across refreshes. Closing the tab normally clears them.

## Local development

```powershell
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm benchmark
```

Set `PLAYWRIGHT_CHANNEL=chrome` to test using an installed Chrome. The browser tests cover desktop and mobile, refresh, keyboard navigation, accessibility, and zero storage requests even when an old consent choice exists.

## Hosting

Vercel builds with `pnpm build`, as specified in `vercel.json`. It no longer deploys Convex as part of an app build. Scoring happens in a short-lived browser worker, so quiz traffic does not cause server scoring or database writes.

This prototype requires explicit `ALLOW_UNCALIBRATED=true` and `ALLOW_DRAFT_CONTENT=true` at build time. Keep its early-version notice and noindex until real calibration and content review are complete. The deeper-analysis code remains available but is off in production by default.

Private briefs, secrets, and test artifacts are excluded from upload by `.vercelignore`. Branding and local favicon assets refer to bircans.com.

## Previously saved data

The older version did save some results. Existing records remain untouched, with their original retention job. Privacy offers a collapsed deletion form for people who kept their code. Only that legacy deletion endpoint needs the existing server-only `CONVEX_URL`, `CONVEX_SERVER_KEY`, and `SESSION_CODE_PEPPER`. Keep the pepper stable so existing deletion codes continue to work.

Legacy `/api/storage/complete` and `/api/storage/feedback` endpoints return HTTP 410, even if old credentials or consent choices are present. The quiz works without Convex. Do not close the shared Convex account or change other projects.

### Feedback by email

The `/feedback` form becomes available from the footer and results page after completing the core test. The optional deeper round is not required. Direct visits before completion explain how to unlock feedback. Completion gating is a browser usability rule, not server proof of taking the quiz: answers remain private. The form sends only the chosen topic, comment and optional reply email to the project owner's inbox through Resend. It never attaches quiz answers, scores or session codes. There is no feedback database. The inbox and email provider may retain submitted messages, as described on the privacy page.

Connect Resend through Vercel Marketplace and configure the server-only variables `RESEND_API_KEY`, `RESEND_EMAIL_DOMAIN` and `FEEDBACK_TO_EMAIL`. Pull development configuration into the ignored `.env.local`. A verified sending domain is required. The recipient and sender are fixed by server configuration and cannot be selected by a visitor. The new endpoint is `/api/feedback`, separate from the retired storage endpoint.

The endpoint validates and bounds JSON bodies, rejects unknown fields and cross-origin submissions, includes a honeypot, and applies a best-effort per-runtime limit of three requests per client per ten minutes. In addition, Resend holds a server-controlled idempotency key based on the daily salted network hash for 24 hours. Retries reuse the original email and different messages from the same network on the same UTC day are rejected, even across Vercel instances and restarts. Changing the client submission UUID cannot bypass this limit. A dated HttpOnly SameSite cookie and local session marker also close repeat submissions in the same browser for that UTC day. Shared networks share an allowance, and changing both network and browser can bypass it, so this is not identity verification. Provider outages do not mark a message as sent. Credentials, comments and email addresses are not written to application logs.

For production browser verification, build with the prototype flags, set `PLAYWRIGHT_PRODUCTION=true`, and run `pnpm e2e`. This verifies the direct question-to-results flow and no storage requests.

See [REPORT.md](REPORT.md) for history, [NOTICE.md](NOTICE.md) for IPIP attribution, and [LICENSE](LICENSE).
