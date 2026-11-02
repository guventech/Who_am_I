import { expect, test } from "@playwright/test";
import { loadExampleResult } from "./helpers/result-fixture";

test("capture colour block at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loadExampleResult(page);
  const block = page.getByTestId("colour-summary");
  await expect(block).toBeVisible();
  await expect(block).toContainText("Leaning yellow");
  await expect(block.getByTestId("colour-dot")).toHaveCSS("opacity", "0.7");
  await block.screenshot({
    path: test.info().outputPath("colour-summary-390.png"),
    scale: "css",
  });
});
