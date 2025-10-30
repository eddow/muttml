/**
 * Main entry point for Pounce-TS application
 */

import { computed, effect, reactive, trackEffect } from 'mutts/src'
import { bindApp } from './lib'
import { defaulted } from './lib/utils'

function MiniCounter(
	props: { list?: string[]; addedText?: string },
	scope: Record<PropertyKey, any>
) {
	trackEffect((obj, evolution) => {
		console.log(obj, evolution)
	})
	const state = defaulted(props, { list: [] as string[], addedText: Date.now().toString() })
	console.log('🎯 Counter component mounted!', { scope: scope })
	effect(() => {
		return () => {
			console.log('🎯 Counter component unmounted!', { finalList: state.list.join(', ') })
		}
	})
	function add() {
		state.list.push(state.addedText)
		state.addedText = Date.now().toString()
	}
	function removeAll() {
		state.list.length = 0
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
			<button if={state.list.length > 0} class="remove-all" onClick={removeAll}>
				Remove All
			</button>
		</>
	)
}

const state = reactive({
	list: [] as string[],
})
// Add components using PascalCase JSX with children
const app = ()=> (
	<>
		<div>
			List: <span>{state.list.join(', ')}</span>
		</div>
		<MiniCounter list={state.list} />
	</>
)

// Initialize the app using the automated bindApp helper
bindApp(app, '#mini')
