/**
 * Main entry point for Pounce-TS application
 */

import { h } from '.'
import { reactive } from 'mutts/src'
import MiniCounterComponent from './components/MiniCounter'
// Initialize the app
document.addEventListener('DOMContentLoaded', (): void => {
	const app = document.getElementById('app')
	
	if (!app) {
		console.error('App container not found')
		return
	}
	
	const state = reactive({
		sharedCount: 5,
	})
	// Add components using PascalCase JSX with children
	const componentsMount = (
		<div>
			<MiniCounterComponent
				count={state.sharedCount}
			/>
		</div>
	)
	app.appendChild(componentsMount.mount())
})