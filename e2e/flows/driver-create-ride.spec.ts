import { test, expect } from '@playwright/test'
import { login, SEEDED } from '../helpers/auth'

function futureDateTimeLocal(hoursFromNow = 24) {
  const date = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000)
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

test('Driver Alice can create a new ride and see it on /home', async ({ page }) => {
  await login(page, SEEDED.alice.email, SEEDED.alice.password)

  const uniqueOrigin = `E2E Origin ${Date.now()}`
  const uniqueDestination = `E2E Destination ${Date.now()}`

  await page.goto('/rides/create')
  await page.waitForLoadState('networkidle')

  await page.getByLabel('Origin').fill(uniqueOrigin)
  await page.getByLabel('Destination').fill(uniqueDestination)
  await page.getByLabel('Departure Time').fill(futureDateTimeLocal(24))
  await page.getByLabel('Ride Type').selectOption('SHARED')
  await page.getByLabel('Seats').fill('3')
  await page.getByLabel('Price Per Seat (USD)').fill('15')
  await page.getByLabel('Description (optional)').fill('e2e test ride')

  await page.getByRole('button', { name: 'Create Ride' }).click()

  await expect(page).toHaveURL(/\/home/, { timeout: 15000 })
  await expect(page.getByText(`${uniqueOrigin} to ${uniqueDestination}`)).toBeVisible()
})
