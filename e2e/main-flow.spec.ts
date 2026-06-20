import { test, expect } from "@playwright/test";

test("main checker flow and mobile navigation", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /analyze credibility/i }).first().click();
  await expect(page).toHaveURL(/\/checker/);
  await page.getByRole("button", { name: /load sample/i }).click();
  await page.getByRole("button", { name: /analyze credibility/i }).click();
  await expect(page.getByText("Automated estimate", { exact: true })).toBeVisible();

  await page.goto("/dashboard");
  if (isMobile) {
    await page.getByRole("button", { name: /open menu/i }).click();
    await page.getByRole("link", { name: "History", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/history/);
  } else {
    await page.getByRole("link", { name: "History", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/history/);
  }
});
