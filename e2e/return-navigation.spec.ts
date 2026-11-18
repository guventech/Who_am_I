import { expect, test } from "@playwright/test";
import { copyEn } from "../src/copy/en";

const destination = "https://www.bircans.com/guven#tools";

test("direct app pages expose the same accessible portfolio return", async ({ page }) => {
  for (const route of ["/", "/test", "/result", "/deeper", "/privacy", "/how-accurate", "/feedback"]) {
    await page.goto(route);
    const link = page.getByRole("navigation", { name: "Portfolio", exact: true }).getByRole("link", { name: "Tools I built" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", destination);
    expect(await link.getAttribute("target")).toBeNull();
    const box = await link.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.y).toBeLessThan(100);
  }
});

test("keyboard portfolio return keeps quiz progress in the same tab", async ({ page, context }) => {
  await page.route("https://www.bircans.com/guven", route => route.fulfill({ body: '<main id="tools">Tools I built</main>', contentType: "text/html" }));
  await page.goto("/");
  await page.getByRole("button", { name: copyEn.start, exact: true }).click();
  await page.locator("[data-likert='3']").click();
  await expect(page.getByText("Question 2 of 10")).toBeVisible();
  const link = page.getByRole("navigation", { name: "Portfolio", exact: true }).getByRole("link");
  await link.focus();
  await expect(link).toBeFocused();
  expect(await link.evaluate(el => getComputedStyle(el).outlineStyle)).toBe("solid");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(destination);
  expect(context.pages()).toHaveLength(1);
  await page.goBack();
  await expect(page.getByText("Question 2 of 10")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Question 2 of 10")).toBeVisible();
});
