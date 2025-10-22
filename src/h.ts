import { effect, unwrap } from 'mutts/src'

/**
 * Neutral custom element that does nothing but host Shadow DOM
 */
export class NeutralHost extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
	}
}
customElements.define('neutral-host', NeutralHost)

/**
 * Custom h() function for JSX rendering - returns DOM elements directly
 */

export const h = (tag: any, props: Record<string, any> = {}, ...children: any[]): Node => {
	// If tag is a component class (PascalCase), instantiate and render it
	if (typeof tag === 'function' && tag.prototype && 'template' in tag.prototype) {
		const host = new NeutralHost()
		const shadow = host.shadowRoot!
		const instance = new tag(props)

		// Inject static style once into document head
		if ((tag as any).style && typeof (tag as any).style === 'string') {
			const markerId = `mutt-static-style-${tag.name}`
			if (!document.getElementById(markerId)) {
				const styleEl = document.createElement('style')
				styleEl.id = markerId
				styleEl.textContent = (tag as any).style
				document.head.appendChild(styleEl)
			}
		}

		effect(() => {
			const template = instance.template
			const nodes: Node[] = []
			const instStyle = instance.style as string | undefined
			if (instStyle) {
				const styleEl = document.createElement('style')
				styleEl.textContent = instStyle
				nodes.push(styleEl)
			}
			// template is already a DOM element from h()
			nodes.push(unwrap(template))
			shadow.replaceChildren(...nodes)
		})
		return host
	}

	// If tag is a registered custom tag name
	if (typeof tag === 'string' && componentRegistry.has(tag)) {
		const Ctor = componentRegistry.get(tag)!
		const host = new NeutralHost()
		const shadow = host.shadowRoot!
		const instance = new Ctor(props)

		// Inject static style once into document head
		if ((Ctor as any).style && typeof (Ctor as any).style === 'string') {
			const markerId = `mutt-static-style-${tag}`
			if (!document.getElementById(markerId)) {
				const styleEl = document.createElement('style')
				styleEl.id = markerId
				styleEl.textContent = (Ctor as any).style
				document.head.appendChild(styleEl)
			}
		}

		effect(() => {
			const template = instance.template
			const nodes: Node[] = []
			const instStyle = instance.style as string | undefined
			if (instStyle) {
				const styleEl = document.createElement('style')
				styleEl.textContent = instStyle
				nodes.push(styleEl)
			}
			// template is already a DOM element from h()
			nodes.push(unwrap(template))
			shadow.replaceChildren(...nodes)
		})
		return host
	}

	// Create plain HTML element
	const element = document.createElement(tag)

	// Set properties
	Object.entries(props || {}).forEach(([key, value]) => {
		if (key === 'children') return // Skip children, we'll handle them separately

		if (key.startsWith('on') && typeof value === 'function') {
			// Event handler
			const eventType = key.slice(2).toLowerCase()
			element.addEventListener(eventType, value as EventListener)
		} else if (key === 'className') {
			effect(() => {
				element.className = String(value)
			})
		} else if (key === 'style' && typeof value === 'object') {
			// Style object
			effect(() => {
				Object.assign(element.style, value)
			})
		} else if (key === 'innerHTML') {
			effect(() => {
				element.innerHTML = String(value)
			})
		} else {
			// Regular attribute
			effect(() => {
				element.setAttribute(key, String(value))
			})
		}
	})

	effect(() => {
		// Render children
		if (children && !props?.innerHTML) {
			element.replaceChildren(...children)
		}
	})

	return element
}

// Registry to link JSX custom tags to component classes
const componentRegistry = new Map<string, new (...args: any[]) => any>()

export function registerComponent(tagName: string, ctor: new (...args: any[]) => any) {
	componentRegistry.set(tagName, ctor)
}

// Optional: Add JSX support for fragments
export const Fragment = (props: { children: any[] }) => props.children

// Make h available globally for JSX
declare global {
	namespace JSX {
		interface Element extends Node {}
		interface ElementClass {
			template: any
		}
		interface ElementAttributesProperty {
			props: {}
		}
		interface ElementChildrenAttribute {
			children: {}
		}
		interface IntrinsicElements {
			[elemName: string]: any
		}
	}
}

export default h
