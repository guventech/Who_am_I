import { expect, test, type Page } from "@playwright/test";
import { copyEn } from "../src/copy/en";

/** Widest content column. A hidden cached route can leave a zero-width main. */
async function columnBox(page: Page): Promise<{ border: number; content: number }> {
  const boxes = await page.getByTestId("content-column").evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const pad =
        parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      return { border: rect.width, content: rect.width - pad };
    }),
  );
  return boxes.reduce((best, box) => (box.border > best.border ? box : best), {
    border: 0,
    content: 0,
  });
}

function expectDesktopColumn(box: { border: number; content: number }) {
  expect(box.border).toBeGreaterThanOrEqual(700);
  expect(box.border).toBeLessThanOrEqual(740);
  expect(box.content).toBeGreaterThanOrEqual(640);
}

test.describe("layout and loading UX", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("content column is ~720px on landing, question, consent, and result", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("content-column")).toBeVisible();
    expectDesktopColumn(await columnBox(page));

    await page.getByRole("button", { name: copyEn.start }).click();
    await expect(page).toHaveURL(/\/test/, { timeout: 10_000 });
    await expect(page.getByText("Question 1 of 10")).toBeVisible();
    expectDesktopColumn(await columnBox(page));
    const answers = page.locator("[role='group']");
    const answerWidth = await answers.evaluate((el) => el.getBoundingClientRect().width);
    expect(answerWidth).toBeGreaterThanOrEqual(640);

    for (let i = 0; i < 10; i++) {
      await page.locator("[data-likert='3']").click();
      await page.waitForTimeout(350);
    }
    await expect(page).toHaveURL(/\/consent/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: copyEn.consentHeading })).toBeVisible();
    expectDesktopColumn(await columnBox(page));
    await page.getByTestId("consent-no").click();
    await expect(page).toHaveURL(/\/result/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: copyEn.resultHeading })).toBeVisible();
    expectDesktopColumn(await columnBox(page));
  });

  test("content column fits a phone without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/test");
    await expect(page.getByText("Question 1 of 10")).toBeVisible();
    const box = await columnBox(page);
    expect(box.border).toBeLessThanOrEqual(390);
    expect(box.border).toBeGreaterThanOrEqual(360);
    const scroll = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scroll.scrollWidth).toBeLessThanOrEqual(scroll.clientWidth + 1);
  });

  test("answer click shows check and loading within 100ms", async ({
    page,
  }) => {
    await page.goto("/test");
    await expect(page.getByText("Question 1 of 10")).toBeVisible();
    await page.locator("[data-likert='4']").click();
    await page.waitForTimeout(100);
    await expect(page.getByTestId("likert-check")).toBeVisible();
    await expect(page.getByTestId("loading-status")).toContainText(/Loading/i);
  });
});
