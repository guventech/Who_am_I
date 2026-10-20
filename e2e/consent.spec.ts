import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";

async function answerTen(page: import("@playwright/test").Page) {
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Question ${i + 1} of 10`)).toBeVisible();
    await page.locator("[data-likert='3']").click();
    await page.waitForTimeout(300);
  }
}

test.describe("consent and storage", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("consent No makes zero storage network calls", async ({ page }) => {
    const storageCalls: string[] = [];
    await page.route("**/api/storage/**", (route) => {
      storageCalls.push(route.request().url());
      return route.abort();
    });

    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await answerTen(page);
    await expect(page).toHaveURL(/\/consent/, { timeout: 30_000 });
    await page.getByTestId("consent-no").click();
    await expect(page).toHaveURL(/\/result/, { timeout: 15_000 });
    await expect(page.getByText(copyEn.savedNot)).toBeVisible();
    expect(storageCalls).toEqual([]);
  });

  test("consent Yes + age saves and supports delete", async ({ page }) => {
    const storageCalls: string[] = [];
    await page.route("**/api/storage/**", async (route) => {
      storageCalls.push(route.request().url());
      return route.continue();
    });

    await page.goto("/");
    await page.getByRole("button", { name: copyEn.start }).click();
    await answerTen(page);
    await expect(page).toHaveURL(/\/consent/, { timeout: 30_000 });

    const yes = page.getByTestId("consent-yes");
    if ((await yes.count()) === 0) {
      // Production without Convex: only No is available.
      test.skip();
      return;
    }

    await expect(yes).toBeDisabled();
    await page.getByTestId("consent-age").check();
    await expect(yes).toBeEnabled();
    await yes.click();

    await expect(page).toHaveURL(/\/result/, { timeout: 15_000 });
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
