import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { copyEn } from "../src/copy/en";
import { loadExampleResult } from "./helpers/result-fixture";

test.use({ viewport: { width: 390, height: 844 } });

async function finishCore(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: copyEn.start, exact: true }).click();
  for (let n = 1; n <= 10; n++) {
    await expect(page.getByText(`Question ${n} of 10`, { exact: true })).toBeVisible();
    await page.getByRole("radio", { name: copyEn.likert[2], exact: true }).click();
  }
  await expect(page).toHaveURL(/\/result/);
}

test("Go deeper preserves original results through pause, refresh, resume and completion", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await finishCore(page);
  const originalExport = await page
    .getByRole("link", { name: copyEn.downloadResults })
    .getAttribute("href");
  const originalScores = await page.evaluate(
    () => JSON.parse(sessionStorage.getItem("whoami-session-v1")!).scored,
  );
  const start = page.getByTestId("go-deeper");
  test.skip((await start.count()) === 0, "Go deeper is disabled in this environment");
  await start.click();
  await expect(page.getByText("Question 11 of 20", { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: copyEn.likert[3], exact: true }).click();
  await expect(page.getByText("Question 12 of 20", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: copyEn.backToResults, exact: true }).click();
  await expect(page.getByText(copyEn.deeperPaused)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: copyEn.yourFiveTraits, exact: true }),
  ).toBeVisible();
  expect(
    await page.getByRole("link", { name: copyEn.downloadResults }).getAttribute("href"),
  ).toBe(originalExport);
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: copyEn.viewResults, exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: copyEn.continueDeeper, exact: true }).click();
  await expect(page.getByText("Question 12 of 20", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Question 12 of 20", { exact: true })).toBeVisible();
  await page.keyboard.press("5");
  await expect(page.getByText("Question 13 of 20", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(sessionStorage.getItem("whoami-session-v1")!).coreScored,
    ),
  ).toEqual(originalScores);
  for (let i = 0; i < 10 && !page.url().includes("/result"); i++) {
    const question = await page.getByRole("heading", { level: 1 }).innerText();
    await page.getByRole("radio", { name: copyEn.likert[2], exact: true }).click();
    await expect(async () => {
      if (!page.url().includes("/result")) {
        await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(question);
      }
    }).toPass({ timeout: 15_000 });
  }
  await expect(
    page.getByRole("heading", { name: copyEn.yourSixTraits, exact: true }),
  ).toBeVisible();
  const changes = page.getByTestId("deeper-changes");
  await expect(page.getByTestId("trait-comparison")).toHaveCount(5);
  await expect(page.getByText(copyEn.deeperNewTrait, { exact: true })).toBeVisible();
  await page
    .getByTestId("trait-comparison")
    .first()
    .locator("..")
    .screenshot({
      path: test.info().outputPath("comparison-card-390.png"),
      scale: "css",
    });
  const comparisonAccessibility = (await new AxeBuilder({ page }).analyze()).violations;
  expect(
    comparisonAccessibility.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    ),
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await changes.getByText(copyEn.deeperTextChanges, { exact: true }).click();
  await expect(changes).toContainText(copyEn.deeperAddedH);
  await expect(changes.locator("li")).toHaveCount(6);
  const finalExport = decodeURIComponent(
    (await page.getByRole("link", { name: copyEn.downloadResults }).getAttribute("href"))!
      .split(",")
      .slice(1)
      .join(","),
  );
  expect(finalExport).toContain(copyEn.deeperChangesHeading);
  expect(finalExport).toContain(copyEn.deeperAddedH);
  await page.screenshot({
    path: test.info().outputPath("deeper-results-390.png"),
    fullPage: true,
    scale: "css",
  });
});

test("blocked browser storage keeps the quiz usable and warns before refresh", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() =>
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    }),
  );
  await finishCore(page);
  await expect(page.getByText(copyEn.storageUnavailable, { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: copyEn.downloadResults })).toBeVisible();
  expect(errors).toEqual([]);
  await page.reload();
  await expect(page.getByTestId("no-session")).toBeVisible();
  await expect(page.getByText(copyEn.storageUnavailable, { exact: true })).toBeVisible();
});

test("question focus, shortcuts, arrow keys and reduced motion work together", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: copyEn.start, exact: true }).click();
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeFocused();
  await expect(page.getByText(copyEn.keyboardHint, { exact: true })).toBeVisible();
  const descriptionId = (await heading.getAttribute("aria-describedby"))!.split(" ")[0];
  await expect(page.locator(`[id="${descriptionId}"]`)).toHaveText("Question 1 of 10");
  await page.keyboard.press("4");
  await expect(page.getByText("Question 2 of 10", { exact: true })).toBeVisible();
  await expect(heading).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("radio", { name: copyEn.likert[0], exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("radio", { name: copyEn.likert[1], exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Question 3 of 10", { exact: true })).toBeVisible();
  await expect(heading).toBeFocused();
  await expect(page.getByTestId("question-progress")).toHaveCSS(
    "transition-duration",
    "0s",
  );
  const violations = (await new AxeBuilder({ page }).analyze()).violations;
  expect(
    violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
  ).toEqual([]);
});

test("results start with two highlights and an action, with CV wording collapsed", async ({
  page,
}) => {
  await loadExampleResult(page);
  const overview = page.getByTestId("result-overview");
  await expect(overview.locator("li")).toHaveCount(2);
  await expect(overview).toContainText(copyEn.oneActionHeading);
  const overviewBox = await overview.boundingBox();
  const traitsBox = await page
    .getByRole("heading", { name: copyEn.yourFiveTraits, exact: true })
    .boundingBox();
  expect(overviewBox!.y).toBeLessThan(traitsBox!.y);
  const wording = page.getByText(copyEn.wordingIdeas, { exact: true }).first();
  const details = wording.locator("..");
  await expect(details).not.toHaveAttribute("open", "");
  await expect(
    details.getByText(copyEn.interviewLabel, { exact: true }),
  ).not.toBeVisible();
  await wording.click();
  await expect(details.getByText(copyEn.interviewLabel, { exact: true })).toBeVisible();
  await expect(details.getByText(copyEn.cvLabel, { exact: true })).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath("results-overview-390.png"),
    fullPage: true,
    scale: "css",
  });
});
