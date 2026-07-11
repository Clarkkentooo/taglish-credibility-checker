import { expect, test } from "@playwright/test";

const widths = [320, 360, 375, 390, 414, 480, 768, 820, 1024, 1280, 1440, 1920];
const routes = ["/", "/checker", "/dashboard/history"];

test.describe("responsive layouts", () => {
  for (const width of widths) {
    test(`has no page overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(route);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(1);
      }
    });
  }
});
