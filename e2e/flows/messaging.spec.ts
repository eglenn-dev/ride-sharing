import { test, expect } from '@playwright/test'
import { login, SEEDED } from '../helpers/auth'

test('Rider Bob can open a thread from a booking and send a message', async ({
  page,
}) => {
  await login(page, SEEDED.bob.email, SEEDED.bob.password)

  // Bob's seeded UT Campus booking is with Alice. Click its "Message driver"
  // button to get-or-create a thread, then verify navigation to /messages/<id>.
  const bookingCard = page.locator('article').filter({
    hasText: 'Downtown Austin to UT Campus',
  })
  await expect(bookingCard).toBeVisible()
  await bookingCard.getByRole('button', { name: 'Message driver' }).click()

  await expect(page).toHaveURL(/\/messages\/[\w-]+/, { timeout: 15000 })
  await expect(page.getByRole('heading', { name: 'Alice Driver' })).toBeVisible()

  const messageBody = `Hello Alice, e2e ${Date.now()}`
  await page.getByRole('textbox', { name: 'Type a message...' }).fill(messageBody)
  await page.getByRole('button', { name: 'Send' }).click()

  await expect(page.getByText(messageBody)).toBeVisible({ timeout: 10000 })

  // Verify the inbox now lists this thread with the message preview.
  await page.goto('/messages')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('Alice Driver').first()).toBeVisible()
  await expect(page.getByText(messageBody)).toBeVisible()
})
