import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";

test.describe("core flow", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("completes 10 questions directly to results", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await expect(page).toHaveURL(/\/test/);

    for (let i = 0; i < 10; i++) {
      await expect(page.getByText(`Question ${i + 1} of 10`)).toBeVisible();
      await page.locator("[data-likert='3']").click();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveURL(/\/result/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: copyEn.resultHeading })).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: copyEn.prototypeBanner }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: copyEn.yourFiveTraits, exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: copyEn.yourStrengths, exact: true })).toBeVisible();
    await expect(page.getByText(/Extraversion/)).toBeVisible();
  });

  test("Q1 is the same across three browser contexts", async ({ browser }) => {
    const q1Texts: string[] = [];
    for (let i = 0; i < 3; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto("/");
      await page.getByRole("button", { name: copyEn.start }).click();
      await expect(page.getByText("Question 1 of 10")).toBeVisible();
      const heading = page
        .getByRole("main")
        .filter({ hasText: "Question 1 of 10" })
        .getByRole("heading", { level: 1 });
      q1Texts.push((await heading.innerText()).trim());
      await context.close();
    }
    expect(new Set(q1Texts).size).toBe(1);
    expect(q1Texts[0]).toMatch(/feel at ease meeting new people/i);
  });

  test("keyboard 1-5 answers a question", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await expect(page.getByText("Question 1 of 10")).toBeVisible();
    await page.keyboard.press("4");
    await expect(page.getByText("Question 2 of 10")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("back restores previous progress", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await page.locator("[data-likert='5']").click();
    await expect(page.getByText("Question 2 of 10")).toBeVisible({
      timeout: 10_000,
    });
    await page.getByRole("button", { name: copyEn.back }).click();
    await expect(page.getByText("Question 1 of 10")).toBeVisible();
  });

  test("how-accurate page has no serious axe violations", async ({ page }) => {
    await page.goto("/how-accurate");
    await expect(
      page.getByRole("heading", { name: copyEn.howAccurateHeading }),
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toEqual([]);
  });

  test("home page has no serious axe violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toEqual([]);
  });
});
