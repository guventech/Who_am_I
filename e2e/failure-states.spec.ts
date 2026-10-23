import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";

test.describe("empty session failure states", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("direct /test with no session shows clear next step", async ({ page }) => {
    await page.goto("/test");
    await expect(page.getByTestId("no-session")).toBeVisible();
    await expect(page.getByText(copyEn.noSessionHeading)).toBeVisible();
    await expect(page.getByRole("link", { name: copyEn.noSessionCta })).toBeVisible();
  });

  test("direct /consent with no session shows clear next step", async ({ page }) => {
    await page.goto("/consent");
    await expect(page.getByTestId("no-session")).toBeVisible();
    await expect(page.getByRole("link", { name: copyEn.noSessionCta })).toBeVisible();
  });

  test("direct /result with no session shows clear next step", async ({ page }) => {
    await page.goto("/result");
    await expect(page.getByTestId("no-session")).toBeVisible();
    await expect(page.getByRole("link", { name: copyEn.noSessionCta })).toBeVisible();
  });

  test("take again clears session answers", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await expect(page.getByText("Question 1 of 10")).toBeVisible();
    await page.locator("[data-likert='4']").click();
    await expect(page.getByText("Question 2 of 10")).toBeVisible({
      timeout: 10_000,
    });

    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await expect(page.getByText("Question 1 of 10")).toBeVisible();

    // Finish to results then take again
    for (let i = 0; i < 10; i++) {
      await page.locator("[data-likert='3']").click();
      await page.waitForTimeout(320);
    }
    await expect(page).toHaveURL(/\/result/, { timeout: 15_000 });
    await page.getByTestId("take-again").click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/result");
    await expect(page.getByTestId("no-session")).toBeVisible();
  });
});
