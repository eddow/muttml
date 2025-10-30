import { computed, effect, ScopedCallback } from 'mutts/src'
import { bindChildren, For, Fragment, h, Scope } from './renderer'

export * from './registry'
export * from './utils'

const applicationRoots = new WeakMap<HTMLElement, ScopedCallback>()

export function bindApp(
	factory: () => JSX.Element,
	container: string | HTMLElement | (() => HTMLElement) = '#app'
) {
	function actuallyBind() {
		const appElement =
			typeof container === 'string'
				? (document.querySelector(container) as HTMLElement)
				: typeof container === 'function'
					? container()
					: container
		if (!appElement) {
			console.error('App container not found')
			return
		}
		const app = computed.self(factory)
		applicationRoots.set(
			appElement,
			effect(() => bindChildren(appElement, app.render()))
		)
	}
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', actuallyBind)
	} else {
		actuallyBind()
	}
	return actuallyBind
}

Object.assign(globalThis, { h, Fragment, Scope, For })
