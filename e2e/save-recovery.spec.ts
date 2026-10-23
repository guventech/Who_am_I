import { expect, test } from "@playwright/test";
test("old clients cannot save results or feedback", async ({ request }) => {
  for (const endpoint of ["complete", "feedback"]) {
    const response = await request.post(`/api/storage/${endpoint}`, {
      data: { consentStore: true, ageConfirmed: true },
    });
    expect(response.status()).toBe(410);
  }
});
test("old consent and feedback URLs redirect to local results", async ({ page }) => {
  for (const route of ["consent", "feedback"]) {
    await page.goto(`/${route}`);
    await expect(page).toHaveURL(/\/result/);
    await expect(page.getByTestId("no-session")).toBeVisible();
  }
});
