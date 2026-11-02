import { expect, test } from "@playwright/test";
test("old clients cannot save results or feedback", async ({ request }) => {
  for (const endpoint of ["complete", "feedback"]) {
    const response = await request.post(`/api/storage/${endpoint}`, {
      data: { consentStore: true, ageConfirmed: true },
    });
    expect(response.status()).toBe(410);
  }
});
test("old consent URL redirects to local results", async ({ page }) => {
  await page.goto("/consent");
  await expect(page).toHaveURL(/\/result/);
  await expect(page.getByTestId("no-session")).toBeVisible();
});
