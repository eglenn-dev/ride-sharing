import { test, expect } from '@playwright/test'
import { createTestUser, login, signup } from '../helpers/auth'

test.describe.serial('Auth lifecycle: signup -> logout -> login', () => {
  const user = createTestUser('lifecycle')

  test('signup lands on /home with Sign out button visible', async ({ page }) => {
    await signup(page, user)
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
  })

  test('signing out returns to landing page with login link', async ({ page }) => {
    await login(page, user.email, user.password)
    await page.getByRole('button', { name: 'Sign out' }).click()

    await expect(page).toHaveURL(/\/(\?|$)/, { timeout: 10000 })
    const header = page.locator('header')
    await expect(
      header.getByRole('link', { name: 'Log in', exact: true }),
    ).toBeVisible()
  })

  test('logging back in lands on /home', async ({ page }) => {
    await login(page, user.email, user.password)
    await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible()
  })
})
