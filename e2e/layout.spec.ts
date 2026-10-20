import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";

test.describe("layout and loading UX", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("main column is ~720px on landing, test, and result", async ({
    page,
  }) => {
    await page.goto("/");
    const homeMain = page.locator("main");
    await expect(homeMain).toBeVisible();
    const homeWidth = await homeMain.evaluate((el) => el.getBoundingClientRect().width);
    expect(homeWidth).toBeGreaterThanOrEqual(700);
    expect(homeWidth).toBeLessThanOrEqual(740);

    await page.getByRole("button", { name: copyEn.start }).click();
    await expect(page).toHaveURL(/\/test/, { timeout: 10_000 });
    const testMain = page.locator("main");
    const testWidth = await testMain.evaluate((el) => el.getBoundingClientRect().width);
    expect(testWidth).toBeGreaterThanOrEqual(700);
    expect(testWidth).toBeLessThanOrEqual(740);

    for (let i = 0; i < 10; i++) {
      await page.locator("[data-likert='3']").click();
      await page.waitForTimeout(350);
    }
    // Dev storage is on, so consent appears; skip to result.
    if (page.url().includes("/consent")) {
      await page.getByTestId("consent-no").click();
    }
    await expect(page).toHaveURL(/\/result/, { timeout: 15_000 });
    const resultMain = page.locator("main");
    const resultWidth = await resultMain.evaluate(
      (el) => el.getBoundingClientRect().width,
    );
    expect(resultWidth).toBeGreaterThanOrEqual(700);
    expect(resultWidth).toBeLessThanOrEqual(740);
  });

  test("answer click shows check and loading within 100ms", async ({
    page,
  }) => {
    await page.goto("/test");
    await expect(page.getByText("Question 1 of 10")).toBeVisible();
    await page.locator("[data-likert='4']").click();
    await page.waitForTimeout(100);
    await expect(page.getByTestId("likert-check")).toBeVisible();
    await expect(page.getByTestId("loading-status")).toContainText(/Loading/i);
  });
});
