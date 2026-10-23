import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";

test("production browser worker completes the client-only quiz with branding and security headers", async ({
  page,
}) => {
  const errors: string[] = [];
  const storageRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/api/storage/")) storageRequests.push(request.url());
  });
  const response = await page.goto("/");
  expect(response?.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response?.headers()["content-security-policy"]).not.toContain("unsafe-eval");
  await expect(page).toHaveTitle("Who Am I? | Bircans");
  await expect(page.getByRole("link", { name: copyEn.brandReturn })).toHaveAttribute(
    "href",
    "https://bircans.com",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.screenshot({ path: test.info().outputPath("home.png"), fullPage: true });
  await page.getByRole("button", { name: copyEn.start }).click();
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Question ${i + 1} of 10`)).toBeVisible();
    await page.locator("[data-likert='3']").click();
  }
  await expect(page).toHaveURL(/\/result/);
  await expect(page.getByRole("heading", { name: copyEn.yourFiveTraits })).toBeVisible();
  await expect(page.getByRole("main").getByText(copyEn.resultsLocalOnly)).toBeVisible();
  expect(errors).toEqual([]);
  expect(storageRequests).toEqual([]);
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    accessibility.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    ),
  ).toEqual([]);
  await page.screenshot({ path: test.info().outputPath("result.png"), fullPage: true });
});
