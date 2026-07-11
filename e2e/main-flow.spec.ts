import { test, expect } from "@playwright/test";

test("main checker flow and mobile navigation", async ({ page, isMobile }) => {
  await page.goto("/checker");
  await page.getByRole("button", { name: /load sample/i }).click();
  await page.getByRole("button", { name: /run suspiciousness check/i }).click();
  if (isMobile) {
    await expect(page.getByLabel(/new results available/i)).toBeVisible();
    await page.getByRole("button", { name: /show results/i }).click();
    await expect(page.getByRole("dialog", { name: /analysis results/i }).getByText("Automated estimate", { exact: true })).toBeVisible();
  } else {
    await expect(page.getByLabel("Suspicion result panel").getByText("Automated estimate", { exact: true })).toBeVisible();
  }

  await page.goto("/dashboard");
  if (isMobile) {
    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.getByRole("dialog", { name: /navigation/i })).toBeVisible();
    await page.getByRole("link", { name: "History", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/history/);
  } else {
    await page.getByRole("link", { name: "History", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/history/);
  }
});

test("mobile checker results open in a right drawer", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Results drawer is mobile-only; desktop keeps the split panel.");

  await page.goto("/dashboard/checker");
  await page.getByRole("button", { name: /load sample/i }).click();
  await page.getByRole("button", { name: /run suspiciousness check/i }).click();
  await expect(page.getByLabel(/new results available/i)).toBeVisible();
  await page.getByRole("button", { name: /show results/i }).click();
  const resultsDialog = page.getByRole("dialog", { name: /analysis results/i });
  await expect(resultsDialog).toBeVisible();
  await expect(resultsDialog.getByText("Automated estimate", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^close results$/i }).click();
  await expect(page.getByRole("dialog", { name: /analysis results/i })).toBeHidden();
  await page.getByRole("button", { name: /show results/i }).click();
  await expect(page.getByRole("dialog", { name: /analysis results/i })).toBeVisible();
});
