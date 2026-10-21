import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";

async function expectNoSeriousAxe(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
}

test.describe("axe on main routes", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("home", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: copyEn.brand })).toBeVisible();
    await expectNoSeriousAxe(page);
  });

  test("question", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await expect(page.getByText("Question 1 of 10")).toBeVisible();
    await expectNoSeriousAxe(page);
  });

  test("consent", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    for (let i = 0; i < 10; i++) {
      await page.locator("[data-likert='3']").click();
      await page.waitForTimeout(320);
    }
    await expect(page).toHaveURL(/\/consent/, { timeout: 30_000 });
    await expectNoSeriousAxe(page);
  });

  test("result", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    for (let i = 0; i < 10; i++) {
      await page.locator("[data-likert='3']").click();
      await page.waitForTimeout(320);
    }
    await expect(page).toHaveURL(/\/consent/, { timeout: 30_000 });
    await page.getByTestId("consent-no").click();
    await expect(page).toHaveURL(/\/result/, { timeout: 15_000 });
    await expectNoSeriousAxe(page);
  });

  test("privacy", async ({ page }) => {
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", { name: copyEn.privacyHeading }),
    ).toBeVisible();
    await expectNoSeriousAxe(page);
  });
});
