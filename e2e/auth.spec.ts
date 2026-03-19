import { test, expect, Page } from "@playwright/test";

const TEST_USER = {
  name: "Test User",
  email: `test+${Date.now()}@example.com`,
  password: "testpassword123",
};

async function signup(page: Page, user: { name: string; email: string; password: string }) {
  await page.goto("/signup");
  await page.waitForLoadState("networkidle");
  await page.locator("#name").fill(user.name);
  await page.locator("#email").fill(user.email);
  await page.locator("#password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
}

test.describe("Auth flows", () => {
  test.describe.serial("signup, signout, and login", () => {
    test("signup flow", async ({ page }) => {
      await signup(page, TEST_USER);
      await expect(
        page.locator(".h-8.w-8.rounded-full").first()
      ).toBeVisible();
    });

    test("sign out flow", async ({ page }) => {
      await login(page, TEST_USER.email, TEST_USER.password);

      await page.getByRole("button", { name: "Sign out" }).click();

      await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
      const header = page.locator("header");
      await expect(header.getByRole("link", { name: "Log in", exact: true })).toBeVisible();
      await expect(header.getByRole("link", { name: "Sign up" })).toBeVisible();
    });

    test("login flow", async ({ page }) => {
      await login(page, TEST_USER.email, TEST_USER.password);
    });
  });

  test("login with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.locator("#email").fill("wrong@example.com");
    await page.locator("#password").fill("wrongpassword123");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.locator("p.text-sm.text-red-600, p.text-sm.text-red-400")).toBeVisible({
      timeout: 10000,
    });
    await expect(page).toHaveURL(/\/login/);
  });

  test("protected route redirects to login", async ({ page }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("auth pages redirect when logged in", async ({ page }) => {
    const email = `test+redirect+${Date.now()}@example.com`;
    await signup(page, { name: "Redirect Test", email, password: "testpassword123" });

    await page.goto("/login");
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });

    await page.goto("/signup");
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
  });
});
