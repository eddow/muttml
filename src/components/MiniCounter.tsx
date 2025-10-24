/**
 * Counter Web Component using inline JSX templating
 */

import { h, PounceComponent } from '..'
import CounterCSS from './Counter.scss?inline'

// Define the component props interface
interface MiniCounterComponentProps {
	count?: number
}

// Define the events this component can emit
interface CounterEvents extends Record<string, (...args: any[]) => void> {
}

export default class MiniCounterWebComponent extends PounceComponent<CounterEvents, MiniCounterComponentProps> {

	// Getter for 2-way binding support
	get count() {
		return this.props.count ?? 0
	}

	// Setter for 2-way binding support  
	set count(value: number) {
		this.props.count = value
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

	get template() {

		return (
			<div>
				<button class="decrement" on:click={() => this.decrement()}>
					-
				</button>
				<div class="input-container">

					<input
						type="number"
						id="count-input"
						class="count-input"
						value={this.count}
					/>
				</div>
				<button class="increment" on:click={() => this.increment()}>
					+
				</button>
			</div>
		)
	}

	private increment(): void {
		this.count = this.count + 1
	}

	private decrement(): void {
		this.count = this.count - 1
	}
}
