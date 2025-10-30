/**
 * Main entry point for Pounce-TS application
 */

import { computed, effect, reactive, trackEffect } from 'mutts/src'
import { bindApp } from './lib'
import { defaulted } from './lib/utils'

function ResizeSandbox(_props: {}, scope: Record<PropertyKey, any>) {
	const size = reactive({ width: 0, height: 0 })

	// Define mixin on scope: resize(target, value, scope)
	scope.resize = (target: Node | Node[], value: any, _scope: Record<PropertyKey, any>) => {
		const element = Array.isArray(target) ? target[0] : target
		if (!(element instanceof HTMLElement)) return
		const observer = new ResizeObserver((entries) => {
			const rect = entries[0].contentRect
			size.width = Math.round(rect.width)
			size.height = Math.round(rect.height)
			if (typeof value === 'function') value(size.width, size.height)
		})
		observer.observe(element)
		return () => observer.disconnect()
	}

	return (
		<>
			<h3>Resize Sandbox</h3>
			<div
				style="resize: both; overflow: auto; border: 1px solid #ccc; padding: 8px; min-width: 120px; min-height: 80px;"
				use:resize={(w: number, h: number) => {
					size.width = w
					size.height = h
				}}
			>
				Resize me
				<div style="margin-top: 8px; color: #555;">
					{size.width} × {size.height}
				</div>
			</div>
		</>
	)
}

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
const App = () => (
	<>
		<div>
			List: <span>{state.list.join(', ')}</span>
		</div>
		<MiniCounter list={state.list} />
		<ResizeSandbox />
	</>
)

// Initialize the app using the automated bindApp helper
bindApp(<App />, '#mini')
