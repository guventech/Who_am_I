import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { loadExampleResult } from "./helpers/result-fixture";

test("capture colour block at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loadExampleResult(page);
  const block = page.getByTestId("colour-summary");
  await expect(block).toBeVisible();
  await mkdir("artifacts/colour-leaning", { recursive: true });
  await expect(block).toContainText("Leaning yellow");
  await expect(block.getByTestId("colour-dot")).toHaveCSS("opacity", "0.7");
  await block.screenshot({
    path: "artifacts/colour-leaning/after-390.png",
    scale: "css",
  });
});
