import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { copyEn } from "../src/copy/en";
import { loadExampleResult } from "./helpers/result-fixture";

test.use({ viewport: { width: 390, height: 844 } });

test("feedback requires a completed quiz and the unlocked form is accessible", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page
      .getByRole("contentinfo")
      .getByRole("link", { name: copyEn.feedbackSend, exact: true }),
  ).toHaveCount(0);
  await page.goto("/feedback");
  await expect(page.getByText(copyEn.feedbackNeedCompleted)).toBeVisible();
  await expect(
    page.getByRole("button", { name: copyEn.feedbackSend, exact: true }),
  ).toHaveCount(0);
  await loadExampleResult(page);
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: copyEn.feedbackSend, exact: true })
    .click();
  await expect(page).toHaveURL(/\/feedback/);
  await expect(
    page.getByRole("heading", { name: copyEn.feedbackSend, exact: true }),
  ).toBeVisible();
  await expect(page.getByText(copyEn.feedbackPrivacy, { exact: true })).toBeVisible();
  const violations = (await new AxeBuilder({ page }).analyze()).violations;
  expect(
    violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("feedback-390.png"),
    fullPage: true,
    scale: "css",
  });
});

test("results feedback sends only explicitly entered fields and keeps quiz state intact", async ({
  page,
}) => {
  await loadExampleResult(page);
  const original = await page.evaluate(() => sessionStorage.getItem("whoami-session-v1"));
  let sent: Record<string, unknown> | undefined;
  await page.route("**/api/feedback", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 200, json: { sent: true } });
  });
  await page
    .getByRole("main")
    .getByRole("link", { name: copyEn.feedbackSend, exact: true })
    .click();
  await page.getByLabel(copyEn.feedbackTopicLabel).selectOption("question");
  await page
    .getByLabel(copyEn.feedbackCommentLabel, { exact: true })
    .fill("I found the wording of the first question confusing.");
  await page.getByLabel(copyEn.feedbackEmailLabel).fill("visitor@example.org");
  await page.getByRole("button", { name: copyEn.feedbackSend, exact: true }).click();
  await expect(page.getByText(copyEn.feedbackSent, { exact: true })).toBeFocused();
  expect(Object.keys(sent!).sort()).toEqual([
    "comment",
    "email",
    "submissionId",
    "topic",
    "website",
  ]);
  expect(sent).toMatchObject({
    topic: "question",
    email: "visitor@example.org",
    website: "",
  });
  const updated = JSON.parse(
    (await page.evaluate(() => sessionStorage.getItem("whoami-session-v1")))!,
  );
  expect(updated.feedbackSentDay).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  delete updated.feedbackSentDay;
  expect(updated).toEqual(JSON.parse(original!));
  await page.reload();
  await expect(page.getByText(copyEn.feedbackSent, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: copyEn.feedbackSend, exact: true }),
  ).toHaveCount(0);
});

test("failure preserves the message and retries reuse the same submission id", async ({
  page,
}) => {
  const bodies: Record<string, unknown>[] = [];
  await loadExampleResult(page);
  await page.route("**/api/feedback", async (route) => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({
      status: bodies.length === 1 ? 503 : 200,
      json: bodies.length === 1 ? { error: "feedback_unavailable" } : { sent: true },
    });
  });
  await page.goto("/feedback");
  await page.getByLabel(copyEn.feedbackTopicLabel).selectOption("bug");
  const comment = page.getByLabel(copyEn.feedbackCommentLabel, { exact: true });
  await comment.fill("The result page did not load on my phone.");
  await page.getByRole("button", { name: copyEn.feedbackSend, exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    copyEn.feedbackFailed,
  );
  await expect(page.getByRole("main").getByRole("alert")).toBeFocused();
  await expect(comment).toHaveValue("The result page did not load on my phone.");
  await page.getByRole("button", { name: copyEn.feedbackSend, exact: true }).click();
  await expect(page.getByText(copyEn.feedbackSent, { exact: true })).toBeVisible();
  expect(bodies[0].submissionId).toBe(bodies[1].submissionId);
  expect(bodies[0].email).toBe("");
});

test("required fields and optional email validation prevent invalid submissions", async ({
  page,
}) => {
  let requests = 0;
  await loadExampleResult(page);
  await page.route("**/api/feedback", (route) => {
    requests++;
    return route.abort();
  });
  await page.goto("/feedback");
  const send = page.getByRole("button", { name: copyEn.feedbackSend, exact: true });
  await send.click();
  expect(requests).toBe(0);
  await page.getByLabel(copyEn.feedbackTopicLabel).selectOption("suggestion");
  await page
    .getByLabel(copyEn.feedbackCommentLabel, { exact: true })
    .fill("A short example would help explain the results.");
  await page.getByLabel(copyEn.feedbackEmailLabel).fill("not-an-email");
  await send.click();
  expect(requests).toBe(0);
  await expect(page.getByLabel(copyEn.feedbackEmailLabel)).toBeFocused();
});

test("rate limit and network failures never show a sent confirmation", async ({
  page,
}) => {
  let count = 0;
  await loadExampleResult(page);
  await page.route("**/api/feedback", async (route) => {
    count++;
    if (count === 1)
      await route.fulfill({ status: 429, json: { error: "too_many_requests" } });
    else await route.abort();
  });
  await page.goto("/feedback");
  await page.getByLabel(copyEn.feedbackTopicLabel).selectOption("results");
  await page
    .getByLabel(copyEn.feedbackCommentLabel, { exact: true })
    .fill("My result does not seem to fit my usual behaviour.");
  await page.getByRole("button", { name: copyEn.feedbackSend, exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    copyEn.feedbackRateLimited,
  );
  await page.getByRole("button", { name: copyEn.feedbackSend, exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    copyEn.feedbackFailed,
  );
  await expect(page.getByText(copyEn.feedbackSent, { exact: true })).toHaveCount(0);
});

test("a daily server rejection closes the form and survives refresh", async ({
  page,
}) => {
  await loadExampleResult(page);
  await page.route("**/api/feedback", (route) =>
    route.fulfill({ status: 409, json: { error: "feedback_already_sent" } }),
  );
  await page.goto("/feedback");
  await page.getByLabel(copyEn.feedbackTopicLabel).selectOption("bug");
  await page
    .getByLabel(copyEn.feedbackCommentLabel, { exact: true })
    .fill("Another message");
  await page.getByRole("button", { name: copyEn.feedbackSend, exact: true }).click();
  await expect(page.getByText(copyEn.feedbackSent, { exact: true })).toBeFocused();
  await page.reload();
  await expect(
    page.getByRole("button", { name: copyEn.feedbackSend, exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText(copyEn.feedbackSent, { exact: true })).toBeVisible();
});
