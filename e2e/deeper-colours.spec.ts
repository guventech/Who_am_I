import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";

async function finishCore(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: copyEn.start }).click();
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Question ${i + 1} of 10`)).toBeVisible();
    await page.locator("[data-likert='3']").click();
    await page.waitForTimeout(250);
  }
  await expect(page).toHaveURL(/\/result/, { timeout: 15_000 });
}

test.describe("go deeper and colours (dev defaults)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("result offers go deeper; after deeper shows six traits and no colour block", async ({
    page,
  }) => {
    await finishCore(page);
    await expect(
      page.getByRole("heading", { name: copyEn.yourFiveTraits, exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("colour-summary")).toHaveCount(0);

    const goDeeper = page.getByTestId("go-deeper");
    // Dev default enables go deeper when H-H items verify.
    if ((await goDeeper.count()) === 0) {
      test.skip(true, "Go deeper unavailable in this env");
      return;
    }
    await goDeeper.click();
    await expect(page).toHaveURL(/\/deeper/);
    await expect(page.getByText("Question 11 of 20")).toBeVisible();

    // Answer until redirected to results (budget 6–10 extras).
    for (let i = 0; i < 12; i++) {
      if (page.url().includes("/result")) break;
      const likert = page.locator("[data-likert='3']");
      if ((await likert.count()) === 0) break;
      await likert.click();
      await page.waitForTimeout(350);
    }

    await expect(page).toHaveURL(/\/result/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: copyEn.yourSixTraits, exact: true }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Honesty-Humility/)).toBeVisible();
    await expect(page.getByTestId("go-deeper")).toHaveCount(0);
    await expect(page.getByTestId("colour-summary")).toHaveCount(0);
  });

  test("/deeper is reachable after core when available", async ({ page }) => {
    await finishCore(page);
    const res = await page.goto("/deeper");
    // Either renders deeper UI or 404 if gated off.
    if (res && res.status() === 404) {
      await expect(page.getByRole("heading", { name: copyEn.notFoundHeading })).toBeVisible();
      return;
    }
    await expect(
      page.getByText(/Question|Honesty|deeper|not available/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
