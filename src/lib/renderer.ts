import { atomic, computed, effect, reactive, unwrap } from 'mutts/src'
import { PounceElement } from '..'
import { classNames } from './classNames'
import { storeCleanupForElement } from './cleanup'
import { namedEffect } from './debug'
import { Child, processChildren } from './processChildren'
import { getComponent } from './registry'

/**
 * Custom h() function for JSX rendering - returns a mount function
 */
export const h = (tag: any, props: Record<string, any> = {}, ...children: Child[]): JSX.Element => {
	// Get component constructor - either direct class or from registry
	let ComponentCtor: any = null

	if (typeof tag === 'function' && tag.prototype && 'template' in tag.prototype) {
		// Direct component class (PascalCase)
		ComponentCtor = tag
	} else if (typeof tag === 'string' && getComponent(tag)) {
		// Registered component
		ComponentCtor = getComponent(tag)!
	}

	// If we have a component, return mount function
	if (ComponentCtor) {
		const host = new PounceElement()
		const shadow = host.shadowRoot!

		const computedProps = reactive<any>({})
		for (const [key, value] of Object.entries(props || {})) {
			if (!key.startsWith('on:') && key !== 'style') {
				// Check for 2-way binding object {get:, set:}
				if (typeof value === 'object' && value !== null && 'get' in value && 'set' in value) {
					Object.defineProperty(computedProps, key, {
						get: () => computed(value.get),
						set: (newValue) => value.set(newValue),
						enumerable: true,
					})
				} else if (typeof value === 'function') {
					// One-way binding
					Object.defineProperty(computedProps, key, {
						get: () => computed(value),
						enumerable: true,
					})
				} else {
					// Static value
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

		// Handle component events from props
		for (const [key, value] of Object.entries(props || {})) {
			if (key.startsWith('on:')) {
				const eventName = key.slice(3) // Remove 'on:' prefix
				// Register the event listener on the component
				const eventCleanup = namedEffect('eventRegister', () => {
					return instance.on(eventName as any, atomic(value?.get?.() ?? value()))
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
		const styleCleanup = namedEffect('style', () => {
			const instStyle = instance.style as string | undefined

			// Use adoptedStyleSheets for instance styles
			if (instStyle) {
				const styleSheet = new CSSStyleSheet()
				styleSheet.replaceSync(instStyle)
				shadow.adoptedStyleSheets = [shadow.adoptedStyleSheets[0], styleSheet].filter(Boolean)
			}
		})
		storeCleanupForElement(host, styleCleanup)
		return {
			mount(context: Record<PropertyKey, any> = {}) {
				// Set context on the component instance
				instance.context = context = Object.create(context)

				function describeTemplate() {
					return instance.template.mount(context)
				}
				/*
				// Call mount lifecycle hook
				if (typeof instance.mount === 'function') {
					instance.mount()
				}*/
				// Effect for content - only updates content container
				const contentCleanup = namedEffect('setShadow', () => {
					const template = computed(describeTemplate)
					// template is already a DOM element from h()
					shadow.replaceChildren(unwrap(template))
				})
				storeCleanupForElement(host, contentCleanup)

				return host
			},
		}
	}

	const element = document.createElement(tag)

	// Set properties
	for (const [key, value] of Object.entries(props || {})) {
		if (key === 'children') continue // Skip children, we'll handle them separately

		if (key.startsWith('on:')) {
			// Event handler
			const eventType = key.slice(3).toLowerCase()
			const eventCleanup = namedEffect(key, () => {
				const registeredEvent = atomic(value.get?.() ?? value())
				element.addEventListener(eventType, registeredEvent)
				return () => element.removeEventListener(eventType, registeredEvent)
			})
			storeCleanupForElement(element, eventCleanup)
		} else if (key === 'class') {
			if (typeof value === 'function') {
				// Reactive class (e.g., `class={() => ['btn', { active: this.isActive }]}`)
				const classCleanup = namedEffect('className', () => {
					element.className = classNames(value())
				})
				storeCleanupForElement(element, classCleanup)
			} else {
				// Static class
				element.className = classNames(value)
			}
		} else if (typeof value === 'object' && value !== null && 'get' in value && 'set' in value) {
			// 2-way binding for regular elements (e.g., `value={{get: () => this.value, set: val => this.value = val}}`)
			const propCleanup = namedEffect(`prop:${key}`, () => {
				element[key] = value.get()
			})
			storeCleanupForElement(element, propCleanup)
			if (tag === 'input') {
				element.addEventListener('input', (e: Event) => {
					const element = e.target as HTMLInputElement
					switch (element.type) {
						case 'checkbox':
							if (key === 'checked') value.set(element.checked)
							break
						case 'number':
							if (key === 'value') value.set(Number(element.value))
							break
						default:
							if (key === 'value') value.set(element.value)
					}
				})
			}
		} else if (typeof value === 'function') {
			// Reactive prop (e.g., `prop={() => this.counter}`)
			const propCleanup = namedEffect(`prop:${key}`, () => {
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

	// Create plain HTML element - also return mount object for consistency
	return {
		mount(context: Record<PropertyKey, any> = {}) {
			function mounted(x: any) {
				return x && typeof x === 'object' && 'mount' in x ? x.mount(context) : x
			}
			children = Array.isArray(children) ? children.map(mounted) : mounted(children)
			// Enhanced children management with better array and .map() support
			const childrenCleanup = effect(function mountChildren() {
				// Render children
				if (children && !props?.innerHTML) {
					// Process new children
					const processedChildren = processChildren(children, context)

					// Replace children
					element.replaceChildren(...unwrap(processedChildren.map(unwrap)))

					// Return cleanup function
					return processedChildren.stop
				}
			})
			storeCleanupForElement(element, childrenCleanup)

			return element
		},
	}
}

// Optional: Add JSX support for fragments
export const Fragment = (props: { children: Child[] }) => props.children
// Make h available globally
;(globalThis as any).h = h
