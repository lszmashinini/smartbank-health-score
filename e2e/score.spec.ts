import { expect, test } from "@playwright/test";

test("dashboard renders and API score can run", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("SmartBank Financial Health Score™").first()).toBeVisible();
  await expect(page.getByText("Bank-grade financial wellness scoring")).toBeVisible();

  await page.getByRole("button", { name: /Run API Score/i }).click();
  await expect(page.getByText(/API scoring complete|Local explainable model loaded|Calling/)).toBeVisible();
  await expect(page.getByText("Recommended actions")).toBeVisible();
});
