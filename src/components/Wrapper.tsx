/**
 * Wrapper Component to demonstrate children usage
 */

import { PounceComponent } from '..'
import WrapperCSS from './Wrapper.scss?inline'


class WrapperComponent extends PounceComponent(() => ({
	title: 'Wrapper Component',
	description: 'This wrapper contains children:',
	className: 'wrapper',
	showChildren: true,
	maxChildren: undefined,
})) {
	static readonly style = WrapperCSS

	get template() {
		const title = () => this.title ?? 'Wrapper Component'
		const description = () => this.description ?? 'This wrapper contains children:'
		const className = () => this.className ?? 'wrapper'
		const showChildren = () => this.showChildren ?? true
		const maxChildren = () => this.maxChildren

		// Use children from constructor or props
		const children = this.children

		// Limit children if maxChildren is specified
		const childrenToShow = maxChildren() ? children.slice(0, maxChildren()) : children

		return (
			<div class={className()}>
				<h3>{title()}</h3>
				<p>{description()}</p>
				{showChildren() && <div class="children">{childrenToShow}</div>}
			</div>
		)
	}
}

export default WrapperComponent
