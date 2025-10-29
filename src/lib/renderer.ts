import { atomic, computed, effect, reactive, unwrap } from 'mutts/src'
import { classNames } from './classNames'
import { namedEffect } from './debug'
import { getComponent } from './registry'
import { array, propsInto } from './utils'

export interface ComponentOptions {
	context: Record<PropertyKey, any>
}
const logRender = (() => false)() ? console.log : () => {}

/**
 * Custom h() function for JSX rendering - returns a mount function
 */
export const h = (tag: any, props: Record<string, any> = {}, ...children: Child[]): JSX.Element => {
	// Get component constructor - either direct class or from registry
	let componentCtor: any = null

	if (typeof tag === 'function') {
		// Direct component class (PascalCase)
		componentCtor = tag
	} else if (typeof tag === 'string' && getComponent(tag)) {
		// Registered component
		componentCtor = getComponent(tag)!
	}

	// If we have a component, return mount function
	if (componentCtor) {
		// Effect for styles - only updates style container
		return {
			render(context: Record<PropertyKey, any> = {}) {
				logRender('render component', componentCtor.name)
				const givenProps = reactive(propsInto(props, { children }))
				// Set context on the component instance
				const childContext = Object.create(context)
				const rendered = array.computed(function renderEffect() {
					let elements = componentCtor(givenProps, childContext)
					if ('render' in elements) elements = elements.render(childContext)
					if (!Array.isArray(elements)) elements = [elements]
					return processChildren(elements, childContext)
				})

				return rendered
			},
		}
	}

	const element = document.createElement(tag === 'debug' ? 'div' : tag)
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
			namedEffect(`event:${key}`, () => {
				const registeredEvent = atomic(value.get?.() ?? value())
				element.addEventListener(eventType, registeredEvent)
				return () => element.removeEventListener(eventType, registeredEvent)
			})
		} else if (key === 'class') {
			if (typeof value === 'function') {
				// Reactive class (e.g., `class={() => ['btn', { active: this.isActive }]}`)
				effect(function className() {
					element.className = classNames(value())
				})
			} else {
				// Static class
				element.className = classNames(value)
			}
		} else if (typeof value === 'object' && value !== null && 'get' in value && 'set' in value) {
			// 2-way binding for regular elements (e.g., `value={{get: () => this.value, set: val => this.value = val}}`)
			namedEffect(`prop:${key}`, () => {
				element[key] = value.get()
			})
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
			namedEffect(`prop:${key}`, () => {
				element[key] = value()
			})
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
		render(context: Record<PropertyKey, any> = {}) {
			logRender('render tag', tag)
			effect(function mountChildren() {
				// Render children
				if (children && children.length > 0 && !props?.innerHTML) {
					// Process new children
					const processedChildren = processChildren(children, context)
					effect(function redraw() {
						// Replace children
						reconcileChildren(element, processedChildren)
					})
				}
			})

			return element
		},
	}
}

// Optional: Add JSX support for fragments
const Fragment = (props: { children: Child[] }) => props.children
// Make h available globally
Object.assign(globalThis, { h, Fragment })

export function reconcileChildren(parent: Node, newChildren: Node | Node[] | undefined) {
	logRender('%creconcileChildren', 'color: red; font-weight: bold;', parent, newChildren)
	// No need to precompute oldChildren as an array; work with live DOM
	let newIndex = 0
	if (!newChildren) newChildren = []
	if (!Array.isArray(newChildren)) newChildren = [newChildren]

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
export type Child = NodeDesc | (() => Intermediates) // | Child[]

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
export function processChildren(children: Child[], context: Record<PropertyKey, any>): Node[] {
	function rendered(x: any) {
		return x && typeof x === 'object' && 'render' in x ? x.render(context) : x
	}
	const perChild = computed.memo(children, (child) =>
		rendered(typeof child === 'function' ? child() : child)
	)
	const mountedChildren: (Node | false | (Node | false)[])[] = computed.memo(perChild, (partial) =>
		Array.isArray(partial) ? processChildren(partial, context) : toNode(partial)
	)
	// Second loop: Flatten the temporary results into final Node[]
	const flattened: Node[] = reactive([])
	effect(function flattenChildren() {
		flattened.length = 0
		for (const item of mountedChildren) {
			if (Array.isArray(item)) {
				flattened.push(...(item.filter(Boolean) as Node[]))
			} else if (item) {
				flattened.push(item)
			}
		}
	})
	return flattened
}
