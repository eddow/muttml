/**
 * Wrapper Component to demonstrate children usage
 */

import './Wrapper.scss'
import { defaulted } from '../lib/utils'

export default function WrapperComponent(
	props: {
		title?: string
		description?: string
		className?: string
		showChildren?: boolean
		maxChildren?: number
		children?: JSX.Element | JSX.Element[]
	}
) {
	const state = defaulted(props, {
		title: 'Wrapper Component',
		description: 'This wrapper contains children:',
		className: 'wrapper',
		showChildren: true,
	})

	const childrenArray = Array.isArray(state.children)
		? state.children
		: (state.children ? [state.children] : [])
	const childrenToShow = () => (state.maxChildren ? childrenArray.slice(0, state.maxChildren) : childrenArray)

	return (
		<div class={state.className}>
			<h3>{state.title}</h3>
			<p>{state.description}</p>
			{state.showChildren && <div class="children">{childrenToShow()}</div>}
		</div>
	)
}
