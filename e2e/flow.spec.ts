import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { copyEn } from "../src/content/copy.en";

test.describe("core flow", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("completes 10 questions and shows result sliders", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await expect(page).toHaveURL(/\/test/);

    for (let i = 0; i < 10; i++) {
      await expect(page.getByText(`${i + 1} of 10`)).toBeVisible();
      await page.locator("[data-likert='3']").click();
    }

    await expect(page).toHaveURL(/\/result/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: copyEn.resultHeading }),
    ).toBeVisible();
    await expect(
      page.getByRole("status").filter({ hasText: copyEn.prototypeBanner }),
    ).toBeVisible();
    await expect(page.getByText(copyEn.disclaimer)).toBeVisible();
    await expect(page.getByText("Extraversion")).toBeVisible();
    await expect(page.getByText("Openness")).toBeVisible();
    // Empty ACCURACY_CLAIMS ⇒ no invented correlation numbers on result
    await expect(page.getByText(/0\.\d{2}\s+to\s+0\.\d{2}/)).toHaveCount(0);
  });

  test("keyboard 1-5 answers a question", async ({ page }) => {
    await page.goto("/test");
    await expect(page.getByText("1 of 10")).toBeVisible();
    await page.keyboard.press("4");
    await expect(page.getByText("2 of 10")).toBeVisible();
  });

  test("back restores previous progress", async ({ page }) => {
    await page.goto("/test");
    await page.locator("[data-likert='5']").click();
    await expect(page.getByText("2 of 10")).toBeVisible();
    await page.getByRole("button", { name: copyEn.back }).click();
    await expect(page.getByText("1 of 10")).toBeVisible();
  });

  test("how-accurate page has no serious axe violations", async ({ page }) => {
    await page.goto("/how-accurate");
    await expect(
      page.getByRole("heading", { name: copyEn.howAccurateHeading }),
    ).toBeVisible();
    await expect(page.getByText(copyEn.noAccuracyNumbers)).toBeVisible();

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
