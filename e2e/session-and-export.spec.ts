import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { copyEn } from "../src/copy/en";
import { loadExampleResult } from "./helpers/result-fixture";

test.use({ viewport: { width: 390, height: 844 } });

test("home resumes progress and restart requires confirmation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: copyEn.start, exact: true }).click();
  await page.locator("[data-likert='4']").click();
  await expect(page.getByText("Question 2 of 10")).toBeVisible();
  const original = await page.evaluate(() => sessionStorage.getItem("whoami-session-v1"));
  await page.goto("/");
  await page.getByRole("button", { name: copyEn.continueTest }).click();
  await expect(page.getByText("Question 2 of 10")).toBeVisible();
  await page.goto("/");
  await page.getByRole("button", { name: copyEn.takeAgain, exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => sessionStorage.getItem("whoami-session-v1"))).toBe(
    original,
  );
  await page.getByRole("button", { name: copyEn.takeAgain, exact: true }).click();
  await page.getByRole("button", { name: copyEn.restartConfirm, exact: true }).click();
  await expect(page.getByText("Question 1 of 10")).toBeVisible();
  const next = await page.evaluate(() =>
    JSON.parse(sessionStorage.getItem("whoami-session-v1")!),
  );
  expect(next.answered).toEqual([]);
  expect(next.completionId).not.toBe(JSON.parse(original!).completionId);
});

test("home keeps completed results and lets users return before restarting", async ({
  page,
}) => {
  await loadExampleResult(page);
  const original = await page.evaluate(() => sessionStorage.getItem("whoami-session-v1"));
  await page.goto("/");
  await expect(page.getByRole("button", { name: copyEn.viewResults })).toBeVisible();
  await page.getByRole("button", { name: copyEn.takeAgain, exact: true }).click();
  await page.getByRole("dialog").getByRole("link", { name: copyEn.viewResults }).click();
  await expect(page.getByTestId("colour-summary")).toContainText("Leaning yellow");
  await page.getByRole("button", { name: copyEn.takeAgain, exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("link", { name: copyEn.downloadResults })).toBeVisible();
  await expect(dialog.getByRole("button", { name: copyEn.restartCancel })).toBeFocused();
  await dialog.screenshot({
    path: "artifacts/colour-leaning/restart-390.png",
    scale: "css",
  });
  const violations = (await new AxeBuilder({ page }).analyze()).violations;
  expect(
    violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
  ).toEqual([]);
  await dialog.getByRole("button", { name: copyEn.restartCancel }).click();
  await page.reload();
  await expect(page.getByTestId("colour-summary")).toContainText("Leaning yellow");
  expect(await page.evaluate(() => sessionStorage.getItem("whoami-session-v1"))).toBe(
    original,
  );
});

test("clipboard failure provides selectable text and matching text download", async ({
  page,
}) => {
  await loadExampleResult(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error("Clipboard denied")),
      },
    });
  });
  const exportBlock = page.getByTestId("results-export").first();
  await exportBlock.getByRole("button", { name: copyEn.copyResults }).click();
  await expect(exportBlock.getByRole("status")).toHaveText(copyEn.copyResultsFailed);
  const fallback = exportBlock.getByRole("textbox", { name: copyEn.resultsTextLabel });
  await expect(fallback).toBeFocused();
  const text = await fallback.inputValue();
  expect(text).toContain("Leaning yellow, with some red");
  expect(text).toContain(copyEn.colourBandUncertainty);
  expect(text).toContain(copyEn.colourDisclaimer);
  const selected = await fallback.evaluate(
    (element: HTMLTextAreaElement) => element.selectionEnd - element.selectionStart,
  );
  expect(selected).toBe(text.length);
  const downloadPending = page.waitForEvent("download");
  await exportBlock.getByRole("link", { name: copyEn.downloadResults }).click();
  const download = await downloadPending;
  expect(download.suggestedFilename()).toBe(copyEn.resultsFilename);
  expect(await readFile((await download.path())!, "utf8")).toBe(text);
});

test("clipboard success is announced and unavailable clipboard has a fallback", async ({
  page,
}) => {
  await loadExampleResult(page);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    }),
  );
  const exportBlock = page.getByTestId("results-export").first();
  await exportBlock.getByRole("button", { name: copyEn.copyResults }).click();
  await expect(exportBlock.getByRole("status")).toHaveText(copyEn.copyResultsDone);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    }),
  );
  await exportBlock.getByRole("button", { name: copyEn.copyResults }).click();
  await expect(exportBlock.getByRole("textbox")).toBeVisible();
});
