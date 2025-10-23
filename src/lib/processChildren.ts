import { computed, effect, reactive, unwrap } from 'mutts/src'

/**
 * A child can be:
 * - A DOM node
 * - A reactive function that returns intermediate values
 * - An array of children (from .map() operations)
 */
export type Child = Node | (() => Intermediates) | Child[]

/**
 * Node descriptor - what a function can return
 */
export type NodeDesc = Node | string | number

/**
 * Intermediate values - what functions return before final processing
 */
export type Intermediates = NodeDesc | NodeDesc[]

/**
 * Convert a value to a DOM Node
 * - If already a Node, return as-is
 * - If primitive (string/number), create text node
 */
function toNode(value: NodeDesc): Node {
	if (value instanceof Node) {
		return unwrap(value)
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
export function processChildren(children: Child[]): Node[] & { stop?: () => void } {
	if (!children || children.length === 0) {
		return []
	}
	const perChild = computed.map(children, (child) => {
		if (Array.isArray(child)) return processChildren(child)
		const partial = typeof child === 'function' ? child() : child
		return Array.isArray(partial) ? partial.map(toNode) : toNode(partial)
	})

	// Second loop: Flatten the temporary results into final Node[]
	const result: Node[] = reactive([])
	const stop = effect(() => {
		result.length = 0
		for (const item of perChild) {
			if (Array.isArray(item)) {
				result.push(...item)
			} else {
				result.push(item)
			}
		}
	})
	Object.defineProperty(result, 'stop', {
		get: () => stop,
	})
	return result
}
