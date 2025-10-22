/**
 * Counter Web Component using inline JSX templating
 */

import { reactive } from 'mutts/src'
import { h, MuttComponent } from './muttml'

@reactive
export default class CounterWebComponent extends MuttComponent {
	private count: number = 0

	constructor(props: Record<string, any> = {}, children: any[] = [], host: HTMLElement) {
		super(props, children, host)
	}

	static style = `
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
		
		.slider-container {
			margin: 20px 0;
		}
		
		.slider {
			width: 100%;
			height: 6px;
			border-radius: 3px;
			background: #ddd;
			outline: none;
			-webkit-appearance: none;
		}
		
		.slider::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 20px;
			height: 20px;
			border-radius: 50%;
			background: #667eea;
			cursor: pointer;
		}
		
		.slider::-moz-range-thumb {
			width: 20px;
			height: 20px;
			border-radius: 50%;
			background: #667eea;
			cursor: pointer;
			border: none;
		}
		
		.slider-label {
			display: block;
			margin-bottom: 10px;
			font-weight: bold;
			color: #333;
		}
		:host {
			display: block;
			padding: 20px;
			border: 2px solid #667eea;
			border-radius: 8px;
			margin: 20px 0;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		}
	`

	get style() {
		// Calculate color based on counter value (0-100)
		// 0 = red, 100 = green
		const normalizedCount = Math.max(0, Math.min(100, this.count))
		const red = Math.round(255 * (1 - normalizedCount / 100))
		const green = Math.round(255 * (normalizedCount / 100))
		const blue = 0
		
		return `
			.counter-text {
				color: rgb(${red}, ${green}, ${blue});
				transition: color 0.3s ease;
			}
		`
	}

	get template() {
		return (
			<div>
				<div>
					<h2>Counter Component (JSX)</h2>
					<div className="count-display">
						Count: <span className="counter-text">{this.count}</span>
					</div>
					<div className="message">
						{this.count === 0 ? 'Click the button to increment!' : `Current count: ${this.count}`}
					</div>
					<div className="slider-container">
						<label className="slider-label" htmlFor="count-slider">
							Set Count: {this.count}
						</label>
						<input
							type="range"
							id="count-slider"
							className="slider"
							min="0"
							max="100"
							value={this.count}
							onInput={(e: Event) => this.handleSliderChange(e)}
						/>
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

	private handleSliderChange(e: Event): void {
		const target = e.target as HTMLInputElement
		this.count = parseInt(target.value, 10)
	}
}
