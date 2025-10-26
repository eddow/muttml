/**
 * Counter Web Component using inline JSX templating
 */

import { PounceComponent } from '..'
import CounterCSS from './Counter.scss?inline'

export default class CounterWebComponent extends PounceComponent(
	(_: {
		count: number
		onCountIncremented?: (newCount: number) => void
		onCountDecremented?: (newCount: number) => void
		onCountReset?: () => void
		onCountChanged?: (newCount: number, oldCount: number) => void
	}) => ({
		maxValue: 100,
		minValue: 0,
		step: 1,
		disabled: false,
		showSlider: true,
		showInput: true,
		label: 'Counter Component (JSX)',
	})
) {
	public mount(): void {
		console.log('🎯 Counter component mounted!', {
			initialCount: this.count,
			context: this.context,
		})
	}

	public unmount(): void {
		console.log('👋 Counter component unmounted!', {
			finalCount: this.count,
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
					<h2>{this.label}</h2>
					<div class="count-display">
						Count: <span class="counter-text">{this.count}</span>
					</div>
					<div class="message">
						{this.count === 0 ? 'Click the button to increment!' : `Current count: ${this.count}`}
					</div>
					{this.showSlider && (
						<div class="slider-container">
							<label class="slider-label" htmlFor="count-slider">
								Set Count: {this.count}
							</label>
							<input
								type="range"
								id="count-slider"
								class="slider"
								min={this.minValue}
								max={this.maxValue}
								step={this.step}
								value={this.count}
								disabled={this.disabled || this.maxValue === this.minValue}
							/>
						</div>
					)}
					{this.showInput && (
						<div class="input-container">
							<label class="input-label" htmlFor="count-input">
								Direct Input:
							</label>
							<input
								type="number"
								id="count-input"
								class="count-input"
								min={this.minValue}
								max={this.maxValue}
								step={this.step}
								value={this.count}
								disabled={this.disabled || this.maxValue === this.minValue}
							/>
						</div>
					)}
					<div class="controls">
						<button class="decrement" disabled={this.disabled || this.count <= this.minValue} onClick={() => this.decrement()}>
							-
						</button>
						<button class="reset" disabled={this.disabled || this.count === this.minValue} onClick={() => this.reset()}>
							Reset
						</button>
						<button class="increment" disabled={this.disabled || this.count >= this.maxValue} onClick={() => this.increment()}>
							+
						</button>
					</div>
				</div>
			</div>
		)
	}
	private increment(): void {
		const oldCount = this.count
		this.count = this.count + 1
		this.onCountIncremented?.(this.count)
		this.onCountChanged?.(this.count, oldCount)
	}

	private decrement(): void {
		const oldCount = this.count
		this.count = this.count - 1
		this.onCountDecremented?.(this.count)
		this.onCountChanged?.(this.count, oldCount)
	}

	private reset(): void {
		const oldCount = this.count
		this.count = 0
		this.onCountReset?.()
		this.onCountChanged?.(this.count, oldCount)
	}
}
