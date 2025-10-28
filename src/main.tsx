/**
 * Main entry point for Pounce-TS application
 */

import { atomic, reactive } from 'mutts/src'
import CounterComponent from './components/Counter'
import TodoComponent from './components/Todo'
import WrapperComponent from './components/Wrapper'

// Initialize the app
document.addEventListener(
	'DOMContentLoaded',
	atomic((): void => {
		const app = document.getElementById('app')

		if (!app) {
			console.error('App container not found')
			return
		}

		// Create a reactive state for 2-way binding demo
		const state = reactive({
			sharedCount: 5,
			parentMessage: 'Parent controls this counter',
		})

		// Add some introductory content using inline JSX
		const introElementMount = (
			<div>
				<div style="text-align: center; margin-bottom: 30px;">
					<p style="color: #666; font-size: 18px;">
						Simple web components built with TypeScript, Vite, and custom elements using JSX.
					</p>
					<p style="color: #888; font-size: 14px;">
						The components below use inline JSX templating with our custom h() function - now with
						2-way binding support!
					</p>
					<div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
						<h3 style="margin: 0 0 10px 0; color: #333;">🎯 Features:</h3>
						<ul style="margin: 0; padding-left: 20px; color: #555;">
							<li>TypeScript support with full type safety</li>
							<li>Inline JSX syntax with custom h() function</li>
							<li>Shadow DOM for component isolation</li>
							<li>Custom elements with lifecycle hooks</li>
							<li>Clean, simple component architecture</li>
							<li>
								<strong>2-way binding with auto-detection!</strong>
							</li>
						</ul>
					</div>
					<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
						<h3 style="margin: 0 0 10px 0; color: #333;">🔄 2-Way Binding Demo:</h3>
						<p style="margin: 0; color: #555;">
							The counter below uses 2-way binding: <code>count={state.sharedCount}</code>
						</p>
						<p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
							Parent count: <strong>{state.sharedCount}</strong> | {state.parentMessage}
						</p>
					</div>
				</div>
			</div>
		)

		app.appendChild(introElementMount.render())
		const todos = reactive([])
		// Add components using PascalCase JSX with children
		const componentsMount = (
			<div>
				<div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
					<h3>Regular DOM Element 2-Way Binding Test</h3>
					<p>This input is bound to the same state as the counter:</p>
					<input
						value={state.sharedCount}
						style="padding: 8px; margin: 5px; border: 1px solid #ccc; border-radius: 4px;"
					/>
					<p style="margin: 5px 0; color: #666;">
						Input value: <strong>{state.sharedCount}</strong>
					</p>
				</div>
				<CounterComponent
					count={state.sharedCount}
					onCountChanged={(newCount: number, oldCount: number) => {
						console.log(`Counter changed from ${oldCount} to ${newCount}`)
						state.parentMessage = `Parent updated: ${newCount}`
					}}
					onCountIncremented={(newCount: number) => {
						console.log(`Counter incremented to ${newCount}`)
					}}
					onCountDecremented={(newCount: number) => {
						console.log(`Counter decremented to ${newCount}`)
					}}
					onCountReset={() => {
						console.log('Counter was reset')
					}}
				/>
				<WrapperComponent>
					<TodoComponent todos={todos} />
				</WrapperComponent>
			</div>
		)
		app.appendChild(componentsMount.render())
	})
)
