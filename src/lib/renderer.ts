import { computed, effect, reactive, unwrap } from 'mutts/src'
import { classNames } from './classNames'
import { storeCleanupForElement } from './cleanup'
import { NeutralHost } from './host'
import { Child, processChildren } from './processChildren'
import { getComponent } from './registry'

/**
 * Custom h() function for JSX rendering - returns DOM elements directly
 */
export const h = (tag: any, props: Record<string, any> = {}, ...children: Child[]): Node => {
	// Get component constructor - either direct class or from registry
	let ComponentCtor: any = null

	if (typeof tag === 'function' && tag.prototype && 'template' in tag.prototype) {
		// Direct component class (PascalCase)
		ComponentCtor = tag
	} else if (typeof tag === 'string' && getComponent(tag)) {
		// Registered component
		ComponentCtor = getComponent(tag)!
	}

	// If we have a component, render it
	if (ComponentCtor) {
		const host = new NeutralHost()
		const shadow = host.shadowRoot!

		const computedProps = reactive<any>({})
		for (const [key, value] of Object.entries(props || {})) {
			if (!key.startsWith('on:') && key !== 'style') {
				if (typeof value === 'function') {
					Object.defineProperty(computedProps, key, {
						get: () => computed(value),
						enumerable: true,
					})
				} else {
					Object.defineProperty(computedProps, key, {
						value: value,
						enumerable: true,
						writable: false,
					})
				}
			}
		}

		// Pass props, children, and host to component constructor
		const instance = new ComponentCtor(computedProps, children, host)
		function describeTemplate() {
			return instance.template
		}

		// Handle component events from props
		for (const [key, value] of Object.entries(props || {})) {
			if (key.startsWith('on:') && typeof value === 'function') {
				const eventName = key.slice(3) // Remove 'on:' prefix
				// Register the event listener on the component
				const eventCleanup = effect(() => {
					return instance.on(eventName as any, value())
				})
				storeCleanupForElement(host, eventCleanup)
			}
		}

		// Use adoptedStyleSheets for static styles
		const staticStyle = (ComponentCtor as any).style
		if (staticStyle && typeof staticStyle === 'string') {
			const styleSheet = new CSSStyleSheet()
			styleSheet.replaceSync(staticStyle)
			shadow.adoptedStyleSheets = [styleSheet]
		}

		// Effect for styles - only updates style container
		const styleCleanup = effect(() => {
			const instStyle = instance.style as string | undefined

			// Use adoptedStyleSheets for instance styles
			if (instStyle) {
				const styleSheet = new CSSStyleSheet()
				styleSheet.replaceSync(instStyle)
				shadow.adoptedStyleSheets = [shadow.adoptedStyleSheets[0], styleSheet].filter(Boolean)
			}
		})
		storeCleanupForElement(host, styleCleanup)

		// Effect for content - only updates content container
		const contentCleanup = effect(() => {
			const template = computed(describeTemplate)
			// template is already a DOM element from h()
			shadow.replaceChildren(unwrap(template))
		})
		storeCleanupForElement(host, contentCleanup)
		return host
	}

	// Create plain HTML element
	const element = document.createElement(tag)

	// Set properties
	for (const [key, value] of Object.entries(props || {})) {
		if (key === 'children') continue // Skip children, we'll handle them separately

		if (key.startsWith('on:') && typeof value === 'function') {
			// Event handler
			const eventType = key.slice(3).toLowerCase()
			const eventCleanup = effect(() => {
				const registeredEvent = value()
				element.addEventListener(eventType, registeredEvent)
				return () => element.removeEventListener(eventType, registeredEvent)
			})
			storeCleanupForElement(element, eventCleanup)
		} else if (key === 'class') {
			if (typeof value === 'function') {
				// Reactive class (e.g., `class={() => ['btn', { active: this.isActive }]}`)
				const classCleanup = effect(() => {
					element.className = classNames(value())
				})
				storeCleanupForElement(element, classCleanup)
			} else {
				// Static class
				element.className = classNames(value)
			}
		} else if (typeof value === 'function') {
			// Reactive prop (e.g., `prop={() => this.counter}`)
			const propCleanup = effect(() => {
				element[key] = value()
			})
			storeCleanupForElement(element, propCleanup)
		} else if (key === 'style' && typeof value === 'object') {
			// Style object
			Object.assign(element.style, value)
		} else if (key === 'innerHTML') {
			element.innerHTML = String(value)
		} else {
			// Regular attribute
			element.setAttribute(key, String(value))
		}
	}

	// Enhanced children management with better array and .map() support
	const childrenCleanup = effect(() => {
		// Render children
		if (children && !props?.innerHTML) {
			// Clean up old DOM children's effects
			/*const oldChildren = Array.from(element.children)
			oldChildren.forEach((child) => {
				if (child instanceof HTMLElement) {
					cleanupElementAndChildren(child)
				}
			})*/

			// Process new children
			const processedChildren = processChildren(children)

			const replaceChildrenCleanup = effect(() => {
				// Replace children
				element.replaceChildren(...unwrap(processedChildren.map(unwrap)))
			})

			// Return cleanup function
			return () => {
				processedChildren.stop?.()
				replaceChildrenCleanup()
			}
		}
	})
	storeCleanupForElement(element, childrenCleanup)

	return element
}

// Optional: Add JSX support for fragments
export const Fragment = (props: { children: Child[] }) => props.children

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
// Make h available globally
;(globalThis as any).h = h
