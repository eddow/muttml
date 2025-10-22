import { Eventful, EventsBase, effect, reactive, unwrap } from 'mutts/src'
import { classNames } from './classNames'

/**
 * WeakMap to store cleanup functions associated with HTMLElements
 */
const elementCleanupMap = new WeakMap<HTMLElement, Set<() => void>>()

/**
 * FinalizationRegistry to detect when elements are garbage collected
 */
const cleanupRegistry = new FinalizationRegistry((heldValue: Set<() => void>) => {
	const cleanups = heldValue

	if (cleanups && cleanups.size > 0) {
		// Debug logging (can be removed in production)
		if (typeof window !== 'undefined' && (window as any).DEBUG_CLEANUP) {
			console.log(`[Cleanup] Element garbage collected, cleaning up ${cleanups.size} functions`)
		}

		// Call all cleanup functions
		for (const cleanup of cleanups) {
			try {
				cleanup()
				if (typeof window !== 'undefined' && (window as any).DEBUG_CLEANUP) {
					console.log(`[Cleanup] ✓ Cleanup function executed successfully`)
				}
			} catch (error) {
				console.warn('Error during element cleanup:', error)
			}
		}
	}
})

/**
 * Store a cleanup function for an element
 */
function storeCleanupForElement(element: HTMLElement, cleanup: () => void) {
	let cleanups = elementCleanupMap.get(element)
	if (!cleanups) {
		cleanups = new Set()
		elementCleanupMap.set(element, cleanups)

		// Register the element with FinalizationRegistry for GC cleanup
		// We register the element itself, and store the cleanup functions as the held value
		cleanupRegistry.register(element, cleanups)
	}
	cleanups.add(cleanup)

	// Debug logging (can be removed in production)
	if (typeof window !== 'undefined' && (window as any).DEBUG_CLEANUP) {
		console.log(`[Cleanup] Stored cleanup function for element:`, element.tagName, element)
	}
}

/**
 * Global hook to catch HTMLElement.toString() calls on proxied elements
 * This helps debug when elements are rendered as strings instead of being unwrapped
 */
function setupHTMLElementToStringHook() {
	const originalToString = HTMLElement.prototype.toString

	HTMLElement.prototype.toString = function () {
		// Check if this element is a proxy (has reactive properties)
		if (this && typeof this === 'object' && this.constructor === HTMLElement) {
			// Check for common proxy indicators
			const isProxy =
				Object.hasOwn(this, '__reactive__') ||
				Object.hasOwn(this, '__isProxy__') ||
				(this as any).__target !== undefined

			if (isProxy) {
				console.warn('🚨 HTMLElement.toString() called on proxied element:', {
					element: this,
					tagName: this.tagName,
					className: this.className,
					stack: new Error().stack,
				})
			}
		}

		return originalToString.call(this)
	}
}

// Set up the hook immediately
setupHTMLElementToStringHook()

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
 * Process children in template - replace {children} with actual children
 */
function processChildren(template: any, children: any[]): any {
	if (typeof template === 'string') {
		return template
	}

	if (template instanceof Node) {
		return template
	}

	if (template && typeof template === 'object') {
		// If it's a VNode-like object, process its children
		if (template.children) {
			const processedChildren = template.children.map((child: any) => {
				if (child === '{children}') {
					return children
				}
				return processChildren(child, children)
			})
			return { ...template, children: processedChildren.flat() }
		}
	}

	return template
}

/**
 * Custom h() function for JSX rendering - returns DOM elements directly
 */

export const h = (tag: any, props: Record<string, any> = {}, ...children: any[]): Node => {
	// Get component constructor - either direct class or from registry
	let ComponentCtor: any = null

	if (typeof tag === 'function' && tag.prototype && 'template' in tag.prototype) {
		// Direct component class (PascalCase)
		ComponentCtor = tag
	} else if (typeof tag === 'string' && componentRegistry.has(tag)) {
		// Registered component
		ComponentCtor = componentRegistry.get(tag)!
	}

	// If we have a component, render it
	if (ComponentCtor) {
		const host = new NeutralHost()
		const shadow = host.shadowRoot!

		// Pass props, children, and host to component constructor
		const instance = new ComponentCtor(props, children, host)

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

		// Create two containers in shadow DOM
		const styleContainer = document.createElement('div')
		const contentContainer = document.createElement('div')
		shadow.appendChild(styleContainer)
		shadow.appendChild(contentContainer)

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
			const template = instance.template
			const nodes: Node[] = []

			// template is already a DOM element from h()
			// If template contains {children}, replace it with actual children
			if (template && typeof template === 'object' && 'children' in template) {
				// Replace {children} with actual children
				const processedTemplate = processChildren(template, children)
				nodes.push(unwrap(processedTemplate))
			} else {
				nodes.push(unwrap(template))
			}
			contentContainer.replaceChildren(...nodes)
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

	//TODO: better management of children
	const childrenCleanup = effect(() => {
		// Render children
		if (children && !props?.innerHTML) {
			const processedChildren = children.flatMap((child) => {
				if (typeof child === 'function') {
					// Reactive child (e.g., `{() => this.counter}`)
					return unwrap(child())
				}
				return child
			})
			element.replaceChildren(...processedChildren)
		}
	})
	storeCleanupForElement(element, childrenCleanup)

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
// Make h available globally
;(globalThis as any).h = h

export abstract class MuttComponent<Events extends EventsBase> extends Eventful<Events> {
	protected props: Record<string, any>
	protected children: any[]
	protected host: HTMLElement

	constructor(props: Record<string, any> = {}, children: any[] = [], host: HTMLElement) {
		super()
		this.props = props
		this.children = children
		this.host = host
		// biome-ignore lint/correctness/noConstructorReturn: This is the whole point here
		return reactive(this)
	}
	public on(events: Partial<Events>): void
	public on<EventType extends keyof Events>(event: EventType, cb: Events[EventType]): () => void
	public on(...args: any[]): Events[keyof Events] {
		return super.on.apply(unwrap(this), args as any) as Events[keyof Events]
	}
	public off(events: Partial<Events>): void
	public off<EventType extends keyof Events>(event: EventType, cb: Events[EventType]): void
	public off(...args: any[]): void {
		super.off.apply(unwrap(this), args as any)
	}
	public emit<EventType extends keyof Events>(event: EventType, ...args: any[]): void {
		super.emit.apply(unwrap(this), [event, ...args] as any)
	}
	static get style(): string | undefined {
		return undefined
	}

	public abstract get template(): any

	public get style(): string | undefined {
		return undefined
	}
}
