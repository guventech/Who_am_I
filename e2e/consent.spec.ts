import { expect, test } from "@playwright/test";
import { copyEn } from "../src/content/copy.en";

async function answerTen(page: import("@playwright/test").Page) {
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`${i + 1} of 10`)).toBeVisible();
    await page.locator("[data-likert='3']").click();
  }
}

test.describe("consent and storage", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("consent-off makes zero storage network calls", async ({ page }) => {
    const storageCalls: string[] = [];
    await page.route("**/api/storage/**", (route) => {
      storageCalls.push(route.request().url());
      return route.abort();
    });

    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await answerTen(page);
    await expect(page).toHaveURL(/\/result/, { timeout: 30_000 });
    await expect(page.getByText(copyEn.storageSkipped)).toBeVisible();
    expect(storageCalls).toEqual([]);
  });

  test("consent-on + completion sends one complete payload and supports delete", async ({
    page,
  }) => {
    const storageCalls: string[] = [];
    await page.route("**/api/storage/**", async (route) => {
      storageCalls.push(route.request().url());
      return route.continue();
    });

    await page.goto("/");
    await page.getByTestId("consent-store").check();
    await page.getByTestId("consent-age").check();
    await page.getByRole("button", { name: copyEn.start }).click();
    await answerTen(page);
    await expect(page).toHaveURL(/\/result/, { timeout: 30_000 });

    await expect(page.getByTestId("session-code")).toBeVisible({
      timeout: 15_000,
    });
    const codeText = await page.getByTestId("session-code").innerText();
    const codeMatch = codeText.match(/[A-Z2-9]{8,}/);
    expect(codeMatch).toBeTruthy();
    const sessionCode = codeMatch![0]!;

    const completeCalls = storageCalls.filter((u) => u.includes("/complete"));
    expect(completeCalls).toHaveLength(1);

    await page.goto("/privacy");
    await page.getByTestId("delete-code").fill(sessionCode);
    await page.getByRole("button", { name: copyEn.deleteSubmit }).click();
    await expect(page.getByText(copyEn.deleteDone)).toBeVisible();
  });
});
