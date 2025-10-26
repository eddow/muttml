/**
 * Counter Web Component using inline JSX templating
 */

import { computed } from 'mutts/src'
import { h, PounceComponent } from '..'

// Define the component props interface
interface MiniCounterComponentProps {
	list?: string[]
}

// Define the events this component can emit
interface CounterEvents extends Record<string, (...args: any[]) => void> {
}

export default class MiniCounterWebComponent extends PounceComponent<CounterEvents, MiniCounterComponentProps> {

	// Getter for 2-way binding support
	get list() {
		this.props.list ??= []
		return this.props.list
	}

	// Setter for 2-way binding support  
	set list(value: string[]) {
		this.props.list = value
	}
	addedText: string = Date.now().toString()

	public mount(): void {
		console.log('🎯 Counter component mounted!', {
			context: this.context
		})
	}

	public unmount(): void {
		console.log('👋 Counter component unmounted!', {
			finalCount: this.list.length
		})
	}

	get template() {

		return (
			<div>
				<div>
					{
						computed.map(this.list, (item) => (
							<div>
								<input type="text" value={item.value} />
								<button class="increment" on:click={() => this.list.splice(item.index, 1)}>
									-
								</button>
							</div>
						))
					}
				</div>
				<div>
					<input type="text" value={this.addedText} />
					<button class="increment" on:click={() => this.add()}>
						+
					</button>
				</div>
			</div>
		)
	}

	private add(): void {
		this.list = [...this.list, this.addedText]
		this.addedText = Date.now().toString()
	}
}
