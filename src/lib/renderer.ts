import { atomic, effect, isNonReactive, mapped, memoize, reactive, unwrap } from 'mutts/src'
import { classNames } from './classNames'
import { namedEffect, testing } from './debug'
import { styles } from './styles'
import { propsInto } from './utils'

export const rootScope = reactive(Object.create(null, { _: { value: true } }))

function listen(
	target: EventTarget,
	type: string,
	listener: EventListenerOrEventListenerObject,
	options?: boolean | AddEventListenerOptions
) {
	testing.renderingEvent?.('add event listener', target, type, listener, options)
	target.addEventListener(type, listener, options)
	return () => {
		testing.renderingEvent?.('remove event listener', target, type, listener, options)
		target.removeEventListener(type, listener, options)
	}
}

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
	// If we were given a component function directly, render it
	if (typeof tag === 'function') {
		const componentCtor = tag
		// Effect for styles - only updates style container
		const mountObject: any = {
			render(scope: Record<PropertyKey, any> = rootScope) {
				testing.renderingEvent?.('render component', componentCtor.name)
				const givenProps = reactive(propsInto(regularProps, { children }))
				// Set scope on the component instance
				const childScope = reactive(Object.create(scope))
				const rendered = componentCtor(givenProps, childScope)
				return processChildren(Array.isArray(rendered) ? rendered : [rendered], childScope)

				//return rendered
			},
		}
		return Object.assign(mountObject, collectedCategories)
	}

	testing.renderingEvent?.('create element', tag)
	const element = document.createElement(tag === 'debug' ? 'div' : tag)
	if (tag === 'input') {
		props.type ??= 'text'
		if (typeof props.type !== 'string')
			console.warn('input type must be a constant string', props.type)
	}
	function setHtmlProperty(key: string, value: any) {
		const normalizedKey = key.toLowerCase()
		if (value === undefined || value === false) {
			testing.renderingEvent?.('remove attribute', element, normalizedKey)
			element.removeAttribute(normalizedKey)
			return
		}
		const stringValue = String(value)
		testing.renderingEvent?.('set attribute', element, normalizedKey, stringValue)
		if (normalizedKey in element) element[normalizedKey] = stringValue
		else if (key in element) element[key] = stringValue
		else element.setAttribute(normalizedKey, stringValue)
	}
	function applyStyleProperties(computedStyles: Record<string, any>) {
		element.removeAttribute('style')
		testing.renderingEvent?.('assign style', element, computedStyles)
		Object.assign(element.style, computedStyles)
	}
	// Set properties
	for (const [key, value] of Object.entries(regularProps || {})) {
		if (key === 'children') continue // Skip children, we'll handle them separately

		if (/^on[A-Z]/.test(key)) {
			// Event handler
			const eventType = key.slice(2).toLowerCase()
			namedEffect(`event:${key}`, () => {
				const handlerCandidate = value.get ? value.get() : value()
				if (handlerCandidate === undefined) return
				const registeredEvent = atomic(handlerCandidate)
				return listen(element, eventType, registeredEvent)
			})
		} else if (key === 'class') {
			if (typeof value === 'function') {
				// Reactive class (e.g., `class={() => ['btn', { active: this.isActive }]}`)
				effect(function className() {
					const nextClassName = classNames(value())
					testing.renderingEvent?.('set className', element, nextClassName)
					element.className = nextClassName
				})
			} else {
				// Static class
				const nextClassName = classNames(value)
				testing.renderingEvent?.('set className', element, nextClassName)
				element.className = nextClassName
			}
		} else if (key === 'style') {
			// Inline styles via styles() helper; supports objects, arrays, strings, and reactive functions
			if (typeof value === 'function') {
				effect(function styleEffect() {
					const computedStyles = styles(value())
					applyStyleProperties(computedStyles)
				})
			} else {
				const computedStyles = styles(value as any)
				applyStyleProperties(computedStyles)
			}
		} else if (typeof value === 'object' && value !== null && 'get' in value && 'set' in value) {
			// 2-way binding for regular elements (e.g., `value={{get: () => this.value, set: val => this.value = val}}`)
			namedEffect(`prop:${key}`, () => {
				setHtmlProperty(key, value.get())
			})
			if (tag === 'input') {
				switch (element.type) {
					case 'checkbox':
						if (key === 'checked')
							listen(element, 'input', () => {
								value.set(element.checked)
							})
						break
					case 'number':
					case 'range':
						if (key === 'value')
							listen(element, 'input', () => {
								value.set(Number(element.value))
							})
						break
					default:
						if (key === 'value')
							listen(element, 'input', () => {
								value.set(element.value)
							})
						break
				}
			}
		} else if (typeof value === 'function') {
			// Reactive prop (e.g., `prop={() => this.counter}`)
			namedEffect(`prop:${key}`, () => {
				setHtmlProperty(key, value())
			})
		} else if (key === 'innerHTML') {
			if (value !== undefined) {
				const htmlValue = String(value)
				testing.renderingEvent?.('set innerHTML', element, htmlValue)
				element.innerHTML = htmlValue
			}
		} else {
			// Regular attribute
			setHtmlProperty(key, value)
		}
	}

	// Create plain HTML element - also return mount object for consistency
	const mountObject: any = {
		render(scope: Record<PropertyKey, any> = rootScope) {
			// Render children
			if (children && children.length > 0 && !regularProps?.innerHTML) {
				// Process new children
				const processedChildren = processChildren(children, scope)
				bindChildren(element, processedChildren)
			}

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
export function For<T>(
	props: {
		each: T[]
		children: (item: T, oldItem?: JSX.Element) => JSX.Element
	},
	_scope: Record<PropertyKey, any>
) {
	const body = Array.isArray(props.children) ? props.children[0] : props.children
	const cb = body() as (item: T, oldItem?: JSX.Element) => JSX.Element
	const memoized = memoize(cb as (item: T & object) => JSX.Element)
	const array = isNonReactive(props.each)
		? props.each.map((item) => cb(item))
		: mapped(props.each, (item, _, oldItem?: JSX.Element) =>
				['object', 'symbol', 'function'].includes(typeof item)
					? memoized(item as T & object)
					: cb(item, oldItem)
			)
	return array
}
export const Fragment = (props: { children: JSX.Element[] }) => props.children
/*({
	render: (scope: Record<PropertyKey, any>) => processChildren(props.children, scope),
})*/

export function bindChildren(parent: Node, newChildren: Node | Node[] | undefined) {
	return effect(function redraw() {
		let added = 0
		let removed = 0
		// Replace children
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
						added++
						parent.insertBefore(newChild, oldChild)
						found = true
						break
					}
				}

				if (!found) {
					// Insert new node (or move from outside)
					added++
					parent.insertBefore(newChild, oldChild)
				}
				newIndex++
			}
		}

		// Remove extra old nodes (now safe because we're using live childNodes)
		while (parent.childNodes.length > newChildren.length) {
			removed++
			parent.removeChild(parent.lastChild!)
		}
		testing.renderingEvent?.(`reconcileChildren (+${added} -${removed})`, parent, newChildren)
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
export type Child = NodeDesc | (() => Intermediates) | JSX.Element | Child[]

/**
 * Intermediate values - what functions return before final processing
 */
export type Intermediates = NodeDesc | NodeDesc[]

const render = memoize((renderer: JSX.Element, scope: Record<PropertyKey, any>) => {
	function valued(to: any) {
		if (to === true) return undefined
		return memoize(to.get ?? to)()
	}
	function lax(given: any, to: any) {
		const compared = valued(to)
		return compared === undefined ? !!given : given === compared
	}
	if (renderer.if)
		for (const [key, value] of Object.entries(renderer.if) as [string, any])
			if (!lax(scope[key], value)) return false
	if (renderer.else)
		for (const [key, value] of Object.entries(renderer.else) as [string, any])
			if (lax(scope[key], value)) return false
	if (renderer.when)
		for (const [key, value] of Object.entries(renderer.when) as [string, any])
			if (!scope[key](value)) return false
	const partial = renderer.render(scope)
	if (renderer.this) {
		// Handle `this` meta: allow `this:component` to receive the component mount object
		renderer.this(partial)
	}
	if (renderer.use)
		for (const [key, value] of Object.entries(renderer.use) as [string, any])
			effect(() => {
				if (typeof scope[key] !== 'function') throw new Error(`${key} in scope is not a function`)
				return scope[key](partial, valued(value), scope)
			})
	return partial
})

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
	const perChild = mapped(children, (child, _index, old): Node | Node[] | false | undefined => {
		const renderer: any = typeof child === 'function' ? child() : child
		const dc = children
		let partial: Node | Node[] | false | undefined = renderer
		if (renderer && typeof renderer === 'object' && 'render' in renderer) {
			partial = render(renderer, scope)
		}
		if (!partial && typeof partial !== 'number') return
		if (Array.isArray(partial)) return processChildren(partial, scope)
		else if (partial instanceof Node) return unwrap(partial)
		else if (typeof partial === 'string' || typeof partial === 'number') {
			if (old instanceof Text) {
				const textContent = String(partial)
				testing.renderingEvent?.('update text node', old, textContent)
				old.textContent = textContent
				return old
			}

			const textNodeValue = String(partial)
			testing.renderingEvent?.('create text node', textNodeValue)
			return document.createTextNode(textNodeValue)
		}
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
