import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";

test.describe("home page", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("shows English home with Start and accuracy link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: copyEn.brand })).toBeVisible();
    await expect(page.getByText(copyEn.promise)).toBeVisible();
    await expect(page.getByText(copyEn.youGet)).toBeVisible();
    await expect(page.getByRole("status")).toContainText(copyEn.prototypeBanner);
    await expect(page.getByRole("button", { name: copyEn.start })).toBeVisible();
    await expect(page.getByText(copyEn.landingExpectation)).toBeVisible();
    await expect(
      page.getByRole("link", { name: copyEn.howAccurateLink }),
    ).toBeVisible();
  });
});
