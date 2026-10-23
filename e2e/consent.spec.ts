import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";
test("answers and results never trigger storage requests, even with an old opt-in", async ({
  page,
}) => {
  const calls: string[] = [];
  await page.addInitScript(() =>
    sessionStorage.setItem(
      "whoami-consent-v1",
      JSON.stringify({ store: true, ageConfirmed: true, retakeLater: true }),
    ),
  );
  await page.route("**/api/storage/**", (route) => {
    calls.push(route.request().url());
    return route.abort();
  });
  await page.goto("/");
  await page.getByRole("button", { name: copyEn.start }).click();
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Question ${i + 1} of 10`)).toBeVisible();
    await page.locator("[data-likert='3']").click();
  }
  await expect(page).toHaveURL(/\/result/);
  await expect(page.getByRole("main").getByText(copyEn.resultsLocalOnly)).toBeVisible();
  await expect(page.getByTestId("session-code")).toHaveCount(0);
  await expect(page.getByRole("link", { name: copyEn.tellUsFits })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: copyEn.resultHeading })).toBeVisible();
  expect(calls).toEqual([]);
});
