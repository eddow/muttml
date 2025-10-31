import { test, expect } from '@playwright/test'

test.describe('Mini demo', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/')
	})

	test('mini counter adds and clears items', async ({ page }) => {
		const miniRoot = page.locator('#mini')
		await expect(miniRoot).toBeVisible()

		const miniInput = miniRoot.locator('input[type="text"]')
		await expect(miniInput).toBeVisible()

		const firstValue = await miniInput.inputValue()
		await miniRoot.locator('button.add').click()

		const listDisplay = miniRoot.locator('> div').first().locator('span')
		await expect(listDisplay).toContainText(firstValue)

		await miniInput.fill('Custom entry')
		await miniRoot.locator('button.add').click()
		await expect(listDisplay).toContainText('Custom entry')

		const removeAllButton = miniRoot.locator('button.remove-all')
		await expect(removeAllButton).toBeVisible()
		await removeAllButton.click()
		await expect(listDisplay).toHaveText('')
		await expect(removeAllButton).toBeHidden()
	})

	test('resize sandbox renders helper copy', async ({ page }) => {
		const resizeSection = page.locator('#mini').locator('text=Resize me')
		await expect(resizeSection).toBeVisible()
		await expect(page.locator('#mini')).toContainText('Resize Sandbox')
	})
})


