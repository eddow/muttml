/**
 * Counter Web Component using inline JSX templating
 */

import { h, PounceComponent } from '..'
import CounterCSS from './Counter.scss?inline'

// Define the events this component can emit
interface CounterEvents extends Record<string, (...args: any[]) => void> {
	countChanged: (newCount: number, oldCount: number) => void
	countReset: () => void
	countIncremented: (newCount: number) => void
	countDecremented: (newCount: number) => void
}

export default class CounterWebComponent extends PounceComponent<CounterEvents> {
	private count: number = 0

	constructor(props: {count?: number} = {}, children: any[] = [], host: HTMLElement) {
		super(props, children, host)
		this.count = props.count ?? 0
	}

	public mount(): void {
		console.log('🎯 Counter component mounted!', {
			initialCount: this.count,
			context: this.context
		})
	}

	public unmount(): void {
		console.log('👋 Counter component unmounted!', {
			finalCount: this.count
		})
	}

	static readonly style = CounterCSS

	get style() {
		// Calculate color based on counter value (0-100)
		// 0 = red, 100 = green
		const normalizedCount = Math.max(0, Math.min(100, this.count))
		const red = Math.round(255 * (1 - normalizedCount / 100))
		const green = Math.round(255 * (normalizedCount / 100))
		
		return `
			.counter-text {
				color: rgb(${red}, ${green}, 0);
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
					<div class="input-container">
						<label class="input-label" htmlFor="count-input">
							Direct Input:
						</label>
						<input
							type="number"
							id="count-input"
							class="count-input"
							min="0"
							max="100"
							value={this.count}
							on:input={(e: Event) => this.handleInputChange(e)}
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

	private handleInputChange(e: Event): void {
		const target = e.target as HTMLInputElement
		const oldCount = this.count
		const newValue = parseInt(target.value, 10)
		
		// Validate the input value
		if (!isNaN(newValue) && newValue >= 0 && newValue <= 100) {
			this.count = newValue
			this.emit('countChanged', this.count, oldCount)
		} else {
			// Reset to old value if invalid
			target.value = this.count.toString()
		}
	}
}
