import { addBatchCleanup, atomic, computed, effect, reactive, untracked, unwrap } from 'mutts/src'
import { PounceElement } from '..'
import { classNames } from './classNames'
import { cleanupAllManagedChildren, storeCleanupForElement } from './cleanup'
import { namedEffect } from './debug'
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

		// Pass props, children, and host to component constructor
		const instance = new ComponentCtor(props, children, host)

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
	if (tag === 'input') {
		props.type ??= 'text'
		if (typeof props.type !== 'string')
			console.warn('input type must be a constant string', props.type)
	}
	// Set properties
	for (const [key, value] of Object.entries(props || {})) {
		if (key === 'children') continue // Skip children, we'll handle them separately

		if (/^on[A-Z]/.test(key)) {
			// Event handler
			const eventType = key.slice(2).toLowerCase()
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
				switch (element.type) {
					case 'checkbox':
						if (key === 'checked')
							element.addEventListener('input', () => {
								value.set(element.checked)
							})
						break
					case 'number':
						if (key === 'value')
							element.addEventListener('input', () => {
								value.set(Number(element.value))
							})
						break
					default:
						if (key === 'value')
							element.addEventListener('input', () => {
								value.set(element.value)
							})
						break
				}
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
			const mountedChildren = Array.isArray(children) ? children.map(mounted) : mounted(children)
			// Enhanced children management with better array and .map() support
			const childrenCleanup = effect(function mountChildren() {
				// Render children
				if (mountedChildren && !props?.innerHTML) {
					// Process new children
					const processedChildren = processChildren(mountedChildren, context)
					const redrawCleanup = namedEffect('redraw', () => {
						// Replace children
						reconcileChildren(element, processedChildren)
						addBatchCleanup(cleanupAllManagedChildren)
					})

					// Return cleanup function
					return () => {
						processedChildren.cleanup?.()
						redrawCleanup()
					}
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

function reconcileChildren(parent: Node, newChildren: Node[]) {
	console.log('reconcileChildren', parent, newChildren)
	// No need to precompute oldChildren as an array; work with live DOM
	let newIndex = 0

	// Iterate through newChildren and sync with live DOM
	while (newIndex < newChildren.length) {
		const newChild = unwrap(newChildren[newIndex])
		const oldChild = parent.childNodes[newIndex]

		if (oldChild === newChild) {
			// Node is already in the correct place → skip
			newIndex++
		} else {
			// Check if newChild exists later in the DOM
			let found = false
			for (let i = newIndex + 1; i < parent.childNodes.length; i++) {
				if (parent.childNodes[i] === newChild) {
					// Move the node to the correct position
					parent.insertBefore(newChild, oldChild)
					found = true
					break
				}
			}

			if (!found) {
				// Insert new node (or move from outside)
				parent.insertBefore(newChild, oldChild)
			}
			newIndex++
		}
	}

	// Remove extra old nodes (now safe because we're using live childNodes)
	while (parent.childNodes.length > newChildren.length) {
		parent.removeChild(parent.lastChild!)
	}
}

/**
 * Node descriptor - what a function can return
 */
export type NodeDesc = Node | string | number

/**
 * A child can be:
 * - A DOM node
 * - A reactive function that returns intermediate values
 * - An array of children (from .map() operations)
 */
export type Child = NodeDesc | (() => Intermediates) | Child[]

/**
 * Intermediate values - what functions return before final processing
 */
export type Intermediates = NodeDesc | NodeDesc[]

/**
 * Convert a value to a DOM Node
 * - If already a Node, return as-is
 * - If primitive (string/number), create text node
 */
function toNode(value: NodeDesc, already?: Node): Node | false {
	if (!value && typeof value !== 'number') return false
	if (value instanceof Node) {
		return unwrap(value)
	}
	if (already && already instanceof Text) {
		already.nodeValue = String(value)
		return already
	}
	return document.createTextNode(String(value))
}

/**
 * Process children arrays, handling various child types including:
 * - Direct nodes
 * - Reactive functions
 * - Arrays of children
 * - Variable arrays from .map() operations
 *
 * Returns a flat array of DOM nodes suitable for replaceChildren()
 */
export function processChildren(
	children: Child[],
	context: Record<PropertyKey, any>
): Node[] & { cleanup?: () => void } {
	if (!children || children.length === 0) {
		return []
	}
	function mounted(x: any) {
		return x && typeof x === 'object' && 'mount' in x ? x.mount(context) : x
	}
	return untracked(() => {
		const perChild = computed.map(children, ({ value: child }) =>
			typeof child === 'function' ? computed(child) : child
		)
		const mountedChildren: (Node | false | (Node | false)[])[] & { cleanup?: () => void } =
			computed.map(perChild, ({ value: partial }, already) =>
				Array.isArray(partial)
					? processChildren(partial, context)
					: toNode(mounted(partial), already as Node | undefined)
			)
		// Second loop: Flatten the temporary results into final Node[]
		const flattened: Node[] = reactive([])
		const cleanup = namedEffect('processChildren', () => {
			flattened.length = 0
			for (const item of mountedChildren) {
				if (Array.isArray(item)) {
					flattened.push(...(item.filter(Boolean) as Node[]))
				} else if (item) {
					flattened.push(item)
				}
			}
		})
		Object.defineProperty(flattened, 'cleanup', {
			value: () => {
				//* Like for `computed(child) -> doesn't render on add/remove anymore
				perChild.cleanup?.()
				for (const item of mountedChildren) {
					if (typeof item === 'object' && 'cleanup' in item && typeof item.cleanup === 'function')
						item.cleanup?.()
				}
				mountedChildren.cleanup?.()
				//*/
				cleanup()
			},
		})
		return flattened
	})
}
