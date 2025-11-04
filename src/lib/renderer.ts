import { atomic, biDi, effect, isNonReactive, mapped, memoize, reactive, unwrap } from 'mutts/src'
import { classNames } from './classNames'
import { namedEffect, testing } from './debug'
import { styles } from './styles'
import { isElement, propsInto } from './utils'

export const rootScope = reactive(Object.create(null))

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

function valuedAttributeGetter(to: any) {
	if (to === true) return () => undefined
	if (typeof to === 'function') return memoize(to)
	if (typeof to === 'object' && 'get' in to) return memoize(to.get)
	return () => to
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
	const collectedCategories: Record<PropertyKey, any> = {}
	for (const [key, value] of Object.entries(props || {})) {
		switch (key) {
			case 'this': {
				const setComponent = value?.set
				if (typeof setComponent !== 'function')
					throw new Error('`this` attribute must be an L-value')
				collectedCategories.this = setComponent
				break
			}
			case 'else':
				if (value !== true) throw new Error('`else` attribute must not specify a value')
				collectedCategories.else = true
				break
			case 'if':
				Object.defineProperty(collectedCategories, 'condition', {
					get: valuedAttributeGetter(value),
					enumerable: true,
					configurable: true,
				})
				break
			case 'use':
				collectedCategories.mount = value
				break
			default: {
				const match = key.match(/^([^:]+):(.+)$/)
				if (match) {
					const [, category, name] = match
					collectedCategories[category] ??= {}
					Object.defineProperty(collectedCategories[category], name, {
						get: valuedAttributeGetter(value),
						enumerable: true,
						configurable: true,
					})
				} else {
					regularProps[key] = value
				}
			}
		}
	}
	let mountObject: any
	// If we were given a component function directly, render it
	if (typeof tag === 'function') {
		const componentCtor = tag
		// Effect for styles - only updates style container
		mountObject = {
			render(scope: Record<PropertyKey, any> = rootScope) {
				testing.renderingEvent?.('render component', componentCtor.name)
				const givenProps = reactive(propsInto(regularProps, { children }))
				// Set scope on the component instance
				const childScope = reactive(Object.create(scope))
				const rendered = componentCtor(givenProps, childScope)
				return processChildren(Array.isArray(rendered) ? rendered : [rendered], childScope)
			},
		}
	} else {
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
				const provide = biDi((v) => setHtmlProperty(key, v), value)
				if (tag === 'input') {
					switch (element.type) {
						case 'checkbox':
							if (key === 'checked') listen(element, 'input', () => provide(element.checked))
							break
						case 'number':
						case 'range':
							if (key === 'value') listen(element, 'input', () => provide(Number(element.value)))
							break
						default:
							if (key === 'value') listen(element, 'input', () => provide(element.value))
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
		mountObject = {
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
	}
	return Object.defineProperties(mountObject, Object.getOwnPropertyDescriptors(collectedCategories))
}
export function Scope(
	props: { children?: any; [key: string]: any },
	scope: Record<PropertyKey, any>
) {
	effect(function scopeEffect() {
		for (const [key, value] of Object.entries(props)) if (key !== 'children') scope[key] = value
	})
	return props.children
}
export function For<T>(
	props: {
		each: T[]
		children: (item: T, oldItem?: JSX.Element) => JSX.Element
	},
	scope: Record<PropertyKey, any>
) {
	const body = Array.isArray(props.children) ? props.children[0] : props.children
	const cb = body() as (item: T, oldItem?: JSX.Element) => JSX.Element
	const memoized = memoize(cb as (item: T & object) => JSX.Element)
	const array = isNonReactive(props.each)
		? props.each.map((item) => cb(item))
		: mapped(props.each, (item, index, output: readonly JSX.Element[]) =>
				['object', 'symbol', 'function'].includes(typeof item)
					? memoized(item as T & object)
					: cb(item, output[index])
			)
	return { render: () => processChildren(array, scope) }
}
export const Fragment = (props: { children: JSX.Element[] }, scope: Record<PropertyKey, any>) => ({
	render: () => processChildren(props.children, scope),
})

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
	const partial = renderer.render(scope)
	if (renderer.this)
		// Handle `this` meta: allow `this:component` to receive the component mount object
		renderer.this(partial)
	if (renderer.mount) renderer.mount(partial, scope)
	if (renderer.use)
		for (const [key, value] of Object.entries(renderer.use) as [string, any])
			effect(() => {
				if (typeof scope[key] !== 'function') throw new Error(`${key} in scope is not a function`)
				return scope[key](partial, value, scope)
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
export function processChildren(
	children: readonly Child[],
	scope: Record<PropertyKey, any>
): Node[] {
	const renderers = mapped(children, (child) => (typeof child === 'function' ? child() : child))
	const conditioned = mapped(renderers, (child, index, conditioned) => {
		if (
			isElement(child) &&
			('condition' in child || 'if' in child || 'when' in child || 'else' in child)
		) {
			if ('condition' in child && !child.condition) return false
			if (child.if)
				for (const [key, value] of Object.entries(child.if) as [string, any])
					if (scope[key] !== value) return false
			if (child.when)
				for (const [key, value] of Object.entries(child.when) as [string, any])
					if (!scope[key](value)) return false
			if (child.else) for (let p = 0; p < index; p++) if (conditioned[p] === true) return false
			return true
		}
	})
	const rendered = mapped(
		conditioned,
		(condition, index, rendered): Node | Node[] | false | undefined => {
			let partial = renderers[index]
			if (condition === false) return false
			if (isElement(partial)) partial = render(partial, scope)
			if (!partial && typeof partial !== 'number') return
			if (Array.isArray(partial)) return processChildren(partial, scope)
			else if (partial instanceof Node) return unwrap(partial)
			else if (typeof partial === 'string' || typeof partial === 'number') {
				const old = rendered[index]
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
		}
	)
	// Second loop: Flatten the temporary results into final Node[]
	const flattened: Node[] = reactive([])
	effect(function flattenChildren() {
		flattened.length = 0
		for (const item of rendered) {
			if (Array.isArray(item)) {
				flattened.push(...(item.filter(Boolean) as Node[]))
			} else if (item) {
				flattened.push(item)
			}
		}
	})
	return flattened
}
