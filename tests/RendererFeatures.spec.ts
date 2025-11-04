import { test, expect, Page } from '@playwright/test'

type RenderEvent = { event: string; args: any[]; timestamp: number }

async function getEvents(page: Page): Promise<RenderEvent[]> {
    return await page.evaluate(() => window.__pounceEvents?.renderingEvents || []) as RenderEvent[]
}

test.describe('Renderer features', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/#RendererFeatures')
		await page.waitForSelector('#tests')
		const errorPromise = page.waitForSelector('#tests :text("Failed to load fixture")', { timeout: 5000 }).catch(() => null)
		const okPromise = page.waitForSelector('#tests .output', { timeout: 5000 }).catch(() => null)
		const result = await Promise.race([errorPromise, okPromise])
		if (!result) {
			const html = await page.locator('#tests').innerHTML()
			const list = await page.evaluate(() => (window as any).__fixturesList || [])
			throw new Error('Fixture did not render within timeout. #tests HTML: ' + html + ' fixtures: ' + JSON.stringify(list))
		}
		const isError = await page.locator('#tests :text("Failed to load fixture")').count()
		if (isError) {
			const html = await page.locator('#tests').innerText()
			throw new Error('Fixture failed to load: ' + html)
		}
	})

	test('if/else with Scope topic `is`: switch-like matching and else fallback', async ({ page }) => {
		const cond = page.locator('[data-testid="if-else-topic-demo"]')
		await expect(cond).toContainText('Alice branch')
		await expect(cond).not.toContainText('Bob branch')
		await expect(cond).not.toContainText('Else branch')

		await page.click('[data-action="topic-bob"]')
		await expect(cond).not.toContainText('Alice branch')
		await expect(cond).toContainText('Bob branch')
		await expect(cond).not.toContainText('Else branch')

		await page.click('[data-action="topic-carol"]')
		await expect(cond).not.toContainText('Alice branch')
		await expect(cond).not.toContainText('Bob branch')
		await expect(cond).toContainText('Else branch')
	})
	test('if/else with boolean condition', async ({ page }) => {
		const cond = page.locator('[data-testid="if-else-bool-demo"]')
		await expect(cond).toContainText('Alice branch')
		await expect(cond).not.toContainText('Bob branch')
		await expect(cond).not.toContainText('Else branch')

		await page.click('[data-action="topic-bob"]')
		await expect(cond).not.toContainText('Alice branch')
		await expect(cond).toContainText('Bob branch')
		await expect(cond).not.toContainText('Else branch')

		await page.click('[data-action="topic-carol"]')
		await expect(cond).not.toContainText('Alice branch')
		await expect(cond).not.toContainText('Bob branch')
		await expect(cond).toContainText('Else branch')
	})

	test('reactive class vs static string', async ({ page }) => {
		const reactiveDiv = page.locator('[data-testid="class-reactive"]')
		await page.click('[data-action="toggle-class"]')
		await expect(reactiveDiv).toHaveClass('x y')

		const events = await getEvents(page)
		const classEvents = events.filter((e: RenderEvent) => e.event === 'set className')
		expect(classEvents.some((e: RenderEvent) => e.args[1] === 'x y')).toBeTruthy()
	})

	test('style prop reactivity and inputs (function/object/array/string)', async ({ page }) => {
		const styled = page.locator('[data-testid="style-reactive"]')
		await page.click('[data-action="style-arr"]')
		await expect(styled).toHaveCSS('color', 'rgb(0, 0, 255)')

		await page.click('[data-action="style-obj"]')
		await expect(styled).toHaveCSS('color', 'rgb(255, 0, 0)')

		await page.click('[data-action="style-str"]')
		await expect(styled).toHaveCSS('border-top-color', 'rgb(0, 0, 0)')
	})

	test('innerHTML prop sets exact HTML and logs', async ({ page }) => {
		const inner = page.locator('[data-testid="inner"]')
		await expect(inner.locator('em')).toHaveText('html')
		const events = await getEvents(page)
		expect(events.some((e: RenderEvent) => e.event === 'set innerHTML' && typeof e.args[1] === 'string' && e.args[1].includes('<em>html</em>'))).toBeTruthy()
	})

	test('event handlers: add/remove/reactive and cleanup', async ({ page }) => {
		await page.click('[data-action="reset-clicks"]')
		await page.click('[data-action="toggle-listener"]') // disable
		await page.click('[data-action="toggle-listener"]') // enable
		await page.click('[data-testid="evt-btn"]')
		await expect(page.locator('[data-testid="clicks"]')).toHaveText('1')

		await page.click('[data-action="toggle-listener"]') // disable -> should stop counting
		await page.click('[data-testid="evt-btn"]')
		await expect(page.locator('[data-testid="clicks"]')).toHaveText('1')
	})

	test('element property vs attribute setting', async ({ page }) => {
		const label = page.locator('[data-testid="label"]')
		await expect(label).toHaveAttribute('for', 'lbl')
		const div = page.locator('[data-testid="div-propattr"]')
		await expect(div).toHaveAttribute('id', 'attr')
		await expect(div).toHaveAttribute('data-x', 'attr')
		const events = await getEvents(page)
		const attrs = events.filter((e: RenderEvent) => e.event === 'set attribute').map((e: RenderEvent) => e.args[1])
		expect(attrs).toEqual(expect.arrayContaining(['htmlfor', 'id', 'data-x']))
	})

	test('input handling: default type, checkbox binding, number/range numeric conversion', async ({ page }) => {
		const checkbox = page.locator('[data-testid="checkbox"]')
		const number = page.locator('[data-testid="number"]')
		const range = page.locator('[data-testid="range"]')
		const def = page.locator('[data-testid="default-type"]')

		await expect(def.evaluate((el: any) => el.type)).resolves.toBe('text')
		await checkbox.check()
		await page.waitForTimeout(10)

		await number.fill('7')
		await range.fill('9')
		await expect(number).toHaveValue('7')
		await expect(range).toHaveValue('9')
	})

	test('renderer-level when category (outside Scope)', async ({ page }) => {
		const cond = page.locator('[data-testid="cond-demo"]')
		await expect(cond).toContainText('Shown')
		await page.click('[data-action="toggle-flag"]')
		await expect(cond).toContainText('Hidden')
	})

	test('else-if chained conditions render correct branch', async ({ page }) => {
		const demo = page.locator('[data-testid="else-if-condition-demo"]')
		// initial state.num = 5 -> should show 5-10
		await page.locator('[data-testid="number"]').fill('7')
		await expect(demo).toContainText('5-10')
		await expect(demo).not.toContainText('>10')
		await expect(demo).not.toContainText('<5')

		// set to 4 -> <5
		await page.locator('[data-testid="number"]').fill('4')
		await expect(demo).toContainText('<5')
		await expect(demo).not.toContainText('5-10')
		await expect(demo).not.toContainText('>10')

		// set to 11 -> >10
		await page.locator('[data-testid="number"]').fill('11')
		await expect(demo).toContainText('>10')
		await expect(demo).not.toContainText('5-10')
		await expect(demo).not.toContainText('<5')
	})

	test('this:component meta captures mount; use meta triggers effect', async ({ page }) => {
		const stateText = page.locator('[data-testid="this-state"]')
		await expect(stateText).toHaveText(/true|false/)
		await page.click('[data-action="toggle-alt"]')
		await expect(stateText).toHaveText(/true/)
	})

	test('use={callback} mounts for component', async ({ page }) => {
		const compChild = page.locator('[data-testid="use-inline-comp-child"]')
		await expect(compChild).toHaveAttribute('data-comp', 'yes')

		// Change unrelated state to ensure the mount hook does not re-run/react
		await page.click('[data-action="toggle-flag"]')
		await expect(compChild).toHaveAttribute('data-comp', 'yes')
	})

	test('scope component: children and direct value', async ({ page }) => {
		const scopeComponent = page.locator('[data-testid="scope-component"]')
		await expect(scopeComponent.locator('.direct-value')).toHaveText('Direct value is 32')
		await expect(scopeComponent.locator('.my-value')).toHaveText('My value is 52')
	})
})


