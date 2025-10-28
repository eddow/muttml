/**
 * Counter Web Component using inline JSX templating
 */

import { computed } from 'mutts/src'
import { PounceComponent } from '..'

export default class MiniCounterWebComponent extends PounceComponent((_: { list: string[] }) => ({
	addedText: Date.now().toString(),
})) {
	public mount(): void {
		console.log('🎯 Counter component mounted!', {
			context: this.context,
		})
	}

	public unmount(): void {
		console.log('👋 Counter component unmounted!', {
			finalCount: this.list.length,
		})
	}

	get template() {
		return (
			<div>
				<debug>
				{computed.map(this.list, (value, index) => (
					<button class="remove" onClick={() => this.list.splice(index, 1)}>
						{value}
					</button>
				))}
				</debug>
				<div>
					<input type="text" value={this.addedText} />
					<button class="add" onClick={() => this.add()}>
						+
					</button>
				</div>
			</div>
		)
	}

	private add(): void {
		//this.list = [...this.list, this.addedText]
		this.list.push(this.addedText)
		this.addedText = Date.now().toString()
	}
}
