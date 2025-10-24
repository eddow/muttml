/**
 * Wrapper Component to demonstrate children usage
 */

import { h, PounceComponent, PounceElement } from '..'
import WrapperCSS from './Wrapper.scss?inline'

// Define the props interface for type validation
interface WrapperProps {
	title?: string
	description?: string
	className?: string
	showChildren?: boolean
	maxChildren?: number
}

class WrapperComponent extends PounceComponent<{}, WrapperProps> {
	constructor(props: WrapperProps = {}, children: Element[] = [], host: PounceElement) {
		super(props, children, host)
	}

	static readonly style = WrapperCSS

	get template() {
		const title = this.props.title ?? 'Wrapper Component'
		const description = this.props.description ?? 'This wrapper contains children:'
		const className = this.props.className ?? 'wrapper'
		const showChildren = this.props.showChildren ?? true
		const maxChildren = this.props.maxChildren
		
		// Use children from constructor or props
		const children = this.children
		
		// Limit children if maxChildren is specified
		const childrenToShow = maxChildren 
			? children.slice(0, maxChildren)
			: children

		return (
			<div class={className}>
				<h3>{title}</h3>
				<p>{description}</p>
				{showChildren && (
					<div class="children">
						{childrenToShow}
					</div>
				)}
			</div>
		)
	}
}

export default WrapperComponent
