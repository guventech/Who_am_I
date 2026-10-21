import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";

test.describe("refresh and history navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("refresh mid-test resumes at the same question", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await expect(page.getByText("Question 1 of 10")).toBeVisible();
    await page.locator("[data-likert='3']").click();
    await expect(page.getByText("Question 2 of 10")).toBeVisible({
      timeout: 10_000,
    });
    await page.reload();
    await expect(page.getByText("Question 2 of 10")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId("no-session")).toHaveCount(0);
  });

  test("browser back and forward never show a blank page", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await expect(page.getByText("Question 1 of 10")).toBeVisible();

    await page.goBack();
    await expect(page.getByRole("heading", { name: copyEn.brand })).toBeVisible();
    await expect(page.locator("body")).not.toBeEmpty();
    await expect(
      page.getByRole("main").filter({ hasText: copyEn.promise }),
    ).toBeVisible();

    await page.goForward();
    await expect(page.getByText("Question 1 of 10")).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByRole("main").filter({ hasText: "Question 1 of 10" }),
    ).toBeVisible();
    await expect(page.getByTestId("no-session")).toHaveCount(0);
  });
});
