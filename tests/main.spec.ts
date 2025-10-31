import { test, expect } from '@playwright/test'

test.describe('Main demo components', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
		await page.addScriptTag({ type: 'module', url: '/src/main.tsx' })
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

	test('todo workflow adds and removes items', async ({ page }) => {
		const emptyMessage = page.locator('#app .empty-message')
		await expect(emptyMessage).toHaveText('No todos yet. Add one above!')

		const todoInput = page.locator('#app .todo-input')
		await todoInput.fill('Write Playwright tests')
		await page.locator('#app .add-button').click()

		const todoItems = page.locator('#app .todo-item')
		await expect(todoItems).toHaveCount(1)
		await expect(todoItems.first().locator('.todo-text')).toHaveText('Write Playwright tests')

		await expect(emptyMessage).toBeHidden()

		await todoItems.first().locator('.delete-button').click()
		await expect(todoItems).toHaveCount(0)
		await expect(emptyMessage).toHaveText('No todos yet. Add one above!')
	})
})

