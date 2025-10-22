/**
 * Counter Web Component using inline JSX templating
 */

import { reactive } from 'mutts/src'
import { h } from './h.js'
import MuttComponent from './MuttComponent.js'

@reactive
class CounterWebComponent extends MuttComponent {
	private count: number = 0

	constructor() {
		super()
	}

	static style = `
		:host {
			display: block;
		}
	`

	get style() {
		return `
			:host {
				display: block;
				padding: 20px;
				border: 2px solid #667eea;
				border-radius: 8px;
				margin: 20px 0;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			}
			
			h2 {
				color: #333;
				margin-top: 0;
			}
			
			.count-display {
				margin: 15px 0;
				font-size: 18px;
				font-weight: bold;
				color: #667eea;
			}
			
			.message {
				margin: 15px 0;
				color: #666;
			}
			
			.controls {
				display: flex;
				gap: 10px;
				margin-top: 20px;
			}
			
			button {
				padding: 10px 20px;
				border: none;
				border-radius: 4px;
				cursor: pointer;
				font-size: 16px;
				transition: all 0.2s ease;
			}
			
			button:hover {
				transform: translateY(-1px);
				box-shadow: 0 2px 5px rgba(0,0,0,0.2);
			}
			
			.decrement {
				background: #ff6b6b;
				color: white;
			}
			
			.reset {
				background: #ffa726;
				color: white;
			}
			
			.increment {
				background: #4caf50;
				color: white;
			}
		`
	}

	get template() {
		return (
			<div>
				<div>
					<h2>Counter Component (JSX)</h2>
					<div className="count-display">
						Count: <span>{this.count}</span>
					</div>
					<div className="message">
						{this.count === 0 ? 'Click the button to increment!' : `Current count: ${this.count}`}
					</div>
					<div className="controls">
						<button className="decrement" onClick={() => this.decrement()}>
							-
						</button>
						<button className="reset" onClick={() => this.reset()}>
							Reset
						</button>
						<button className="increment" onClick={() => this.increment()}>
							+
						</button>
					</div>
				</div>
			</div>
		)
	}

	private increment(): void {
		this.count += 1
	}

	private decrement(): void {
		this.count -= 1
	}

	private reset(): void {
		this.count = 0
	}
}

export default CounterWebComponent