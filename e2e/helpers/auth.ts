import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export type TestUser = {
  name: string
  email: string
  password: string
}

export function createTestUser(prefix = 'test'): TestUser {
  return {
    name: 'Test User',
    email: `${prefix}+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
    password: 'testpassword123',
  }
}

export async function signup(page: Page, user: TestUser) {
  await page.goto('/signup')
  await page.waitForLoadState('networkidle')
  await page.locator('#name').fill(user.name)
  await page.locator('#email').fill(user.email)
  await page.locator('#password').fill(user.password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/home/, { timeout: 15000 })
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL(/\/home/, { timeout: 15000 })
}

export const SEEDED = {
  alice: { email: 'alice@example.com', password: 'password123', name: 'Alice Driver' },
  bob: { email: 'bob@example.com', password: 'password123', name: 'Bob Rider' },
  carol: { email: 'carol@example.com', password: 'password123', name: 'Carol Commuter' },
} as const
