/**
 * Main entry point for Pounce-TS application
 */

import { computed, effect, reactive } from 'mutts/src'
import { reconcileChildren } from './lib/renderer'
import { defaulted } from './lib/utils'

function MiniCounter(
	props: { list?: string[]; addedText?: string },
	context: Record<PropertyKey, any>
) {
	const state = defaulted(props, { list: [] as string[], addedText: Date.now().toString() })
	console.log('🎯 Counter component mounted!', { context: context })
	effect(() => {
		return () => {
			console.log('🎯 Counter component unmounted!', { finalList: state.list.join(', ') })
		}
	})
	function add() {
		state.list.push(state.addedText)
		state.addedText = Date.now().toString()
	}
	return (
		<>
			<debug>
				{computed.map(state.list, (value, index) => (
					<button class="remove" onClick={() => state.list.splice(index, 1)}>
						{value}
					</button>
				))}
			</debug>
			<div>
				<input type="text" value={state.addedText} />
				<button class="add" onClick={add}>
					+
				</button>
			</div>
		</>
	)
}

const state = reactive({
	list: [] as string[],
})
// Add components using PascalCase JSX with children
const app = (
	<>
		<div>
			List: <span>{state.list.join(', ')}</span>
		</div>
		<MiniCounter list={state.list} />
	</>
).render()

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
	const appElement = document.getElementById('app')

	if (!appElement) {
		console.error('App container not found')
		return
	}
	reconcileChildren(appElement, app)
})
