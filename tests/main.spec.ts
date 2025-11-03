import { test, expect } from '@playwright/test'

test.describe('Main demo components', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.waitForSelector('#app .counter-text')
	})

	test('counter component renders shared state snapshot', async ({ page }) => {
		await expect(page.locator('#app')).toContainText('Counter Component (JSX)')

		const counterText = page.locator('#app .counter-text')
		await expect(counterText).toHaveText('5')

		const sharedInput = page.locator('#app input[type="number"]').first()
		await expect(sharedInput).toHaveValue('5')

		const slider = page.locator('#app .slider')
		await expect(slider).toBeVisible()
	})

	test('todo workflow adds items', async ({ page }) => {
		const todoInput = page.locator('#app .todo-input')
		await todoInput.fill('Write Playwright tests')
		await page.locator('#app .add-button').click()

		const todoItems = page.locator('#app .todo-item')
		const count = await todoItems.count()
		expect(count).toBeGreaterThan(0)
		
		// Verify the new item is visible
		await expect(todoItems.last().locator('.todo-text')).toHaveText('Write Playwright tests')
	})
})

