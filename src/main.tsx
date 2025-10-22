/**
 * Main entry point for MuttML application
 */

import { h } from './muttml'
import CounterComponent from './components/Counter'
import TodoComponent from './components/Todo'
import WrapperComponent from './components/Wrapper'

// Initialize the app
document.addEventListener('DOMContentLoaded', (): void => {
	const app = document.getElementById('app')
	
	if (!app) {
		console.error('App container not found')
		return
	}
	
	// Add some introductory content using inline JSX
	const introElement = (
		<div>
			<div style="text-align: center; margin-bottom: 30px;">
				<p style="color: #666; font-size: 18px;">
					Simple web components built with TypeScript, Vite, and custom elements using JSX.
				</p>
				<p style="color: #888; font-size: 14px;">
					The components below use inline JSX templating with our custom h() function - ready for you to add your own reactivity layer!
				</p>
				<div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
					<h3 style="margin: 0 0 10px 0; color: #333;">🎯 Features:</h3>
					<ul style="margin: 0; padding-left: 20px; color: #555;">
						<li>TypeScript support with full type safety</li>
						<li>Inline JSX syntax with custom h() function</li>
						<li>Shadow DOM for component isolation</li>
						<li>Custom elements with lifecycle hooks</li>
						<li>Clean, simple component architecture</li>
						<li>Ready for reactivity implementation</li>
					</ul>
				</div>
			</div>
		</div>
	)

	app.appendChild(introElement)
	
	// Add components using PascalCase JSX with children
	const components = (
		<div>
			<WrapperComponent>
				<CounterComponent
					count={10}
					on:countChanged={(newCount: number, oldCount: number) => {
						console.log(`Counter changed from ${oldCount} to ${newCount}`)
					}}
					on:countIncremented={(newCount: number) => {
						console.log(`Counter incremented to ${newCount}`)
					}}
					on:countDecremented={(newCount: number) => {
						console.log(`Counter decremented to ${newCount}`)
					}}
					on:countReset={() => {
						console.log('Counter was reset')
					}}
				/>
			</WrapperComponent>
			<WrapperComponent>
				<TodoComponent />
			</WrapperComponent>
		</div>
	)
	app.appendChild(components)
})