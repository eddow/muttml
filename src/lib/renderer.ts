import { atomic, computed, effect, reactive, unwrap } from 'mutts/src'
import { classNames } from './classNames'
import { namedEffect } from './debug'
import { getComponent } from './registry'
import { styles } from './styles'
import { array, propsInto } from './utils'

const logRender = (() => false)() ? console.log : () => {}
const rootScope = reactive({ _: true })

/**
 * Custom h() function for JSX rendering - returns a mount function
 */
export const h = (
	tag: any,
	props: Record<string, any> = rootScope,
	...children: Child[]
): JSX.Element => {
	// Separate regular props from colon-grouped category props (e.g., "if:user")
	const regularProps: Record<string, any> = {}
	const collectedCategories: Record<string, any> = {}
	for (const [key, value] of Object.entries(props || {})) {
		if (key === 'this') {
			const setComponent = value?.set
			if (typeof setComponent !== 'function') throw new Error('`this` attribute must be an L-value')
			collectedCategories.this = setComponent
			continue
		}
		const match = ['if', 'else', 'when'].includes(key)
			? ['', key, '_']
			: key.match(/^([^:]+):(.+)$/)
		if (match) {
			const [, category, name] = match
			collectedCategories[category] ??= {}
			collectedCategories[category][name] = value
		} else {
			regularProps[key] = value
		}
	}
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
		const mountObject: any = {
			render(scope: Record<PropertyKey, any> = rootScope) {
				logRender('render component', componentCtor.name)
				const givenProps = reactive(propsInto(regularProps, { children }))
				// Set scope on the component instance
				const childScope = reactive(Object.create(scope))
				const rendered: any = array.computed(function renderEffect() {
					let elements = componentCtor(givenProps, childScope)
					//if ('render' in elements) elements = elements.render(childScope)
					if (!Array.isArray(elements)) elements = [elements]
					return elements
				})
				return processChildren(rendered, childScope)

				//return rendered
			},
		}
		return Object.assign(mountObject, collectedCategories)
	}

	const element = document.createElement(tag === 'debug' ? 'div' : tag)
	if (tag === 'input') {
		props.type ??= 'text'
		if (typeof props.type !== 'string')
			console.warn('input type must be a constant string', props.type)
	}
	// Set properties
	for (const [key, value] of Object.entries(regularProps || {})) {
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
		} else if (key === 'style') {
			// Inline styles via styles() helper; supports objects, arrays, strings, and reactive functions
			if (typeof value === 'function') {
				effect(function styleEffect() {
					const computed = styles(value())
					element.removeAttribute('style')
					Object.assign(element.style, computed)
				})
			} else {
				const computed = styles(value as any)
				element.removeAttribute('style')
				Object.assign(element.style, computed)
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
					case 'range':
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
		} else if (key === 'innerHTML') {
			element.innerHTML = String(value)
		} else {
			// Regular attribute
			element.setAttribute(key, String(value))
		}
	}

	// Create plain HTML element - also return mount object for consistency
	const mountObject: any = {
		render(scope: Record<PropertyKey, any> = rootScope) {
			logRender('render tag', tag)
			//effect(function mountChildren() {
			// Render children
			if (children && children.length > 0 && !regularProps?.innerHTML) {
				// Process new children
				const processedChildren = processChildren(children, scope)
				bindChildren(element, processedChildren)
			}
			//})

			return element
		},
	}
	return Object.assign(mountObject, collectedCategories)
}
export function Scope(
	props: { children?: any; [key: string]: any },
	scope: Record<PropertyKey, any>
) {
	effect(function scopeEffect() {
		if (!('_' in props)) scope._ = true
		for (const [key, value] of Object.entries(props)) if (key !== 'children') scope[key] = value
	})
	return props.children
}
export function For<T>(props: { each: T[]; children: (item: T, index?: number) => JSX.Element }) {
	const body = Array.isArray(props.children) ? props.children[0] : props.children
	const cb = body()
	return computed.memo(props.each, (item) => cb(item))
}
export const Fragment = (props: { children: Child[] }) => props.children

export function bindChildren(parent: Node, newChildren: Node | Node[] | undefined) {
	return effect(function redraw() {
		// Replace children
		logRender('%c reconcileChildren', 'color: red; font-weight: bold;', parent, newChildren)
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
	})
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
 * Process children arrays, handling various child types including:
 * - Direct nodes
 * - Reactive functions
 * - Arrays of children
 * - Variable arrays from .map() operations
 *
 * Returns a flat array of DOM nodes suitable for replaceChildren()
 */
export function processChildren(children: Child[], scope: Record<PropertyKey, any>): Node[] {
	const perChild = computed.memo(children, (child) => {
		const renderer: any = typeof child === 'function' ? child() : child
		let partial: any = renderer
		if (renderer && typeof renderer === 'object' && 'render' in renderer) {
			function lax(given: any, to: any) {
				if (to === true) return !!given
				const compared = computed(to.get ?? to)
				return given === compared
			}
			if ('if' in renderer)
				for (const [key, value] of Object.entries(renderer.if) as [string, any])
					if (!lax(scope[key], value)) return false
			if ('else' in renderer)
				for (const [key, value] of Object.entries(renderer.else) as [string, any])
					if (lax(scope[key], value)) return false
			if ('when' in renderer)
				for (const [key, value] of Object.entries(renderer.when) as [string, any])
					if (!scope[key](value)) return false
			partial = renderer.render(scope)
			// Handle `this` meta: allow `this:component` to receive the component mount object
			if ('this' in renderer) {
				renderer.this(partial)
			}
		}
		if (!partial && typeof partial !== 'number') return
		if (Array.isArray(partial)) return processChildren(partial, scope)
		else if (partial instanceof Node) return unwrap(partial)
		else if (typeof partial === 'string' || typeof partial === 'number')
			return document.createTextNode(String(partial))
	})
	// Second loop: Flatten the temporary results into final Node[]
	const flattened: Node[] = reactive([])
	effect(function flattenChildren() {
		flattened.length = 0
		for (const item of perChild) {
			if (Array.isArray(item)) {
				flattened.push(...(item.filter(Boolean) as Node[]))
			} else if (item) {
				flattened.push(item)
			}
		}
	})
	return flattened
}
