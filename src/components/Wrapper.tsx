/**
 * Wrapper Component to demonstrate children usage
 */

import { h, PounceComponent, PounceElement } from '..'
import WrapperCSS from './Wrapper.scss?inline'

class WrapperComponent extends PounceComponent<{}> {
	constructor(props: Record<string, any> = {}, children: any[] = [], host: PounceElement) {
		super(props, children, host)
	}

	static readonly style = WrapperCSS

	get template() {
		return (
			<div class="wrapper">
				<h3>Wrapper Component</h3>
				<p>This wrapper contains children:</p>
				<div class="children">
					{this.children}
				</div>
			</div>
		)
	}
}

export default WrapperComponent
