import { expect, test } from "@playwright/test";
import { copyEn } from "../src/content/copy.en";

test.describe("home page", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows English placeholder home", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: copyEn.brand })).toBeVisible();
    await expect(page.getByText(copyEn.promise)).toBeVisible();
    await expect(page.getByText(copyEn.honesty)).toBeVisible();
    await expect(
      page.getByRole("button", { name: `${copyEn.start} — ${copyEn.startComingSoon}` }),
    ).toBeDisabled();
  });
});
