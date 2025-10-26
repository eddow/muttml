import { computed, reactive, unwrap } from 'mutts/src'
import { namedEffect } from './debug'

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
	const perChild = computed.map(children, ({ value: child }) => {
		return Array.isArray(child)
			? processChildren(child, context)
			: typeof child === 'function'
				? // ! When `computed(child) -> doesn't render on add/remove anymore
					child()
				: child
	})
	const mountedChildren: (Node | false | (Node | false)[])[] & { cleanup?: () => void } =
		computed.map(perChild, ({ value: partial }, already) => {
			return Array.isArray(partial)
				? partial.map((p, i) => toNode(mounted(p), (already as Node[] | undefined)?.[i]))
				: toNode(mounted(partial), already as Node | undefined)
		})
	// Second loop: Flatten the temporary results into final Node[]
	const result: Node[] = reactive([])
	const cleanup = namedEffect('processChildren', () => {
		result.length = 0
		for (const item of mountedChildren) {
			if (Array.isArray(item)) {
				result.push(...(item.filter(Boolean) as Node[]))
			} else if (item) {
				result.push(item)
			}
		}
	})
	Object.defineProperty(result, 'cleanup', {
		value: () => {
			//* Like for `computed(child) -> doesn't render on add/remove anymore
			perChild.cleanup?.()
			mountedChildren.cleanup?.()
			//*/
			cleanup()
		},
	})
	return result
}
