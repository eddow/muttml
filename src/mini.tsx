/**
 * Main entry point for Pounce-TS application
 */

import { atomic, reactive } from 'mutts/src'
import MiniCounterComponent from './components/MiniCounter'

// Initialize the app
document.addEventListener(
	'DOMContentLoaded',
	atomic(() => {
		const app = document.getElementById('app')

		if (!app) {
			console.error('App container not found')
			return
		}

		const state = reactive({
			list: [] as string[],
		})
		// Add components using PascalCase JSX with children
		const componentsMount = (
			<MiniCounterComponent list={state.list} />
		)
		app.appendChild(componentsMount.render())
	})
)
