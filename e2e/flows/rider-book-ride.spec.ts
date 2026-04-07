import { test, expect } from '@playwright/test'
import { login, SEEDED } from '../helpers/auth'

test('Rider Bob can search for and book a seeded ride', async ({ page }) => {
  await login(page, SEEDED.bob.email, SEEDED.bob.password)

  await page.goto('/rides/search')
  await page.waitForLoadState('networkidle')

  await page.locator('#origin').fill('Austin Airport')
  await page.getByRole('button', { name: 'Search Rides' }).click()

  const rideCard = page.locator('article').filter({
    hasText: 'Austin Airport to San Marcos',
  })
  await expect(rideCard).toBeVisible()

  await rideCard.getByRole('link', { name: 'Book Ride' }).click()

  await expect(page.getByRole('heading', { name: 'Confirm Your Ride' })).toBeVisible()
  await page.getByRole('button', { name: 'Confirm Booking' }).click()

  await expect(page).toHaveURL(/\/home\?.*bookingCreated=true/, { timeout: 15000 })
  await expect(
    page.getByText(/Booking confirmed for Austin Airport to San Marcos/),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Austin Airport to San Marcos' }),
  ).toBeVisible()
})
