/**
 * Wrapper Component to demonstrate children usage
 */

import { defaulted } from '../lib'
import './Wrapper.scss'

export default function WrapperComponent(props: {
	title?: string
	description?: string
	class?: string
	showChildren?: boolean
	maxChildren?: number
	children?: JSX.Element | JSX.Element[]
	tag?: keyof JSX.IntrinsicElements
}) {
	const state = defaulted(props, {
		title: 'Wrapper Component',
		description: 'This wrapper contains children:',
		class: 'wrapper',
		showChildren: true,
		tag: 'div',
	})

	const childrenArray = Array.isArray(state.children)
		? state.children
		: state.children
			? [state.children]
			: []
	const childrenToShow = () =>
		state.maxChildren ? childrenArray.slice(0, state.maxChildren) : childrenArray
	return (
		<dynamic tag={state.tag} class={state.class}>
			<h3>{state.title}</h3>
			<p>{state.description}</p>
			{state.showChildren && <div class="children">{childrenToShow()}</div>}
		</dynamic>
	)
}
