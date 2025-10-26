/**
 * Main entry point for Pounce-TS application
 */

import { h } from '.'
import { atomic, reactive } from 'mutts/src'
import MiniCounterComponent from './components/MiniCounter'
// Initialize the app
document.addEventListener('DOMContentLoaded', atomic(() => {
	const app = document.getElementById('app')
	
	if (!app) {
		console.error('App container not found')
		return
	}
	
	const state = reactive({
		list: [],
	})
	// Add components using PascalCase JSX with children
	const componentsMount = (
		<div>
			<div> list: {state.list.join(', ')}</div>
			<MiniCounterComponent
				list={state.list}
			/>
		</div>
	)
	app.appendChild(componentsMount.mount())
}))