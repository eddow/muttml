import { reactive } from 'mutts/src'
import { Scope, For } from '../../src/lib/index.ts'

const state = reactive({
	visible: true,
	items: ['item1', 'item2', 'item3'],
	count: 0,
})

const fixtureControls = {
	toggleVisible() {
		state.visible = !state.visible
	},
	increment() {
		state.count++
	},
	reset() {
		state.visible = true
		state.count = 0
	},
}

declare global {
	interface Window {
		__scopeFixture?: typeof fixtureControls
	}
}

window.__scopeFixture = fixtureControls

const ScopeFixtureApp = () => (
	<main>
		<h1>Scope Component Fixture</h1>
		<p>Testing conditional rendering with Scope component.</p>
		
		<section class="controls">
			<button data-action="toggle" onClick={() => fixtureControls.toggleVisible()}>
				Toggle Visibility
			</button>
			<button data-action="increment" onClick={() => fixtureControls.increment()}>
				Increment Count
			</button>
			<button data-action="reset" onClick={() => fixtureControls.reset()}>
				Reset
			</button>
		</section>

		<section class="output">
		<div data-testid="visible-content">
			<Scope visible={state.visible}>
				<p if:visible class="visible">Content is visible (count: {state.count})</p>
				<p else:visible class="hidden">Content is hidden</p>
			</Scope>
		</div>

		<div data-testid="conditional-list">
			<Scope hasItems={state.items.length > 0}>
				<div if:hasItems class="has-items">
					<p>Items:</p>
					<ul>
						<For each={state.items}>{(item: string) => <li>{item}</li>}</For>
					</ul>
				</div>
				<div else:hasItems class="no-items">
					<p>No items</p>
				</div>
			</Scope>
		</div>

		<div data-testid="count-display">
			<Scope highCount={state.count >= 5}>
				<p if:highCount class="high">Count is high: {state.count}</p>
				<p else:highCount class="low">Count is low: {state.count}</p>
			</Scope>
		</div>
		</section>
	</main>
)

export default ScopeFixtureApp
