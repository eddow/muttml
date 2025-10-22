/**
 * Counter Web Component using inline JSX templating
 */

import { h, MuttComponent } from '../muttml'
import CounterCSS from './Counter.scss?inline'

// Define the events this component can emit
interface CounterEvents extends Record<string, (...args: any[]) => void> {
	countChanged: (newCount: number, oldCount: number) => void
	countReset: () => void
	countIncremented: (newCount: number) => void
	countDecremented: (newCount: number) => void
}

export default class CounterWebComponent extends MuttComponent<CounterEvents> {
	private count: number = 0

	constructor(props: Record<string, any> = {}, children: any[] = [], host: HTMLElement) {
		super(props, children, host)
	}

	static readonly style = CounterCSS

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
					<div class="count-display">
						Count: <span class="counter-text">{this.count}</span>
					</div>
					<div class="message">
						{this.count === 0 ? 'Click the button to increment!' : `Current count: ${this.count}`}
					</div>
					<div class="slider-container">
						<label class="slider-label" htmlFor="count-slider">
							Set Count: {this.count}
						</label>
						<input
							type="range"
							id="count-slider"
							class="slider"
							min="0"
							max="100"
							value={this.count}
							on:input={(e: Event) => this.handleSliderChange(e)}
						/>
					</div>
					<div class="controls">
						<button class="decrement" on:click={() => this.decrement()}>
							-
						</button>
						<button class="reset" on:click={() => this.reset()}>
							Reset
						</button>
						<button class="increment" on:click={() => this.increment()}>
							+
						</button>
					</div>
				</div>
			</div>
		)
	}

	private increment(): void {
		const oldCount = this.count
		this.count += 1
		this.emit('countIncremented', this.count)
		this.emit('countChanged', this.count, oldCount)
	}

	private decrement(): void {
		const oldCount = this.count
		this.count -= 1
		this.emit('countDecremented', this.count)
		this.emit('countChanged', this.count, oldCount)
	}

	private reset(): void {
		const oldCount = this.count
		this.count = 0
		this.emit('countReset')
		this.emit('countChanged', this.count, oldCount)
	}

	private handleSliderChange(e: Event): void {
		const target = e.target as HTMLInputElement
		const oldCount = this.count
		this.count = parseInt(target.value, 10)
		this.emit('countChanged', this.count, oldCount)
	}
}
