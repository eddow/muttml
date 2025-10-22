/**
 * Wrapper Component to demonstrate children usage
 */

import { h, MuttComponent } from './muttml'

class WrapperComponent extends MuttComponent {
	constructor(props: Record<string, any> = {}, children: any[] = [], host: HTMLElement) {
		super(props, children, host)
	}

	static style = `
		.wrapper {
			border: 2px solid #42b883;
			border-radius: 8px;
			padding: 20px;
			margin: 10px 0;
			background: #f8f9fa;
		}
		
		.wrapper h3 {
			margin-top: 0;
			color: #42b883;
		}
	`

	get template() {
		return (
			<div className="wrapper">
				<h3>Wrapper Component</h3>
				<p>This wrapper contains children:</p>
				<div className="children">
					{this.children}
				</div>
			</div>
		)
	}
}

export default WrapperComponent
